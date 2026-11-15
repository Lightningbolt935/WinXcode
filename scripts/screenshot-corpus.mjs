#!/usr/bin/env node
/**
 * WinXcode Corpus Screenshot Runner
 *
 * Automates headless browser rendering and captures high-resolution screenshots
 * of the live Canvas preview for all 10 Corpus 1 apps and 10 Corpus 2 apps.
 *
 * Usage:
 *   1. Start the Vite dev server:
 *      cd XWinCode && npm run dev
 *   2. Run this script in another terminal:
 *      node scripts/screenshot-corpus.mjs
 */

import fs from "node:fs";
import path from "node:path";
import http from "node:http";

const ROOT = path.resolve(import.meta.dirname ? path.resolve(import.meta.dirname, "..") : ".");
const OUT_DIR = path.resolve(ROOT, "tests/screenshots");

fs.mkdirSync(OUT_DIR, { recursive: true });

const CORPUS1 = [
  { id: "01", name: "counter", file: "tests/corpus/01_counter/ContentView.swift" },
  { id: "02", name: "quiz", file: "tests/corpus/02_quiz/ContentView.swift" },
  { id: "03", name: "todo", file: "tests/corpus/03_todo/ContentView.swift" },
  { id: "04", name: "onboarding", file: "tests/corpus/04_onboarding/ContentView.swift" },
  { id: "05", name: "settings", file: "tests/corpus/05_settings/ContentView.swift" },
  { id: "06", name: "drawing", file: "tests/corpus/06_drawing/ContentView.swift" },
  { id: "07", name: "charts", file: "tests/corpus/07_charts/ContentView.swift" },
  { id: "08", name: "game", file: "tests/corpus/08_game/ContentView.swift" },
  { id: "09", name: "observable", file: "tests/corpus/09_observable/ContentView.swift" },
  { id: "10", name: "accessibility", file: "tests/corpus/10_accessibility/ContentView.swift" },
];

const CORPUS2 = [
  { id: "01", name: "food_truck", file: "tests/corpus2/01_food_truck/ContentView.swift" },
  { id: "02", name: "simple_news", file: "tests/corpus2/02_simple_news/ContentView.swift" },
  { id: "03", name: "simple_notes", file: "tests/corpus2/03_simple_notes/ContentView.swift" },
  { id: "04", name: "simple_scores", file: "tests/corpus2/04_simple_scores/ContentView.swift" },
  { id: "05", name: "simple_todo", file: "tests/corpus2/05_simple_todo/ContentView.swift" },
  { id: "06", name: "calculator", file: "tests/corpus2/06_calculator/ContentView.swift" },
  { id: "07", name: "capy_timer", file: "tests/corpus2/07_capy_timer/ContentView.swift" },
  { id: "08", name: "make_it_so", file: "tests/corpus2/08_make_it_so/ReminderDetailsView.swift" },
  { id: "09", name: "countries", file: "tests/corpus2/09_countries/CountriesListView.swift" },
  { id: "10", name: "control_room", file: "tests/corpus2/10_control_room/ContentView.swift" },
];

async function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1200, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function findDevServer() {
  if (process.env.APP_URL) return process.env.APP_URL;
  if (await checkPort(1420)) return "http://localhost:1420";
  if (await checkPort(5173)) return "http://localhost:5173";
  return null;
}

async function main() {
  console.log("=== WinXcode Corpus Screenshot Tool ===");
  console.log(`Output directory: ${OUT_DIR}`);

  const baseUrl = await findDevServer();
  if (!baseUrl) {
    console.error("\n[ERROR] Dev server is not running!");
    console.error("Please start the Vite dev server first:");
    console.error("  cd XWinCode");
    console.error("  npm run dev");
    console.error("Then re-run this script in another terminal.\n");
    process.exit(1);
  }
  console.log(`Connected to dev server: ${baseUrl}\n`);

  let playwright;
  try {
    playwright = await import("playwright");
  } catch (err) {
    console.error("\n[ERROR] Playwright is not installed.");
    console.error("Install it with:");
    console.error("  npm install -D playwright");
    console.error("  npx playwright install chromium\n");
    process.exit(1);
  }

  const { chromium } = playwright;
  console.log("Launching headless Chromium browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const results = [];

  async function capture(suiteName, item) {
    const outName = `${suiteName}_${item.id}_${item.name}.png`;
    const outPath = path.resolve(OUT_DIR, outName);
    const targetUrl = `${baseUrl}/?file=${encodeURIComponent(item.file)}`;

    process.stdout.write(`  [${suiteName.toUpperCase()}-${item.id}] ${item.name} ... `);

    try {
      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 15000 });

      // Wait for canvas stage or phone frame to be present
      await page.waitForSelector(".canvas-stage, .device-frame, .canvas-pane", { timeout: 10000 });

      // Allow reactive re-render & layout to settle
      await page.waitForTimeout(800);

      // Prefer capturing the canvas-stage or canvas-pane for complete view (including status & banners)
      const element = (await page.$(".canvas-stage")) || (await page.$(".canvas-pane")) || page;
      await element.screenshot({ path: outPath });

      const stats = fs.statSync(outPath);
      const sizeKb = (stats.size / 1024).toFixed(1);
      console.log(`OK (${sizeKb} KB) -> ${outName}`);
      results.push({ suite: suiteName, id: item.id, name: item.name, status: "OK", sizeKb, outName });
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      results.push({ suite: suiteName, id: item.id, name: item.name, status: "FAILED", error: err.message, outName });
    }
  }

  console.log("\n--- Suite 1: Corpus 1 (Student apps) ---");
  for (const item of CORPUS1) {
    await capture("corpus1", item);
  }

  console.log("\n--- Suite 2: Corpus 2 (Open-source apps) ---");
  for (const item of CORPUS2) {
    await capture("corpus2", item);
  }

  await browser.close();

  console.log("\n=== Screenshot Summary ===");
  const okCount = results.filter((r) => r.status === "OK").length;
  console.log(`Captured: ${okCount} / ${results.length} screenshots into tests/screenshots/\n`);
  console.log("Please inspect the generated images in tests/screenshots/ to verify visual rendering.");
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
