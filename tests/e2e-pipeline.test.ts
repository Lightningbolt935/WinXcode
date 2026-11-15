import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { parseSwift } from "../XWinCode/src/lib/preview/parser";
import { lex } from "../XWinCode/src/lib/preview/lexer";
import { Runtime } from "../XWinCode/src/lib/preview/runtime";
import type { ViewNode } from "../XWinCode/src/lib/preview/types";
import { validatePackage, type ProjectFile } from "../XWinCode/src/lib/validator/validator";

function countNodes(node: ViewNode | null): number {
  if (!node) return 0;
  const kids = [...(node.children ?? []), ...(node.label ?? [])];
  return 1 + kids.reduce((s, c) => s + countNodes(c), 0);
}

function loadTemplateFiles(templateDir: string): ProjectFile[] {
  const out: ProjectFile[] = [];
  function walk(dir: string, base: string) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
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
  walk(templateDir, "");
  return out;
}

describe("Headless End-to-End Pipeline: Template -> Preview -> Validator -> Export", () => {
  const templateDir = path.resolve(__dirname, "../templates/app-playground.swiftpm");

  it("Step 1 & 2: Template exists and ContentView renders with > 3 view nodes", () => {
    expect(fs.existsSync(templateDir)).toBe(true);

    const contentViewPath = path.join(templateDir, "ContentView.swift");
    expect(fs.existsSync(contentViewPath)).toBe(true);

    const source = fs.readFileSync(contentViewPath, "utf8");
    const ast = parseSwift(source, "ContentView.swift");
    expect(ast.errors).toHaveLength(0);

    const runtime = new Runtime();
    runtime.setFiles([{ path: "ContentView.swift", src: source }]);
    const targets = runtime.targets("ContentView.swift");
    expect(targets.length).toBeGreaterThan(0);

    const render = runtime.render("ContentView.swift", targets[0].key);

    expect(render).toBeDefined();
    expect(render.tree).not.toBeNull();

    const nodeCount = countNodes(render.tree);
    // Acceptance criterion: Fail test if template's ContentView does not render with > 3 nodes
    expect(nodeCount).toBeGreaterThan(3);
    expect(render.tree?.type).toBe("VStack");
  });

  it("Step 3: Validator passes template with zero failures and canExport === true", () => {
    const files = loadTemplateFiles(templateDir);
    expect(files.length).toBeGreaterThanOrEqual(4);

    const report = validatePackage(files);
    expect(report.summary.passed).toBe(true);
    expect(report.summary.canExport).toBe(true);
    expect(report.summary.failCount).toBe(0);

    // Critical structure checks must pass
    const structFails = report.checks.filter((c) => c.category === "structure" && c.status === "fail");
    expect(structFails).toHaveLength(0);
  });

  it("Step 4: Export packages clean zip and rejects all junk/build/git files", () => {
    const stageDir = path.resolve(__dirname, "fixtures/test_e2e_export_stage");
    if (fs.existsSync(stageDir)) fs.rmSync(stageDir, { recursive: true, force: true });
    fs.mkdirSync(stageDir, { recursive: true });

    const appDirName = "StudentE2EApp.swiftpm";
    const appDir = path.join(stageDir, appDirName);
    fs.mkdirSync(appDir, { recursive: true });

    // Copy template contents into staging directory
    function copyRecursive(src: string, dest: string) {
      for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, ent.name);
        const destPath = path.join(dest, ent.name);
        if (ent.isDirectory()) {
          fs.mkdirSync(destPath, { recursive: true });
          copyRecursive(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
    copyRecursive(templateDir, appDir);

    // Inject dirty junk and temporary files that MUST NOT leak into the final submission zip
    fs.mkdirSync(path.join(appDir, ".build/artifacts"), { recursive: true });
    fs.mkdirSync(path.join(appDir, ".git/refs"), { recursive: true });
    fs.mkdirSync(path.join(appDir, "User.xcuserdatad"), { recursive: true });
    fs.mkdirSync(path.join(appDir, "xcuserdata/Shared"), { recursive: true });

    fs.writeFileSync(path.join(appDir, ".DS_Store"), "ds-store-binary-data");
    fs.writeFileSync(path.join(appDir, ".build/artifacts/binary.o"), "build-object");
    fs.writeFileSync(path.join(appDir, ".git/HEAD"), "ref: refs/heads/main");
    fs.writeFileSync(path.join(appDir, "User.xcuserdatad/UserInterfaceState.xcuserstate"), "state");
    fs.writeFileSync(path.join(appDir, "xcuserdata/Shared/data.xml"), "shared");
    fs.writeFileSync(path.join(appDir, ".env"), "API_KEY=secret");
    fs.writeFileSync(path.join(appDir, "~temp_backup.swift"), "backup");

    const outZip = path.join(stageDir, "StudentE2EApp-Submission.zip");
    if (fs.existsSync(outZip)) fs.unlinkSync(outZip);

    // Hardened tar export command matching backend export_submission_zip
    const cmd = `tar -a -c -f "${outZip}" --exclude ".build" --exclude "*/.build" --exclude "*/.build/*" --exclude ".git" --exclude "*/.git" --exclude "*/.git/*" --exclude ".DS_Store" --exclude "*/.DS_Store" --exclude "*.xcuserdata" --exclude "*/*.xcuserdata" --exclude "*/*.xcuserdata/*" --exclude "xcuserdata" --exclude "*/xcuserdata" --exclude "*/xcuserdata/*" --exclude "*.xcuserdatad" --exclude "*/*.xcuserdatad" --exclude "*/*.xcuserdatad/*" --exclude "xcuserdatad" --exclude "*/xcuserdatad" --exclude "*/xcuserdatad/*" --exclude "*/.*" -C "${stageDir}" "${appDirName}"`;
    execSync(cmd);

    expect(fs.existsSync(outZip)).toBe(true);
    const stat = fs.statSync(outZip);
    expect(stat.size).toBeGreaterThan(500);

    // Extract zip into clean destination to inspect contents
    const extractDir = path.join(stageDir, "extracted");
    fs.mkdirSync(extractDir, { recursive: true });
    execSync(`tar -x -f "${outZip}" -C "${extractDir}"`);

    // Verify root directory inside zip
    const extractedEntries = fs.readdirSync(extractDir);
    expect(extractedEntries).toEqual([appDirName]);

    const extractedAppDir = path.join(extractDir, appDirName);
    const extractedFiles: string[] = [];
    function walkDir(dir: string, rel: string) {
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, ent.name);
        const relPath = rel ? `${rel}/${ent.name}` : ent.name;
        if (ent.isDirectory()) {
          walkDir(full, relPath);
        } else {
          extractedFiles.push(relPath);
        }
      }
    }
    walkDir(extractedAppDir, "");

    // Required files MUST exist
    expect(extractedFiles).toContain("Package.swift");
    expect(extractedFiles).toContain("App.swift");
    expect(extractedFiles).toContain("ContentView.swift");
    expect(extractedFiles).toContain("Assets.xcassets/Contents.json");
    expect(extractedFiles).toContain("ATTRIBUTIONS.md");

    // Acceptance criterion: Fail test if export contains junk files
    const junkPatterns = [
      ".build",
      ".git",
      ".DS_Store",
      "xcuserdata",
      "xcuserdatad",
      ".xcuserstate",
      ".env",
    ];

    for (const junk of junkPatterns) {
      const foundJunk = extractedFiles.filter((f) => f.includes(junk));
      expect(foundJunk, `Export zip should not contain any junk matching '${junk}'`).toHaveLength(0);
    }

    // Clean up temporary stage directory
    fs.rmSync(stageDir, { recursive: true, force: true });
  });
});
