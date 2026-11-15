import { describe, it, expect } from "vitest";
import { validatePackage, stripComments, ProjectFile } from "../XWinCode/src/lib/validator/validator";
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

  it("Ignores false positives: URLs in comments, strings that look like URLs, and SDK names in comments", () => {
    const validFiles = loadFixture("fixtures/valid_submission.swiftpm");
    // Add false positive candidates into ContentView.swift
    const noisyContentView = `
      import SwiftUI

      // Documentation: https://developer.apple.com/swift-student-challenge/
      /*
       Legacy notes:
       let oldEndpoint = "https://api.example.com/data"
       import FirebaseAuth
       import AuthenticationServices
       let tracker = ATTrackingManager()
      */
      struct ContentView: View {
        // Here is a string that looks like a URL but is purely local data/namespace
        let xmlSchema = "http://www.w3.org/2000/svg"
        let webNotice = "Visit http://mycoolgame.org for the web version"

        var body: some View {
          VStack {
            Text("Noisy Content")
            Text(xmlSchema)
            Text(webNotice)
          }
        }
      }
    `;

    const testFiles = validFiles.map((f) => (f.path === "ContentView.swift" ? { ...f, content: noisyContentView } : f));
    const report = validatePackage(testFiles);

    expect(report.summary.passed).toBe(true);
    expect(report.summary.canExport).toBe(true);
    expect(report.summary.failCount).toBe(0);
    const fails = report.checks.filter((c) => c.status === "fail");
    expect(fails).toEqual([]);
  });

  it("Detects false negatives: network calls wrapped in helper functions", () => {
    const validFiles = loadFixture("fixtures/valid_submission.swiftpm");
    const helperNetworkContentView = `
      import SwiftUI

      struct DataFetcher {
        func fetchRemotePayload(endpoint: String) {
          guard let url = URL(string: "https://api.myapp.com/v1") else { return }
          let request = URLRequest(url: url)
          let session = URLSession.shared
          session.dataTask(with: request).resume()
        }
      }

      struct ContentView: View {
        var body: some View {
          Text("Helper Network Test")
        }
      }
    `;

    const testFiles = validFiles.map((f) => (f.path === "ContentView.swift" ? { ...f, content: helperNetworkContentView } : f));
    const report = validatePackage(testFiles);

    expect(report.summary.passed).toBe(false);
    expect(report.summary.canExport).toBe(false);
    expect(report.summary.failCount).toBeGreaterThanOrEqual(1);

    const netFails = report.checks.filter((c) => c.category === "network" && c.status === "fail");
    expect(netFails.some((c) => c.name.includes("Network API") && c.file === "ContentView.swift")).toBe(true);
    expect(netFails.some((c) => c.name.includes("Remote HTTP URL") && c.file === "ContentView.swift")).toBe(true);
  });

  it("Attribution rule: WARNs without failing when non-code assets exist without ATTRIBUTIONS.md", () => {
    const validFiles = loadFixture("fixtures/valid_submission.swiftpm");
    // Add custom media file and remove ATTRIBUTIONS.md
    const filesWithMedia = validFiles
      .filter((f) => f.path !== "ATTRIBUTIONS.md")
      .concat({
        path: "Assets.xcassets/CustomHero.imageset/hero.png",
        content: "fake-png-binary-data",
        sizeBytes: 1024,
      });

    const report = validatePackage(filesWithMedia);

    // Warning should exist, but it must NOT fail the submission
    expect(report.summary.passed).toBe(true);
    expect(report.summary.canExport).toBe(true);
    expect(report.summary.failCount).toBe(0);
    expect(report.summary.warnCount).toBeGreaterThanOrEqual(1);

    const attribWarn = report.checks.find((c) => c.id === "attributions-missing");
    expect(attribWarn).toBeDefined();
    expect(attribWarn?.status).toBe("warn");
    expect(attribWarn?.message).toContain("https://developer.apple.com/swift-student-challenge/terms-and-conditions/");
  });

  it("Export hardening: archives into [Name].swiftpm root, excludes build/git/junk, and unzips cleanly", () => {
    const { execSync } = require("child_process");
    const testStageDir = path.resolve(__dirname, "fixtures/test_stage_export");
    if (fs.existsSync(testStageDir)) fs.rmSync(testStageDir, { recursive: true, force: true });

    const appDir = path.join(testStageDir, "ExportedStudentApp.swiftpm");
    fs.mkdirSync(path.join(appDir, "Assets.xcassets/AppIcon.appiconset"), { recursive: true });
    fs.mkdirSync(path.join(appDir, "Assets.xcassets/AccentColor.colorset"), { recursive: true });
    fs.mkdirSync(path.join(appDir, ".build/debug"), { recursive: true });
    fs.mkdirSync(path.join(appDir, ".git/objects"), { recursive: true });
    fs.mkdirSync(path.join(appDir, "User.xcuserdatad"), { recursive: true });

    // Valid required files
    fs.writeFileSync(path.join(appDir, "Package.swift"), "// swift-tools-version: 5.9\nimport PackageDescription\nimport AppleProductTypes\nlet package = Package(name: \"App\", products: [.iOSApplication(name: \"App\", targets: [\"AppModule\"])], targets: [.executableTarget(name: \"AppModule\", path: \".\")])");
    fs.writeFileSync(path.join(appDir, "App.swift"), "@main struct MyApp: App { var body: some Scene { WindowGroup {} } }");
    fs.writeFileSync(path.join(appDir, "ContentView.swift"), "struct ContentView: View { var body: some View { Text(\"Hi\") } }");
    fs.writeFileSync(path.join(appDir, "Assets.xcassets/Contents.json"), "{}");
    fs.writeFileSync(path.join(appDir, "Assets.xcassets/AppIcon.appiconset/Contents.json"), "{}");
    fs.writeFileSync(path.join(appDir, "Assets.xcassets/AccentColor.colorset/Contents.json"), "{}");

    // Dirty junk files that MUST be excluded
    fs.writeFileSync(path.join(appDir, ".DS_Store"), "ds-binary");
    fs.writeFileSync(path.join(appDir, ".build/debug/output.o"), "build-binary");
    fs.writeFileSync(path.join(appDir, ".git/HEAD"), "ref: refs/heads/main");
    fs.writeFileSync(path.join(appDir, "User.xcuserdatad/UserInterfaceState.xcuserstate"), "user-state");
    fs.writeFileSync(path.join(appDir, ".hidden_env"), "secret");

    const outZip = path.join(testStageDir, "ExportedStudentApp-Submission.zip");
    if (fs.existsSync(outZip)) fs.unlinkSync(outZip);

    // Run the hardened export command matching Rust's export_submission_zip
    const cmd = `tar -a -c -f "${outZip}" --exclude ".build" --exclude "*/.build" --exclude "*/.build/*" --exclude ".git" --exclude "*/.git" --exclude "*/.git/*" --exclude ".DS_Store" --exclude "*/.DS_Store" --exclude "*.xcuserdata" --exclude "*/*.xcuserdata" --exclude "*/*.xcuserdata/*" --exclude "*.xcuserdatad" --exclude "*/*.xcuserdatad" --exclude "*/*.xcuserdatad/*" --exclude "*/.*" -C "${testStageDir}" "ExportedStudentApp.swiftpm"`;
    execSync(cmd);
    expect(fs.existsSync(outZip)).toBe(true);

    // Unzip into clean destination
    const extractDir = path.join(testStageDir, "extracted");
    fs.mkdirSync(extractDir, { recursive: true });
    execSync(`tar -x -f "${outZip}" -C "${extractDir}"`);

    // Verify top-level structure: must be ExportedStudentApp.swiftpm/
    const extractedEntries = fs.readdirSync(extractDir);
    expect(extractedEntries).toEqual(["ExportedStudentApp.swiftpm"]);

    // Walk extracted directory and verify contents
    const extractedAppDir = path.join(extractDir, "ExportedStudentApp.swiftpm");
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

    // Assert expected files are present
    expect(extractedFiles).toContain("Package.swift");
    expect(extractedFiles).toContain("App.swift");
    expect(extractedFiles).toContain("ContentView.swift");
    expect(extractedFiles).toContain("Assets.xcassets/Contents.json");

    // Assert excluded files are NOT present
    expect(extractedFiles.some((f) => f.includes(".build"))).toBe(false);
    expect(extractedFiles.some((f) => f.includes(".git"))).toBe(false);
    expect(extractedFiles.some((f) => f.includes(".DS_Store"))).toBe(false);
    expect(extractedFiles.some((f) => f.includes(".xcuserdata"))).toBe(false);
    expect(extractedFiles.some((f) => f.includes(".xcuserdatad"))).toBe(false);
    expect(extractedFiles.some((f) => f.includes(".hidden"))).toBe(false);

    // Cleanup
    fs.rmSync(testStageDir, { recursive: true, force: true });
  });

  describe("String-literal aware comment stripping scanner", () => {
    it("handles trailing line comments after URLs in strings", () => {
      const input = 'let u = "https://example.com"  // trailing comment';
      const stripped = stripComments(input);
      expect(stripped).toContain('"https://example.com"');
      expect(stripped).not.toContain("trailing comment");
    });

    it("handles URL(string: ...) after a string containing //", () => {
      const input = 'let s = "// not a comment"; URL(string: "http://x")';
      const stripped = stripComments(input);
      expect(stripped).toContain('"// not a comment"');
      expect(stripped).toContain('URL(string: "http://x")');
    });

    it("handles escaped quotes inside string literals", () => {
      const input = 'let escaped = "Hello \\" // still inside string \\" World" // comment';
      const stripped = stripComments(input);
      expect(stripped).toContain('Hello \\" // still inside string \\" World');
      expect(stripped).not.toContain("comment");
    });

    it("handles multiline string literals containing comment delimiters", () => {
      const input = `let multiline = """
// this is not a comment
/* neither is this */
"""
// actual comment`;
      const stripped = stripComments(input);
      expect(stripped).toContain('// this is not a comment');
      expect(stripped).toContain('/* neither is this */');
      expect(stripped).not.toContain('actual comment');
    });

    it("handles nested block comments properly", () => {
      const input = '/* outer /* inner block */ still comment */ let valid = 1';
      const stripped = stripComments(input);
      expect(stripped).not.toContain('outer');
      expect(stripped).not.toContain('inner');
      expect(stripped).not.toContain('still comment');
      expect(stripped).toContain('let valid = 1');
    });

    it("correctly identifies real violations after strings containing // in validatePackage", () => {
      const validFiles = loadFixture("fixtures/valid_submission.swiftpm");
      const code = `
        import SwiftUI
        struct ContentView: View {
          let slash = "// path separator"
          func test() {
            let u = URL(string: "https://api.prohibited.com")
            let req = URLRequest(url: u!)
          }
          var body: some View { Text("Hi") }
        }
      `;
      const files = validFiles.map((f) => (f.path === "ContentView.swift" ? { ...f, content: code } : f));
      const report = validatePackage(files);
      expect(report.summary.passed).toBe(false);
      const netFails = report.checks.filter((c) => c.category === "network" && c.status === "fail");
      expect(netFails.some((c) => c.name.includes("Remote HTTP URL"))).toBe(true);
    });

    it("does not flag prohibited calls inside nested block comments", () => {
      const validFiles = loadFixture("fixtures/valid_submission.swiftpm");
      const code = `
        import SwiftUI
        /*
          Legacy code:
          /* nested comment */
          let u = URL(string: "https://api.prohibited.com")
          let req = URLRequest(url: u!)
          let session = URLSession.shared
        */
        struct ContentView: View {
          var body: some View { Text("Hi") }
        }
      `;
      const files = validFiles.map((f) => (f.path === "ContentView.swift" ? { ...f, content: code } : f));
      const report = validatePackage(files);
      const netFails = report.checks.filter((c) => c.category === "network" && c.status === "fail");
      expect(netFails).toHaveLength(0);
      expect(report.summary.passed).toBe(true);
    });
  });
});
