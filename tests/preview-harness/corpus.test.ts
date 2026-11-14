/**
 * WinXcode Headless Preview Harness
 *
 * Runs tests/corpus/ and tests/corpus2/ Swift files through the XWinCode
 * interpreter (lex → parse → evaluate) without Tauri, React, or a DOM.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join, resolve } from "path";
import { Runtime, type RenderResult } from "../../XWinCode/src/lib/preview/runtime";
import { parseSwift } from "../../XWinCode/src/lib/preview/parser";
import { lex } from "../../XWinCode/src/lib/preview/lexer";
import type { ViewNode } from "../../XWinCode/src/lib/preview/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CORPUS_DIR = resolve(__dirname, "../corpus");
const CORPUS2_DIR = resolve(__dirname, "../corpus2");
const OUT_DIR = resolve(__dirname, "out");
const OUT_CORPUS2_DIR = resolve(__dirname, "out/corpus2");

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(OUT_CORPUS2_DIR, { recursive: true });

interface HarnessResult {
  id: string;
  name: string;
  source?: string;
  license?: string;
  fileCount: number;
  level: "CLEAN" | "DEGRADED" | "FAILED";
  parseOk: boolean;
  parseErrors: { file: string; message: string; line: number }[];
  renderOk: boolean;
  renderError?: string;
  targets: string[];
  selectedTarget?: string;
  notes: string[];
  unsupportedNodes: string[];
  diagnosticCount: number;
  degradedCount: number;
  ignoredCount: number;
  stats: RenderResult["stats"] | null;
  treeDepth: number;
  viewNodeCount: number;
}

function collectUnsupported(node: ViewNode | null): string[] {
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

function treeDepth(node: ViewNode | null): number {
  if (!node) return 0;
  const kids = [...(node.children ?? []), ...(node.label ?? [])];
  return 1 + Math.max(0, ...kids.map(treeDepth));
}

function countNodes(node: ViewNode | null): number {
  if (!node) return 0;
  const kids = [...(node.children ?? []), ...(node.label ?? [])];
  return 1 + kids.reduce((s, c) => s + countNodes(c), 0);
}

// ---------------------------------------------------------------------------
// Manifests
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

const CORPUS2: { id: string; dir: string; name: string; source: string; license: string }[] = [
  { id: "01", dir: "01_food_truck",   name: "FoodTruck",   source: "Apple Inc. (sample-food-truck)", license: "Apple Sample Code (MIT-style)" },
  { id: "02", dir: "02_simple_news",  name: "SimpleNews",  source: "Paul Hudson (twostraws/simple-swiftui)", license: "MIT" },
  { id: "03", dir: "03_simple_notes", name: "SimpleNotes", source: "Paul Hudson (twostraws/simple-swiftui)", license: "MIT" },
  { id: "04", dir: "04_simple_scores",name: "SimpleScores",source: "Paul Hudson (twostraws/simple-swiftui)", license: "MIT" },
  { id: "05", dir: "05_simple_todo",  name: "SimpleToDo",  source: "Paul Hudson (twostraws/simple-swiftui)", license: "MIT" },
  { id: "06", dir: "06_calculator",   name: "Calculator",  source: "Swiftify (Calculator-SwiftUI)", license: "MIT" },
  { id: "07", dir: "07_capy_timer",   name: "CapyTimer",   source: "andev0x (CapyTimer)", license: "MIT" },
  { id: "08", dir: "08_make_it_so",   name: "MakeItSo",    source: "Peter Friese (MakeItSo)", license: "Apache-2.0" },
  { id: "09", dir: "09_countries",    name: "Countries",   source: "Alexey Naumov (clean-architecture-swiftui)", license: "MIT" },
  { id: "10", dir: "10_control_room", name: "ControlRoom", source: "Paul Hudson (ControlRoom)", license: "MIT" },
];

// ---------------------------------------------------------------------------
// Suite 1: Corpus 1 (Student apps)
// ---------------------------------------------------------------------------

const HARNESS_RESULTS: HarnessResult[] = [];

describe("Preview Harness — Corpus 1 (Student-style apps)", () => {
  for (const app of CORPUS) {
    it(`[Corpus1-${app.id}] ${app.name}`, () => {
      const src = readFileSync(join(CORPUS_DIR, app.dir, "ContentView.swift"), "utf-8");
      const fakePath = `corpus/${app.dir}/ContentView.swift`;

      let lexOk = true;
      let lexError: string | undefined;
      try {
        lex(src);
      } catch (e) {
        lexOk = false;
        lexError = e instanceof Error ? e.message : String(e);
      }

      let parseResult: ReturnType<typeof parseSwift>;
      try {
        parseResult = parseSwift(src, fakePath);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const result: HarnessResult = {
          id: app.id, name: app.name, fileCount: 1,
          parseOk: false, parseErrors: [{ file: "ContentView.swift", message: msg, line: 0 }],
          renderOk: false, renderError: "parse threw",
          targets: [], notes: [], unsupportedNodes: [], stats: null,
          treeDepth: 0, viewNodeCount: 0,
        };
        HARNESS_RESULTS.push(result);
        writeFileSync(join(OUT_DIR, `${app.id}.json`), JSON.stringify(result, null, 2));
        return;
      }

      const parseErrors = parseResult.errors.map(e => {
        const line = src.slice(0, e.pos).split("\n").length;
        return { file: "ContentView.swift", message: e.message, line };
      });

      const rt = new Runtime();
      rt.setFiles([{ path: fakePath, src }]);
      const targets = rt.targets(fakePath);

      let renderResult: RenderResult | null = null;
      let renderError: string | undefined;
      let renderOk = false;

      if (targets.length > 0) {
        try {
          renderResult = rt.render(fakePath, targets[0].key);
          renderOk = renderResult.errors.length === 0;
          if (!renderOk) renderError = renderResult.errors.map(d => d.message).join("; ");
        } catch (e) {
          renderError = e instanceof Error ? `${e.constructor.name}: ${e.message}` : String(e);
        }
      } else {
        renderError = "No preview targets found";
      }

      const unsupportedNodes = collectUnsupported(renderResult?.tree ?? null);
      const notes = renderResult ? [...renderResult.notes] : [];
      const degradedCount = notes.filter(n => n.startsWith("@degraded:")).length;
      const ignoredCount = notes.filter(n => n.startsWith("@ignored:")).length;
      const parseOk = parseErrors.length === 0;
      const diagnosticCount = parseErrors.length + (renderOk ? 0 : 1) + unsupportedNodes.length + notes.length;
      let level: "CLEAN" | "DEGRADED" | "FAILED" = "CLEAN";
      if (!parseOk || !renderOk || unsupportedNodes.length > 0) {
        level = "FAILED";
      } else if (diagnosticCount > 0) {
        level = "DEGRADED";
      }

      const hResult: HarnessResult = {
        id: app.id,
        name: app.name,
        fileCount: 1,
        level,
        parseOk,
        parseErrors,
        renderOk,
        renderError,
        targets: targets.map(t => t.key),
        selectedTarget: targets[0]?.key,
        notes,
        unsupportedNodes,
        diagnosticCount,
        degradedCount,
        ignoredCount,
        stats: renderResult?.stats ?? null,
        treeDepth: treeDepth(renderResult?.tree ?? null),
        viewNodeCount: countNodes(renderResult?.tree ?? null),
      };
      HARNESS_RESULTS.push(hResult);

      const fullDump = {
        ...hResult,
        tree: renderResult?.tree ?? null,
        allParseErrors: parseResult.errors,
      };
      writeFileSync(join(OUT_DIR, `${app.id}.json`), JSON.stringify(fullDump, null, 2));
      expect(lexOk, `lex failed: ${lexError}`).toBe(true);
    });
  }

  it("write corpus1 summary.json", () => {
    const summary = {
      timestamp: new Date().toISOString(),
      results: HARNESS_RESULTS.map(r => ({
        id: r.id,
        name: r.name,
        level: r.level,
        parseOk: r.parseOk,
        parseErrorCount: r.parseErrors.length,
        renderOk: r.renderOk,
        renderError: r.renderError,
        targetCount: r.targets.length,
        notes: r.notes,
        unsupportedNodes: r.unsupportedNodes,
        diagnosticCount: r.diagnosticCount,
        degradedCount: r.degradedCount,
        ignoredCount: r.ignoredCount,
        viewNodeCount: r.viewNodeCount,
        treeDepth: r.treeDepth,
        stats: r.stats,
      })),
    };
    writeFileSync(join(OUT_DIR, "summary.json"), JSON.stringify(summary, null, 2));
    expect(HARNESS_RESULTS.length).toBe(CORPUS.length);
  });
});

// ---------------------------------------------------------------------------
// Suite 2: Corpus 2 (External open-source apps)
// ---------------------------------------------------------------------------

const CORPUS2_RESULTS: HarnessResult[] = [];

describe("Preview Harness — Corpus 2 (External open-source apps)", () => {
  for (const app of CORPUS2) {
    it(`[Corpus2-${app.id}] ${app.name}`, () => {
      const appDir = join(CORPUS2_DIR, app.dir);
      const fileNames = readdirSync(appDir).filter(f => f.endsWith(".swift"));

      const files = fileNames.map(f => ({
        path: `corpus2/${app.dir}/${f}`,
        src: readFileSync(join(appDir, f), "utf-8"),
        name: f,
      }));

      const allParseErrors: { file: string; message: string; line: number }[] = [];

      for (const file of files) {
        try {
          lex(file.src);
        } catch (e) {
          allParseErrors.push({
            file: file.name,
            message: `Lex: ${e instanceof Error ? e.message : String(e)}`,
            line: 0,
          });
        }

        try {
          const parsed = parseSwift(file.src, file.path);
          for (const err of parsed.errors) {
            const line = file.src.slice(0, err.pos).split("\n").length;
            allParseErrors.push({ file: file.name, message: err.message, line });
          }
        } catch (e) {
          allParseErrors.push({
            file: file.name,
            message: `Parse: ${e instanceof Error ? e.message : String(e)}`,
            line: 0,
          });
        }
      }

      const rt = new Runtime();
      rt.setFiles(files.map(f => ({ path: f.path, src: f.src })));

      // Find targets across all files in this app
      let allTargets: { key: string; label: string; file: string }[] = [];
      for (const file of files) {
        const tgts = rt.targets(file.path);
        for (const t of tgts) {
          allTargets.push({ ...t, file: file.path });
        }
      }

      // Pick the primary view target (prefer ContentView, then preview:0, then first)
      let primaryTarget = allTargets.find(t => /ContentView/i.test(t.key) || /ContentView/i.test(t.label))
        ?? allTargets.find(t => t.key.startsWith("preview:"))
        ?? allTargets[0];

      let renderResult: RenderResult | null = null;
      let renderError: string | undefined;
      let renderOk = false;

      if (primaryTarget) {
        try {
          renderResult = rt.render(primaryTarget.file, primaryTarget.key);
          renderOk = renderResult.errors.length === 0;
          if (!renderOk) renderError = renderResult.errors.map(d => d.message).join("; ");
        } catch (e) {
          renderError = e instanceof Error ? `${e.constructor.name}: ${e.message}` : String(e);
        }
      } else {
        renderError = "No preview targets found in any files";
      }

      const unsupportedNodes = collectUnsupported(renderResult?.tree ?? null);
      const notes = renderResult ? [...renderResult.notes] : [];
      const degradedCount = notes.filter(n => n.startsWith("@degraded:")).length;
      const ignoredCount = notes.filter(n => n.startsWith("@ignored:")).length;
      const parseOk = allParseErrors.length === 0;
      const diagnosticCount = allParseErrors.length + (renderOk ? 0 : 1) + unsupportedNodes.length + notes.length;
      let level: "CLEAN" | "DEGRADED" | "FAILED" = "CLEAN";
      if (!parseOk || !renderOk || unsupportedNodes.length > 0) {
        level = "FAILED";
      } else if (diagnosticCount > 0) {
        level = "DEGRADED";
      }

      const hResult: HarnessResult = {
        id: app.id,
        name: app.name,
        source: app.source,
        license: app.license,
        fileCount: files.length,
        level,
        parseOk,
        parseErrors: allParseErrors,
        renderOk,
        renderError,
        targets: allTargets.map(t => `${t.file}:${t.key}`),
        selectedTarget: primaryTarget ? `${primaryTarget.file}:${primaryTarget.key}` : undefined,
        notes,
        unsupportedNodes,
        diagnosticCount,
        degradedCount,
        ignoredCount,
        stats: renderResult?.stats ?? null,
        treeDepth: treeDepth(renderResult?.tree ?? null),
        viewNodeCount: countNodes(renderResult?.tree ?? null),
      };
      CORPUS2_RESULTS.push(hResult);

      const fullDump = {
        ...hResult,
        tree: renderResult?.tree ?? null,
      };
      writeFileSync(join(OUT_CORPUS2_DIR, `${app.id}.json`), JSON.stringify(fullDump, null, 2));
    });
  }

  it("write corpus2 summary.json", () => {
    const summary = {
      timestamp: new Date().toISOString(),
      results: CORPUS2_RESULTS.map(r => ({
        id: r.id,
        name: r.name,
        source: r.source,
        license: r.license,
        fileCount: r.fileCount,
        level: r.level,
        parseOk: r.parseOk,
        parseErrorCount: r.parseErrors.length,
        renderOk: r.renderOk,
        renderError: r.renderError,
        selectedTarget: r.selectedTarget,
        notes: r.notes,
        unsupportedNodes: r.unsupportedNodes,
        diagnosticCount: r.diagnosticCount,
        degradedCount: r.degradedCount,
        ignoredCount: r.ignoredCount,
        viewNodeCount: r.viewNodeCount,
        treeDepth: r.treeDepth,
        stats: r.stats,
      })),
    };
    writeFileSync(join(OUT_CORPUS2_DIR, "summary.json"), JSON.stringify(summary, null, 2));
    expect(CORPUS2_RESULTS.length).toBe(CORPUS2.length);
  });
});
