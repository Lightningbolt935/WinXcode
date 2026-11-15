import { describe, it, expect } from "vitest";
import { validatePackage, ProjectFile } from "../XWinCode/src/lib/validator/validator";
import * as fs from "fs";
import * as path from "path";

function loadFixture(relPath: string): ProjectFile[] {
  const rootDir = path.resolve(__dirname, relPath);
  const out: ProjectFile[] = [];

  function walk(dir: string, base: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      const rel = path.join(base, ent.name).replace(/\\/g, "/");
      if (ent.isDirectory()) {
        walk(full, rel);
      } else {
        const content = fs.readFileSync(full, "utf8");
        const stat = fs.statSync(full);
        out.push({ path: rel, content, sizeBytes: stat.size });
      }
    }
  }

  walk(rootDir, "");
  return out;
}

describe("Swift Student Challenge Submission Validator", () => {
  it("Validates passing fixture cleanly with zero failures", () => {
    const files = loadFixture("fixtures/valid_submission.swiftpm");
    const report = validatePackage(files);

    expect(report.summary.passed).toBe(true);
    expect(report.summary.canExport).toBe(true);
    expect(report.summary.failCount).toBe(0);
    expect(report.summary.unverified).toBe(true);
    expect(report.summary.uiDisclaimer).toContain("Test on a real Mac if you can");

    // All categories should pass
    const fails = report.checks.filter((c) => c.status === "fail");
    expect(fails).toEqual([]);
  });

  it("Detects prohibited network APIs with file:line in failing_network fixture", () => {
    const files = loadFixture("fixtures/failing_network.swiftpm");
    const report = validatePackage(files);

    expect(report.summary.passed).toBe(false);
    expect(report.summary.canExport).toBe(false);
    expect(report.summary.failCount).toBeGreaterThanOrEqual(2);

    const netFails = report.checks.filter((c) => c.category === "network" && c.status === "fail");
    expect(netFails.some((c) => c.name.includes("URLSession") && c.file === "ContentView.swift")).toBe(true);
    expect(netFails.some((c) => c.name.includes("AsyncImage") && c.file === "ContentView.swift")).toBe(true);
  });

  it("Detects prohibited sign-in and tracking in failing_auth_analytics fixture", () => {
    const files = loadFixture("fixtures/failing_auth_analytics.swiftpm");
    const report = validatePackage(files);

    expect(report.summary.passed).toBe(false);
    expect(report.summary.canExport).toBe(false);
    expect(report.summary.failCount).toBeGreaterThanOrEqual(2);

    const authFails = report.checks.filter((c) => c.category === "auth_analytics" && c.status === "fail");
    expect(authFails.some((c) => c.name.includes("Sign-In") && c.file === "ContentView.swift")).toBe(true);
    expect(authFails.some((c) => c.name.includes("Tracking") && c.file === "ContentView.swift")).toBe(true);
  });

  it("Detects missing referenced asset in failing_missing_asset fixture", () => {
    const files = loadFixture("fixtures/failing_missing_asset.swiftpm");
    const report = validatePackage(files);

    expect(report.summary.passed).toBe(false);
    expect(report.summary.canExport).toBe(false);

    const assetFails = report.checks.filter((c) => c.category === "assets" && c.status === "fail");
    expect(assetFails.some((c) => c.name.includes("NonExistentHeroImage") && c.file === "ContentView.swift")).toBe(true);
  });

  it("Export refuses when project has validation failures", () => {
    const files = loadFixture("fixtures/failing_network.swiftpm");
    const report = validatePackage(files);
    expect(report.summary.canExport).toBe(false);
    expect(() => {
      if (!report.summary.canExport) {
        throw new Error(`Export refused: ${report.summary.failCount} critical failure(s).`);
      }
    }).toThrow(/Export refused/);
  });

  it("Export succeeds and creates valid zip when project passes all checks", () => {
    const files = loadFixture("fixtures/valid_submission.swiftpm");
    const report = validatePackage(files);
    expect(report.summary.canExport).toBe(true);

    const fixturePath = path.resolve(__dirname, "fixtures/valid_submission.swiftpm");
    const outZip = path.resolve(__dirname, "fixtures/test_export.zip");
    if (fs.existsSync(outZip)) fs.unlinkSync(outZip);

    const { execSync } = require("child_process");
    execSync(`tar -a -c -f "${outZip}" -C "${path.dirname(fixturePath)}" "${path.basename(fixturePath)}"`);
    expect(fs.existsSync(outZip)).toBe(true);
    const stat = fs.statSync(outZip);
    expect(stat.size).toBeGreaterThan(500);
    fs.unlinkSync(outZip);
  });
});
