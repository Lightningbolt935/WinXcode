/**
 * WinXcode Phase 0b — Headless Preview Harness
 *
 * Runs each tests/corpus/ Swift file through the XWinCode interpreter
 * (lex → parse → evaluate) without Tauri, React, or a DOM.
 *
 * The interpreter (lexer, parser, runtime, swiftui, values, colors) has
 * zero DOM/React/Tauri imports. The only external dep is `lucide-react`
 * in sf.ts, but sf.ts is only imported by PreviewRender.tsx (the React
 * renderer) — not by the interpreter core. No shim is needed.
 *
 * Output: tests/preview-harness/out/<app-id>.json per corpus app,
 *         plus tests/preview-harness/out/summary.json
 */

import { describe, it, expect } from "vitest";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { Runtime, type RenderResult } from "../../XWinCode/src/lib/preview/runtime";
import { parseSwift } from "../../XWinCode/src/lib/preview/parser";
import { lex } from "../../XWinCode/src/lib/preview/lexer";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CORPUS_DIR = resolve(__dirname, "../corpus");
const OUT_DIR = resolve(__dirname, "out");
mkdirSync(OUT_DIR, { recursive: true });

function readCorpusFile(dir: string): string {
  return readFileSync(join(CORPUS_DIR, dir, "ContentView.swift"), "utf-8");
}

interface HarnessResult {
  id: string;
  name: string;
  parseOk: boolean;
  parseErrors: { message: string; line: number }[];
  renderOk: boolean;
  renderError?: string;
  targets: string[];
  notes: string[];          // unknown-construct signals from runtime.notes
  unsupportedNodes: string[]; // view-tree nodes of type "Unsupported"
  stats: RenderResult["stats"] | null;
  treeDepth: number;
  viewNodeCount: number;
}

function collectUnsupported(node: import("../../XWinCode/src/lib/preview/types").ViewNode | null): string[] {
  if (!node) return [];
  const out: string[] = [];
  if (node.type === "Unsupported") {
    out.push((node.props as Record<string, unknown>)?.name as string ?? "Unsupported");
  }
  for (const child of [...(node.children ?? []), ...(node.label ?? [])]) {
    out.push(...collectUnsupported(child));
  }
  return out;
}

function treeDepth(node: import("../../XWinCode/src/lib/preview/types").ViewNode | null): number {
  if (!node) return 0;
  const kids = [...(node.children ?? []), ...(node.label ?? [])];
  return 1 + Math.max(0, ...kids.map(treeDepth));
}

function countNodes(node: import("../../XWinCode/src/lib/preview/types").ViewNode | null): number {
  if (!node) return 0;
  const kids = [...(node.children ?? []), ...(node.label ?? [])];
  return 1 + kids.reduce((s, c) => s + countNodes(c), 0);
}

// ---------------------------------------------------------------------------
// Corpus manifest
// ---------------------------------------------------------------------------

const CORPUS: { id: string; dir: string; name: string; keyConstructs: string }[] = [
  { id: "01", dir: "01_counter",      name: "Counter",     keyConstructs: "@State, Button, Text, VStack" },
  { id: "02", dir: "02_quiz",         name: "Quiz",        keyConstructs: "NavigationStack, NavigationLink, ProgressView" },
  { id: "03", dir: "03_todo",         name: "Todo",        keyConstructs: "List, ForEach, swipeActions, TextField" },
  { id: "04", dir: "04_onboarding",   name: "Onboarding",  keyConstructs: "TabView(.page), @AppStorage, .symbolEffect" },
  { id: "05", dir: "05_settings",     name: "Settings",    keyConstructs: "Form, Toggle, Picker, Slider, DatePicker" },
  { id: "06", dir: "06_drawing",      name: "Drawing",     keyConstructs: "Canvas, Path, DragGesture, GraphicsContext" },
  { id: "07", dir: "07_charts",       name: "Charts",      keyConstructs: "Chart, BarMark, LineMark, AreaMark" },
  { id: "08", dir: "08_game",         name: "Game",        keyConstructs: "TimelineView(.animation), Canvas, game loop" },
  { id: "09", dir: "09_observable",   name: "@Observable", keyConstructs: "@Observable macro, @Environment(Type.self), @Bindable" },
  { id: "10", dir: "10_accessibility",name: "A11y",        keyConstructs: "@ScaledMetric, .accessibilityAdjustableAction" },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const HARNESS_RESULTS: HarnessResult[] = [];

describe("Phase 0b — Preview interpreter corpus", () => {
  for (const app of CORPUS) {
    it(`[${app.id}] ${app.name} — lex + parse + render`, () => {
      const src = readCorpusFile(app.dir);
      const fakeFilePath = `corpus/${app.dir}/ContentView.swift`;

      // 1. Lex check (throws on error)
      let lexOk = true;
      let lexError: string | undefined;
      try {
        lex(src);
      } catch (e) {
        lexOk = false;
        lexError = e instanceof Error ? e.message : String(e);
      }

      // 2. Parse
      let parseResult: ReturnType<typeof parseSwift>;
      try {
        parseResult = parseSwift(src, fakeFilePath);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const result: HarnessResult = {
          id: app.id, name: app.name,
          parseOk: false,
          parseErrors: [{ message: msg, line: 0 }],
          renderOk: false, renderError: "parse threw",
          targets: [], notes: [], unsupportedNodes: [], stats: null,
          treeDepth: 0, viewNodeCount: 0,
        };
        HARNESS_RESULTS.push(result);
        writeFileSync(join(OUT_DIR, `${app.id}.json`), JSON.stringify(result, null, 2));
        // Don't fail the test on parse error — record and continue
        return;
      }

      const parseErrors = parseResult.errors.map(e => {
        // Convert byte pos to approx line number
        const upTo = src.slice(0, e.pos);
        const line = upTo.split("\n").length;
        return { message: e.message, line };
      });

      // 3. Runtime evaluation
      const rt = new Runtime();
      rt.setFiles([{ path: fakeFilePath, src }]);
      const targets = rt.targets(fakeFilePath);

      let renderResult: RenderResult | null = null;
      let renderError: string | undefined;
      let renderOk = false;

      if (targets.length > 0) {
        try {
          renderResult = rt.render(fakeFilePath, targets[0].key);
          renderOk = renderResult.errors.length === 0;
          if (!renderOk) renderError = renderResult.errors.map(d => d.message).join("; ");
        } catch (e) {
          renderError = e instanceof Error ? `${e.constructor.name}: ${e.message}` : String(e);
        }
      } else {
        renderError = "No preview targets found (no #Preview, View struct, or PreviewProvider)";
      }

      const unsupportedNodes = collectUnsupported(renderResult?.tree ?? null);
      const notes = renderResult ? [...renderResult.notes] : [];

      const hResult: HarnessResult = {
        id: app.id,
        name: app.name,
        parseOk: parseErrors.length === 0,
        parseErrors,
        renderOk,
        renderError,
        targets: targets.map(t => t.key),
        notes,
        unsupportedNodes,
        stats: renderResult?.stats ?? null,
        treeDepth: treeDepth(renderResult?.tree ?? null),
        viewNodeCount: countNodes(renderResult?.tree ?? null),
      };
      HARNESS_RESULTS.push(hResult);

      // Write individual JSON dump (includes full tree)
      const fullDump = {
        ...hResult,
        tree: renderResult?.tree ?? null,
        allParseErrors: parseResult.errors,
      };
      writeFileSync(join(OUT_DIR, `${app.id}.json`), JSON.stringify(fullDump, null, 2));

      // Expectations — we do NOT fail on render errors (Phase 0b is observation only)
      expect(lexOk, `[${app.id}] lex failed: ${lexError}`).toBe(true);
      // Parse is allowed to have errors — just check it doesn't throw
    });
  }

  // After all tests, write summary
  it("write summary.json", () => {
    const summary = {
      timestamp: new Date().toISOString(),
      results: HARNESS_RESULTS.map(r => ({
        id: r.id,
        name: r.name,
        parseOk: r.parseOk,
        parseErrorCount: r.parseErrors.length,
        renderOk: r.renderOk,
        renderError: r.renderError,
        targetCount: r.targets.length,
        noteCount: r.notes.length,
        notes: r.notes,
        unsupportedNodes: r.unsupportedNodes,
        viewNodeCount: r.viewNodeCount,
        treeDepth: r.treeDepth,
        stats: r.stats,
      })),
    };
    writeFileSync(join(OUT_DIR, "summary.json"), JSON.stringify(summary, null, 2));
    expect(HARNESS_RESULTS.length).toBe(CORPUS.length);
  });
});
