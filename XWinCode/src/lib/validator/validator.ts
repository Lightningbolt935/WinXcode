import structureConfig from "./structure.json";

export interface CheckItem {
  id: string;
  category: "structure" | "size" | "network" | "auth_analytics" | "assets" | "attributions";
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
  file?: string;
  line?: number;
}

export interface ValidationSummary {
  passed: boolean;
  canExport: boolean;
  totalChecks: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  estimatedZipBytes: number;
  maxZipBytes: number;
  unverified: boolean;
  statusNotice: string;
  uiDisclaimer: string;
}

export interface ValidationReport {
  summary: ValidationSummary;
  checks: CheckItem[];
}

export interface ProjectFile {
  path: string; // Relative path inside package e.g. "ContentView.swift"
  content: string;
  sizeBytes?: number;
}

export function stripComments(code: string): string {
  let out = "";
  let i = 0;
  const n = code.length;

  while (i < n) {
    // Check for multiline string literal """
    if (code[i] === '"' && code[i + 1] === '"' && code[i + 2] === '"') {
      out += '"""';
      i += 3;
      while (i < n) {
        if (code[i] === '\\' && i + 1 < n) {
          out += code[i] + code[i + 1];
          i += 2;
          continue;
        }
        if (code[i] === '"' && code[i + 1] === '"' && code[i + 2] === '"') {
          out += '"""';
          i += 3;
          break;
        }
        out += code[i];
        i++;
      }
      continue;
    }

    // Check for single-line string literal "
    if (code[i] === '"') {
      out += '"';
      i++;
      while (i < n) {
        if (code[i] === '\\' && i + 1 < n) {
          out += code[i] + code[i + 1];
          i += 2;
          continue;
        }
        if (code[i] === '"') {
          out += '"';
          i++;
          break;
        }
        if (code[i] === '\n') {
          // Unclosed string before newline
          break;
        }
        out += code[i];
        i++;
      }
      continue;
    }

    // Check for line comment //
    if (code[i] === '/' && code[i + 1] === '/') {
      while (i < n && code[i] !== '\n') {
        out += ' ';
        i++;
      }
      continue;
    }

    // Check for block comment /* (supports nested block comments)
    if (code[i] === '/' && code[i + 1] === '*') {
      let depth = 1;
      out += '  ';
      i += 2;
      while (i < n && depth > 0) {
        if (code[i] === '/' && code[i + 1] === '*') {
          depth++;
          out += '  ';
          i += 2;
          continue;
        }
        if (code[i] === '*' && code[i + 1] === '/') {
          depth--;
          out += '  ';
          i += 2;
          continue;
        }
        out += code[i] === '\n' ? '\n' : ' ';
        i++;
      }
      continue;
    }

    out += code[i];
    i++;
  }

  return out;
}

export function measureCompressedZipSize(files: ProjectFile[]): number {
  const g = globalThis as unknown as {
    process?: { versions?: { node?: string } };
    require?: (id: string) => any;
  };

  if (typeof g.process !== "undefined" && g.process?.versions?.node && typeof g.require === "function") {
    try {
      const fs = g.require("fs");
      const path = g.require("path");
      const os = g.require("os");
      const { execSync } = g.require("child_process");

      const tmpStage = path.join(os.tmpdir(), `winxcode_val_size_${Date.now()}_${Math.random().toString(36).slice(2)}`);
      const appDir = path.join(tmpStage, "App.swiftpm");
      fs.mkdirSync(appDir, { recursive: true });

      for (const f of files) {
        const dest = path.join(appDir, f.path);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, f.content ?? "");
      }

      const outZip = path.join(tmpStage, "measure.zip");
      execSync(
        `tar -a -c -f "${outZip}" --exclude ".build" --exclude "*/.build" --exclude "*/.build/*" --exclude ".git" --exclude "*/.git" --exclude "*/.git/*" --exclude ".DS_Store" --exclude "*/.DS_Store" --exclude "*.xcuserdata" --exclude "*/*.xcuserdata" --exclude "*/*.xcuserdata/*" --exclude "xcuserdata" --exclude "*/xcuserdata" --exclude "*/xcuserdata/*" --exclude "*.xcuserdatad" --exclude "*/*.xcuserdatad" --exclude "*/*.xcuserdatad/*" --exclude "xcuserdatad" --exclude "*/xcuserdatad" --exclude "*/xcuserdatad/*" --exclude "*/.*" -C "${tmpStage}" "App.swiftpm"`
      );
      const stat = fs.statSync(outZip);
      const size = stat.size;
      fs.rmSync(tmpStage, { recursive: true, force: true });
      return size;
    } catch {
      // Fallback if tar or temp dir unavailable
    }
  }

  let totalBytes = 0;
  for (const f of files) {
    totalBytes += f.sizeBytes ?? (typeof f.content === "string" ? new TextEncoder().encode(f.content).length : 0);
  }
  return Math.round(totalBytes * 0.7);
}

function getLineNumber(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

export function validatePackage(files: ProjectFile[]): ValidationReport {
  const checks: CheckItem[] = [];
  const fileMap = new Map<string, ProjectFile>();
  let totalBytes = 0;

  for (const f of files) {
    const norm = f.path.replace(/\\/g, "/").replace(/^\.\//, "");
    fileMap.set(norm, { ...f, path: norm });
    totalBytes += f.sizeBytes ?? (typeof f.content === "string" ? new TextEncoder().encode(f.content).length : 0);
  }

  // 1. Structure Checks (matches structure.json)
  const pkgManifest = fileMap.get("Package.swift");
  if (!pkgManifest) {
    checks.push({
      id: "struct-pkg-missing",
      category: "structure",
      name: "Package.swift Manifest",
      status: "fail",
      message: "Package.swift is missing from the root of the app playground.",
      file: "Package.swift",
    });
  } else {
    const content = pkgManifest.content;
    const lines = content.split("\n");
    // Check swift-tools-version
    const toolsLineIdx = lines.findIndex((l) => l.includes("swift-tools-version:"));
    if (toolsLineIdx === -1) {
      checks.push({
        id: "struct-tools-version",
        category: "structure",
        name: "Swift Tools Version Header",
        status: "fail",
        message: "First line must declare '// swift-tools-version: 5.9' (or compatible).",
        file: "Package.swift",
        line: 1,
      });
    } else {
      checks.push({
        id: "struct-tools-version",
        category: "structure",
        name: "Swift Tools Version Header",
        status: "pass",
        message: `Found valid tools declaration: ${lines[toolsLineIdx].trim()}`,
        file: "Package.swift",
        line: toolsLineIdx + 1,
      });
    }

    // Check imports
    for (const reqImport of structureConfig.manifest.requiredImports) {
      const impRegex = new RegExp(`\\bimport\\s+${reqImport}\\b`);
      const impIdx = lines.findIndex((l) => impRegex.test(l));
      if (impIdx === -1) {
        checks.push({
          id: `struct-import-${reqImport}`,
          category: "structure",
          name: `Required Import: ${reqImport}`,
          status: "fail",
          message: `Package.swift must import '${reqImport}' for App Playground support.`,
          file: "Package.swift",
        });
      } else {
        checks.push({
          id: `struct-import-${reqImport}`,
          category: "structure",
          name: `Required Import: ${reqImport}`,
          status: "pass",
          message: `Found import ${reqImport}`,
          file: "Package.swift",
          line: impIdx + 1,
        });
      }
    }

    // Check product type .iOSApplication
    const prodIdx = lines.findIndex((l) => l.includes(".iOSApplication"));
    if (prodIdx === -1) {
      checks.push({
        id: "struct-ios-application",
        category: "structure",
        name: "Product Type .iOSApplication",
        status: "fail",
        message: "App Playground must configure an .iOSApplication product target.",
        file: "Package.swift",
      });
    } else {
      checks.push({
        id: "struct-ios-application",
        category: "structure",
        name: "Product Type .iOSApplication",
        status: "pass",
        message: "Found .iOSApplication product declaration.",
        file: "Package.swift",
        line: prodIdx + 1,
      });
    }
  }

  // Check required files
  for (const reqFile of structureConfig.requiredFiles) {
    if (reqFile === "Package.swift") continue;
    if (fileMap.has(reqFile)) {
      checks.push({
        id: `struct-file-${reqFile.replace(/[^a-zA-Z0-9]/g, "_")}`,
        category: "structure",
        name: `Required File: ${reqFile}`,
        status: "pass",
        message: `Found required file ${reqFile}`,
        file: reqFile,
      });
    } else {
      checks.push({
        id: `struct-file-${reqFile.replace(/[^a-zA-Z0-9]/g, "_")}`,
        category: "structure",
        name: `Required File: ${reqFile}`,
        status: "fail",
        message: `Missing required file: ${reqFile}`,
        file: reqFile,
      });
    }
  }

  // 2. Package Size Check (real compressed ZIP measurement)
  const realZip = measureCompressedZipSize(files);
  if (realZip > structureConfig.maxZipSizeBytes) {
    checks.push({
      id: "size-limit",
      category: "size",
      name: "Package Archive Size",
      status: "fail",
      message: `Package compressed ZIP size (${(realZip / (1024 * 1024)).toFixed(2)} MB) exceeds Apple's 500 MB submission limit!`,
    });
  } else if (realZip > structureConfig.warnZipSizeBytes) {
    checks.push({
      id: "size-limit",
      category: "size",
      name: "Package Archive Size",
      status: "warn",
      message: `Package compressed ZIP size (${(realZip / (1024 * 1024)).toFixed(2)} MB) is large; ensure all large assets are necessary.`,
    });
  } else {
    checks.push({
      id: "size-limit",
      category: "size",
      name: "Package Archive Size",
      status: "pass",
      message: `Package compressed ZIP size (${(realZip / (1024 * 1024)).toFixed(2)} MB) is well within the 500 MB limit.`,
    });
  }

  // Discover asset names present in Assets.xcassets
  const knownAssets = new Set<string>();
  for (const [path] of fileMap.entries()) {
    const match = path.match(/Assets\.xcassets\/([^/]+)\.(imageset|appiconset|colorset)/);
    if (match) knownAssets.add(match[1]);
  }

  let hasCustomMedia = false;
  for (const [path] of fileMap.entries()) {
    if (/\.(png|jpg|jpeg|wav|mp3|m4a|usdz|json|csv|txt)$/i.test(path) && !path.startsWith("Assets.xcassets/AppIcon") && !path.startsWith("Assets.xcassets/AccentColor")) {
      hasCustomMedia = true;
    }
  }

  // 3, 4, 5. Scan Swift source files using multiline tokenizer
  const swiftFiles = Array.from(fileMap.values()).filter((f) => f.path.endsWith(".swift") && f.path !== "Package.swift");
  for (const sf of swiftFiles) {
    const stripped = stripComments(sf.content);

    // Rule 3: Network calls (URLSession, NWPathMonitor, etc.)
    const netApiRegex = /\b(URLSession|URLSessionConfiguration|URLRequest|NWPathMonitor|NWConnection|WebSocketTask)\b/g;
    let match: RegExpExecArray | null;
    while ((match = netApiRegex.exec(stripped)) !== null) {
      const apiName = match[1];
      const lineNum = getLineNumber(stripped, match.index);
      checks.push({
        id: `net-api-${sf.path}-${lineNum}`,
        category: "network",
        name: `Network API (${apiName})`,
        status: "fail",
        message: `Submissions are judged offline. Prohibited network connectivity API detected (${apiName}).`,
        file: sf.path,
        line: lineNum,
      });
    }

    // Multiline URL(string: "http://...") tokenizer
    const urlRegex = /\bURL\s*\(\s*string\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g;
    while ((match = urlRegex.exec(stripped)) !== null) {
      const urlVal = match[1];
      const lineNum = getLineNumber(stripped, match.index);
      if (/^https?:\/\//i.test(urlVal)) {
        checks.push({
          id: `net-remote-url-${sf.path}-${lineNum}`,
          category: "network",
          name: "Remote HTTP URL",
          status: "fail",
          message: "Submissions must not depend on remote servers. Hardcoded HTTP/HTTPS URL detected in URL(string:).",
          file: sf.path,
          line: lineNum,
        });
      }
    }

    // Multiline AsyncImage(url: URL(string: "http..."))
    const asyncImgRegex = /\bAsyncImage\s*\(\s*url\s*:\s*URL\s*\(\s*string\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g;
    while ((match = asyncImgRegex.exec(stripped)) !== null) {
      const urlVal = match[1];
      const lineNum = getLineNumber(stripped, match.index);
      if (/^https?:\/\//i.test(urlVal)) {
        checks.push({
          id: `net-asyncimage-${sf.path}-${lineNum}`,
          category: "network",
          name: "Remote AsyncImage",
          status: "fail",
          message: "AsyncImage with remote URL will fail offline. Bundle image assets locally.",
          file: sf.path,
          line: lineNum,
        });
      }
    }

    // WKWebView
    const wkRegex = /\bWKWebView\b/g;
    while ((match = wkRegex.exec(stripped)) !== null) {
      const lineNum = getLineNumber(stripped, match.index);
      checks.push({
        id: `net-wkwebview-${sf.path}-${lineNum}`,
        category: "network",
        name: "WKWebView Usage",
        status: "warn",
        message: "WKWebView detected. Verify that it only loads bundled local HTML and assets.",
        file: sf.path,
        line: lineNum,
      });
    }

    // Rule 4: Sign-In / Auth SDKs
    const authRegex = /\b(import\s+AuthenticationServices|SignInWithAppleButton|FirebaseAuth|AWSMobileClient|Amplify\.Auth)\b/g;
    while ((match = authRegex.exec(stripped)) !== null) {
      const lineNum = getLineNumber(stripped, match.index);
      checks.push({
        id: `auth-gate-${sf.path}-${lineNum}`,
        category: "auth_analytics",
        name: "Sign-In / Authentication Gate",
        status: "fail",
        message: "Apple strictly prohibits sign-in gates. Apps requiring login will be disqualified.",
        file: sf.path,
        line: lineNum,
      });
    }

    // Rule 5: Tracking / Analytics Telemetry
    const trackRegex = /\b(import\s+FirebaseAnalytics|Mixpanel|Amplitude|AppTrackingTransparency|ATTrackingManager|FacebookCore|GoogleAnalytics)\b/g;
    while ((match = trackRegex.exec(stripped)) !== null) {
      const lineNum = getLineNumber(stripped, match.index);
      checks.push({
        id: `tracking-${sf.path}-${lineNum}`,
        category: "auth_analytics",
        name: "Tracking / Analytics Telemetry",
        status: "fail",
        message: "Judge tracking/telemetry code is explicitly prohibited by Apple Challenge terms.",
        file: sf.path,
        line: lineNum,
      });
    }

    // Rule 6: Missing Assets Referenced in Code (multiline Image("...") tokenizer)
    const imgRegex = /\bImage\s*\(\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*[\),]/g;
    while ((match = imgRegex.exec(stripped)) !== null) {
      const refName = match[1];
      const lineNum = getLineNumber(stripped, match.index);
      if (!knownAssets.has(refName)) {
        checks.push({
          id: `asset-missing-${sf.path}-${lineNum}`,
          category: "assets",
          name: `Missing Asset: "${refName}"`,
          status: "fail",
          message: `Referenced image "${refName}" not found in Assets.xcassets catalog.`,
          file: sf.path,
          line: lineNum,
        });
      }
    }
  }

  // Pass marker for network if no network errors
  if (!checks.some((c) => c.category === "network")) {
    checks.push({
      id: "net-offline-ok",
      category: "network",
      name: "Offline Operation",
      status: "pass",
      message: "No prohibited remote network calls or URLSessions detected. App runs offline.",
    });
  }

  // Pass marker for auth & analytics if clean
  if (!checks.some((c) => c.category === "auth_analytics")) {
    checks.push({
      id: "auth-clean-ok",
      category: "auth_analytics",
      name: "No Sign-In or Judge Tracking",
      status: "pass",
      message: "No authentication gates or tracking telemetry detected.",
    });
  }

  // Pass marker for assets if no missing assets
  if (!checks.some((c) => c.category === "assets")) {
    checks.push({
      id: "assets-referenced-ok",
      category: "assets",
      name: "Referenced Assets",
      status: "pass",
      message: "All code-referenced assets exist in the package catalog.",
    });
  }

  // Rule 7: Attributions Document
  const hasAttributions = fileMap.has("ATTRIBUTIONS.md") || fileMap.has("ATTRIBUTIONS.txt") || fileMap.has("Credits.swift");
  if (hasCustomMedia && !hasAttributions) {
    checks.push({
      id: "attributions-missing",
      category: "attributions",
      name: "Third-Party Media Attribution",
      status: "warn",
      message: "Non-code media assets detected without ATTRIBUTIONS.md or Credits.swift. Apple rule: 'You may include third-party open source code and public domain or Creative Commons-licensed images, sounds, or other media, provided you credit the source and explain why it was used.' (https://developer.apple.com/swift-student-challenge/terms-and-conditions/). If all assets are 100% original, this warning can be safely ignored.",
      file: "ATTRIBUTIONS.md",
    });
  } else {
    checks.push({
      id: "attributions-ok",
      category: "attributions",
      name: "Third-Party Media Attribution",
      status: "pass",
      message: hasAttributions ? "ATTRIBUTIONS.md / Credits.swift is present." : "No non-code media assets requiring attribution detected.",
      file: hasAttributions ? "ATTRIBUTIONS.md" : undefined,
    });
  }

  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warn").length;
  const passCount = checks.filter((c) => c.status === "pass").length;

  return {
    summary: {
      passed: failCount === 0,
      canExport: failCount === 0,
      totalChecks: checks.length,
      passCount,
      warnCount,
      failCount,
      estimatedZipBytes: realZip,
      maxZipBytes: structureConfig.maxZipSizeBytes,
      unverified: structureConfig.unverified,
      statusNotice: structureConfig.statusNotice,
      uiDisclaimer: structureConfig.disclaimers.uiDisclaimer,
    },
    checks,
  };
}
