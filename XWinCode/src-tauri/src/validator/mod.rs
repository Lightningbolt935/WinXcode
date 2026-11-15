use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StructureConfig {
    pub unverified: bool,
    #[serde(rename = "statusNotice")]
    pub status_notice: String,
    #[serde(rename = "maxZipSizeBytes")]
    pub max_zip_size_bytes: u64,
    #[serde(rename = "warnZipSizeBytes")]
    pub warn_zip_size_bytes: u64,
    #[serde(rename = "requiredFiles")]
    pub required_files: Vec<String>,
    pub disclaimers: Disclaimers,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Disclaimers {
    #[serde(rename = "uiDisclaimer")]
    pub ui_disclaimer: String,
    #[serde(rename = "unverifiedNotice")]
    pub unverified_notice: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CheckItem {
    pub id: String,
    pub category: String,
    pub name: String,
    pub status: String, // "pass" | "warn" | "fail"
    pub message: String,
    pub file: Option<String>,
    pub line: Option<usize>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ValidationSummary {
    pub passed: bool,
    #[serde(rename = "canExport")]
    pub can_export: bool,
    #[serde(rename = "totalChecks")]
    pub total_checks: usize,
    #[serde(rename = "passCount")]
    pub pass_count: usize,
    #[serde(rename = "warnCount")]
    pub warn_count: usize,
    #[serde(rename = "failCount")]
    pub fail_count: usize,
    #[serde(rename = "estimatedZipBytes")]
    pub estimated_zip_bytes: u64,
    #[serde(rename = "maxZipBytes")]
    pub max_zip_bytes: u64,
    pub unverified: bool,
    #[serde(rename = "statusNotice")]
    pub status_notice: String,
    #[serde(rename = "uiDisclaimer")]
    pub ui_disclaimer: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ValidationReport {
    pub summary: ValidationSummary,
    pub checks: Vec<CheckItem>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExportResult {
    pub success: bool,
    #[serde(rename = "zipPath")]
    pub zip_path: String,
    #[serde(rename = "zipSizeBytes")]
    pub zip_size_bytes: u64,
    pub message: String,
}

fn load_structure_config() -> StructureConfig {
    let json_bytes = include_bytes!("structure.json");
    serde_json::from_slice(json_bytes).unwrap_or_else(|_| StructureConfig {
        unverified: true,
        status_notice: "UNVERIFIED: Format based on Apple developer documentation.".to_string(),
        max_zip_size_bytes: 524_288_000,
        warn_zip_size_bytes: 104_857_600,
        required_files: vec![
            "Package.swift".into(),
            "App.swift".into(),
            "ContentView.swift".into(),
            "Assets.xcassets/Contents.json".into(),
            "Assets.xcassets/AppIcon.appiconset/Contents.json".into(),
            "Assets.xcassets/AccentColor.colorset/Contents.json".into(),
        ],
        disclaimers: Disclaimers {
            ui_disclaimer: "No obvious problems found based on static pre-flight checks. Note that Apple's review may catch things this check cannot detect; always test your project in Swift Playgrounds or Xcode on macOS if possible.".into(),
            unverified_notice: "Template format not yet verified on a physical Mac. Open and verify in Xcode or Swift Playgrounds before submitting.".into(),
        },
    })
}

fn strip_comments(code: &str) -> String {
    let mut out = String::with_capacity(code.len());
    let chars: Vec<char> = code.chars().collect();
    let n = chars.len();
    let mut i = 0;

    while i < n {
        // Multiline string literal """
        if chars[i] == '"' && i + 2 < n && chars[i + 1] == '"' && chars[i + 2] == '"' {
            out.push_str("\"\"\"");
            i += 3;
            while i < n {
                if chars[i] == '\\' && i + 1 < n {
                    out.push(chars[i]);
                    out.push(chars[i + 1]);
                    i += 2;
                    continue;
                }
                if chars[i] == '"' && i + 2 < n && chars[i + 1] == '"' && chars[i + 2] == '"' {
                    out.push_str("\"\"\"");
                    i += 3;
                    break;
                }
                out.push(chars[i]);
                i += 1;
            }
            continue;
        }

        // Single-line string literal "
        if chars[i] == '"' {
            out.push('"');
            i += 1;
            while i < n {
                if chars[i] == '\\' && i + 1 < n {
                    out.push(chars[i]);
                    out.push(chars[i + 1]);
                    i += 2;
                    continue;
                }
                if chars[i] == '"' {
                    out.push('"');
                    i += 1;
                    break;
                }
                if chars[i] == '\n' {
                    break;
                }
                out.push(chars[i]);
                i += 1;
            }
            continue;
        }

        // Line comment //
        if chars[i] == '/' && i + 1 < n && chars[i + 1] == '/' {
            while i < n && chars[i] != '\n' {
                out.push(' ');
                i += 1;
            }
            continue;
        }

        // Block comment /* (supports nested block comments)
        if chars[i] == '/' && i + 1 < n && chars[i + 1] == '*' {
            let mut depth = 1;
            out.push(' ');
            out.push(' ');
            i += 2;
            while i < n && depth > 0 {
                if chars[i] == '/' && i + 1 < n && chars[i + 1] == '*' {
                    depth += 1;
                    out.push(' ');
                    out.push(' ');
                    i += 2;
                    continue;
                }
                if chars[i] == '*' && i + 1 < n && chars[i + 1] == '/' {
                    depth -= 1;
                    out.push(' ');
                    out.push(' ');
                    i += 2;
                    continue;
                }
                if chars[i] == '\n' {
                    out.push('\n');
                } else {
                    out.push(' ');
                }
                i += 1;
            }
            continue;
        }

        out.push(chars[i]);
        i += 1;
    }

    out
}

#[tauri::command]
pub fn validate_submission(project_path: String) -> Result<ValidationReport, String> {
    let cfg = load_structure_config();
    let root = Path::new(&project_path);
    if !root.exists() {
        return Err(format!("Project path '{}' does not exist.", project_path));
    }

    let mut checks: Vec<CheckItem> = Vec::new();
    let mut total_bytes: u64 = 0;
    let mut known_assets: HashSet<String> = HashSet::new();
    let mut has_custom_media = false;
    let mut present_files: HashSet<String> = HashSet::new();
    let mut swift_files: Vec<(String, PathBuf)> = Vec::new();

    for entry in WalkDir::new(root).into_iter().filter_map(|e| e.ok()) {
        let p = entry.path();
        if p.is_file() {
            let rel = p.strip_prefix(root).unwrap_or(p).to_string_lossy().replace('\\', "/");
            present_files.insert(rel.clone());
            if let Ok(meta) = p.metadata() {
                total_bytes += meta.len();
            }

            if rel.contains("Assets.xcassets/") {
                if let Some(idx) = rel.find(".imageset") {
                    let part = &rel[..idx];
                    if let Some(slash) = part.rfind('/') {
                        known_assets.insert(part[slash + 1..].to_string());
                    }
                }
                if let Some(idx) = rel.find(".appiconset") {
                    let part = &rel[..idx];
                    if let Some(slash) = part.rfind('/') {
                        known_assets.insert(part[slash + 1..].to_string());
                    }
                }
                if let Some(idx) = rel.find(".colorset") {
                    let part = &rel[..idx];
                    if let Some(slash) = part.rfind('/') {
                        known_assets.insert(part[slash + 1..].to_string());
                    }
                }
            }

            let lower = rel.to_lowercase();
            if (lower.ends_with(".png") || lower.ends_with(".jpg") || lower.ends_with(".wav") || lower.ends_with(".mp3") || lower.ends_with(".usdz"))
                && !rel.contains("AppIcon.appiconset")
                && !rel.contains("AccentColor.colorset")
            {
                has_custom_media = true;
            }

            if rel.ends_with(".swift") && rel != "Package.swift" {
                swift_files.push((rel, p.to_path_buf()));
            }
        }
    }

    // 1. Structure: Package.swift Manifest
    let pkg_path = root.join("Package.swift");
    if !pkg_path.exists() {
        checks.push(CheckItem {
            id: "struct-pkg-missing".into(),
            category: "structure".into(),
            name: "Package.swift Manifest".into(),
            status: "fail".into(),
            message: "Package.swift is missing from project root.".into(),
            file: Some("Package.swift".into()),
            line: None,
        });
    } else if let Ok(content) = fs::read_to_string(&pkg_path) {
        let lines: Vec<&str> = content.lines().collect();
        let tools_line = lines.iter().position(|l| l.contains("swift-tools-version:"));
        if let Some(idx) = tools_line {
            checks.push(CheckItem {
                id: "struct-tools-version".into(),
                category: "structure".into(),
                name: "Swift Tools Version Header".into(),
                status: "pass".into(),
                message: format!("Found valid tools declaration: {}", lines[idx].trim()),
                file: Some("Package.swift".into()),
                line: Some(idx + 1),
            });
        } else {
            checks.push(CheckItem {
                id: "struct-tools-version".into(),
                category: "structure".into(),
                name: "Swift Tools Version Header".into(),
                status: "fail".into(),
                message: "First line must declare '// swift-tools-version: 5.9' (or compatible).".into(),
                file: Some("Package.swift".into()),
                line: Some(1),
            });
        }

        if content.contains("import AppleProductTypes") {
            checks.push(CheckItem {
                id: "struct-import-appleproducttypes".into(),
                category: "structure".into(),
                name: "Required Import: AppleProductTypes".into(),
                status: "pass".into(),
                message: "Found import AppleProductTypes".into(),
                file: Some("Package.swift".into()),
                line: None,
            });
        } else {
            checks.push(CheckItem {
                id: "struct-import-appleproducttypes".into(),
                category: "structure".into(),
                name: "Required Import: AppleProductTypes".into(),
                status: "fail".into(),
                message: "Package.swift must import 'AppleProductTypes' for App Playground support.".into(),
                file: Some("Package.swift".into()),
                line: None,
            });
        }

        if content.contains(".iOSApplication") {
            checks.push(CheckItem {
                id: "struct-ios-application".into(),
                category: "structure".into(),
                name: "Product Type .iOSApplication".into(),
                status: "pass".into(),
                message: "Found .iOSApplication product declaration.".into(),
                file: Some("Package.swift".into()),
                line: None,
            });
        } else {
            checks.push(CheckItem {
                id: "struct-ios-application".into(),
                category: "structure".into(),
                name: "Product Type .iOSApplication".into(),
                status: "fail".into(),
                message: "App Playground must configure an .iOSApplication product target.".into(),
                file: Some("Package.swift".into()),
                line: None,
            });
        }
    }

    // Required files check
    for req in &cfg.required_files {
        if req == "Package.swift" {
            continue;
        }
        if present_files.contains(req) {
            checks.push(CheckItem {
                id: format!("struct-file-{}", req.replace('/', "_")),
                category: "structure".into(),
                name: format!("Required File: {}", req),
                status: "pass".into(),
                message: format!("Found required file {}", req),
                file: Some(req.clone()),
                line: None,
            });
        } else {
            checks.push(CheckItem {
                id: format!("struct-file-{}", req.replace('/', "_")),
                category: "structure".into(),
                name: format!("Required File: {}", req),
                status: "fail".into(),
                message: format!("Missing required file: {}", req),
                file: Some(req.clone()),
                line: None,
            });
        }
    }

    // 2. Package Size Check (real compressed archive measurement in temp dir)
    let temp_dir = std::env::temp_dir();
    let unique_id = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    let temp_zip_path = temp_dir.join(format!("winxcode_val_sz_{}.zip", unique_id));

    let parent_dir = root.parent().unwrap_or(root);
    let original_name = root.file_name().and_then(|n| n.to_str()).unwrap_or("App");

    let status = Command::new("tar")
        .args(["-a", "-c", "-f"])
        .arg(&temp_zip_path)
        .args([
            "--exclude", ".build",
            "--exclude", "*/.build",
            "--exclude", "*/.build/*",
            "--exclude", ".git",
            "--exclude", "*/.git",
            "--exclude", "*/.git/*",
            "--exclude", ".DS_Store",
            "--exclude", "*/.DS_Store",
            "--exclude", "*.xcuserdata",
            "--exclude", "*/*.xcuserdata",
            "--exclude", "*/*.xcuserdata/*",
            "--exclude", "xcuserdata",
            "--exclude", "*/xcuserdata",
            "--exclude", "*/xcuserdata/*",
            "--exclude", "*.xcuserdatad",
            "--exclude", "*/*.xcuserdatad",
            "--exclude", "*/*.xcuserdatad/*",
            "--exclude", "xcuserdatad",
            "--exclude", "*/xcuserdatad",
            "--exclude", "*/xcuserdatad/*",
            "--exclude", "*/.*",
            "-C",
        ])
        .arg(&parent_dir)
        .arg(&original_name)
        .status();

    let real_zip = if status.map(|s| s.success()).unwrap_or(false) && temp_zip_path.exists() {
        let sz = fs::metadata(&temp_zip_path)
            .map(|m| m.len())
            .unwrap_or((total_bytes as f64 * 0.7) as u64);
        let _ = fs::remove_file(&temp_zip_path);
        sz
    } else {
        (total_bytes as f64 * 0.7) as u64
    };

    if real_zip > cfg.max_zip_size_bytes {
        checks.push(CheckItem {
            id: "size-limit".into(),
            category: "size".into(),
            name: "Package Archive Size".into(),
            status: "fail".into(),
            message: format!("Archive compressed ZIP size ({:.2} MB) exceeds Apple's 500 MB limit!", real_zip as f64 / 1_048_576.0),
            file: None,
            line: None,
        });
    } else if real_zip > cfg.warn_zip_size_bytes {
        checks.push(CheckItem {
            id: "size-limit".into(),
            category: "size".into(),
            name: "Package Archive Size".into(),
            status: "warn".into(),
            message: format!("Archive compressed ZIP size ({:.2} MB) is large; consider compressing media.", real_zip as f64 / 1_048_576.0),
            file: None,
            line: None,
        });
    } else {
        checks.push(CheckItem {
            id: "size-limit".into(),
            category: "size".into(),
            name: "Package Archive Size".into(),
            status: "pass".into(),
            message: format!("Archive compressed ZIP size ({:.2} MB) is well within limit.", real_zip as f64 / 1_048_576.0),
            file: None,
            line: None,
        });
    }

    // 3, 4, 5. Scan Swift source files using multiline tokenizer regexes
    let url_re = regex::Regex::new(r#"\bURL\s*\(\s*string\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)""#).unwrap();
    let async_img_re = regex::Regex::new(r#"\bAsyncImage\s*\(\s*url\s*:\s*URL\s*\(\s*string\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)""#).unwrap();
    let img_re = regex::Regex::new(r#"\bImage\s*\(\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*[\),]"#).unwrap();
    let net_api_re = regex::Regex::new(r#"\b(URLSession|URLSessionConfiguration|URLRequest|NWPathMonitor|NWConnection|WebSocketTask)\b"#).unwrap();
    let wk_re = regex::Regex::new(r#"\bWKWebView\b"#).unwrap();
    let auth_re = regex::Regex::new(r#"\b(import\s+AuthenticationServices|SignInWithAppleButton|FirebaseAuth|AWSMobileClient|Amplify\.Auth)\b"#).unwrap();
    let track_re = regex::Regex::new(r#"\b(import\s+FirebaseAnalytics|Mixpanel|Amplitude|AppTrackingTransparency|ATTrackingManager|FacebookCore|GoogleAnalytics)\b"#).unwrap();

    for (rel_path, abs_path) in &swift_files {
        if let Ok(raw_src) = fs::read_to_string(abs_path) {
            let src = strip_comments(&raw_src);

            let get_line = |pos: usize| -> usize {
                src[..pos].chars().filter(|&c| c == '\n').count() + 1
            };

            // Network APIs
            for mat in net_api_re.find_iter(&src) {
                let api_name = mat.as_str();
                let line_num = get_line(mat.start());
                checks.push(CheckItem {
                    id: format!("net-api-{}-{}", rel_path, line_num),
                    category: "network".into(),
                    name: format!("Network API ({})", api_name),
                    status: "fail".into(),
                    message: format!("Submissions are judged offline. Prohibited network connectivity API detected ({}).", api_name),
                    file: Some(rel_path.clone()),
                    line: Some(line_num),
                });
            }

            // Remote URL
            for caps in url_re.captures_iter(&src) {
                let url_val = &caps[1];
                if url_val.starts_with("http://") || url_val.starts_with("https://") {
                    let line_num = get_line(caps.get(0).unwrap().start());
                    checks.push(CheckItem {
                        id: format!("net-remote-url-{}-{}", rel_path, line_num),
                        category: "network".into(),
                        name: "Remote HTTP URL".into(),
                        status: "fail".into(),
                        message: "Submissions must not depend on remote servers. Hardcoded HTTP URL detected.".into(),
                        file: Some(rel_path.clone()),
                        line: Some(line_num),
                    });
                }
            }

            // Remote AsyncImage
            for caps in async_img_re.captures_iter(&src) {
                let url_val = &caps[1];
                if url_val.starts_with("http://") || url_val.starts_with("https://") {
                    let line_num = get_line(caps.get(0).unwrap().start());
                    checks.push(CheckItem {
                        id: format!("net-asyncimage-{}-{}", rel_path, line_num),
                        category: "network".into(),
                        name: "Remote AsyncImage".into(),
                        status: "fail".into(),
                        message: "Remote AsyncImage will fail offline. Bundle images locally.".into(),
                        file: Some(rel_path.clone()),
                        line: Some(line_num),
                    });
                }
            }

            // WKWebView
            for mat in wk_re.find_iter(&src) {
                let line_num = get_line(mat.start());
                checks.push(CheckItem {
                    id: format!("net-wkwebview-{}-{}", rel_path, line_num),
                    category: "network".into(),
                    name: "WKWebView Usage".into(),
                    status: "warn".into(),
                    message: "WKWebView detected. Verify that it only loads bundled local HTML.".into(),
                    file: Some(rel_path.clone()),
                    line: Some(line_num),
                });
            }

            // Auth
            for mat in auth_re.find_iter(&src) {
                let line_num = get_line(mat.start());
                checks.push(CheckItem {
                    id: format!("auth-gate-{}-{}", rel_path, line_num),
                    category: "auth_analytics".into(),
                    name: "Sign-In / Authentication Gate".into(),
                    status: "fail".into(),
                    message: "Apple strictly prohibits sign-in gates. Apps requiring login will be disqualified.".into(),
                    file: Some(rel_path.clone()),
                    line: Some(line_num),
                });
            }

            // Analytics
            for mat in track_re.find_iter(&src) {
                let line_num = get_line(mat.start());
                checks.push(CheckItem {
                    id: format!("tracking-{}-{}", rel_path, line_num),
                    category: "auth_analytics".into(),
                    name: "Tracking / Analytics Telemetry".into(),
                    status: "fail".into(),
                    message: "Judge tracking/telemetry code is explicitly prohibited by Apple Challenge terms.".into(),
                    file: Some(rel_path.clone()),
                    line: Some(line_num),
                });
            }

            // Assets (multiline Image("..."))
            for caps in img_re.captures_iter(&src) {
                let asset_name = &caps[1];
                if !known_assets.contains(asset_name) {
                    let line_num = get_line(caps.get(0).unwrap().start());
                    checks.push(CheckItem {
                        id: format!("asset-missing-{}-{}", rel_path, line_num),
                        category: "assets".into(),
                        name: format!("Missing Asset: \"{}\"", asset_name),
                        status: "fail".into(),
                        message: format!("Referenced image \"{}\" not found in Assets.xcassets catalog.", asset_name),
                        file: Some(rel_path.clone()),
                        line: Some(line_num),
                    });
                }
            }
        }
    }

    if !checks.iter().any(|c| c.category == "network") {
        checks.push(CheckItem {
            id: "net-offline-ok".into(),
            category: "network".into(),
            name: "Offline Operation".into(),
            status: "pass".into(),
            message: "No prohibited remote network calls detected. App runs offline.".into(),
            file: None,
            line: None,
        });
    }

    if !checks.iter().any(|c| c.category == "auth_analytics") {
        checks.push(CheckItem {
            id: "auth-clean-ok".into(),
            category: "auth_analytics".into(),
            name: "No Sign-In or Judge Tracking".into(),
            status: "pass".into(),
            message: "No authentication gates or tracking telemetry detected.".into(),
            file: None,
            line: None,
        });
    }

    if !checks.iter().any(|c| c.category == "assets") {
        checks.push(CheckItem {
            id: "assets-referenced-ok".into(),
            category: "assets".into(),
            name: "Referenced Assets".into(),
            status: "pass".into(),
            message: "All code-referenced assets exist in catalog.".into(),
            file: None,
            line: None,
        });
    }

    // Attributions
    let has_attrib = present_files.contains("ATTRIBUTIONS.md") || present_files.contains("ATTRIBUTIONS.txt") || present_files.contains("Credits.swift");
    if has_custom_media && !has_attrib {
        checks.push(CheckItem {
            id: "attributions-missing".into(),
            category: "attributions".into(),
            name: "Third-Party Media Attribution".into(),
            status: "warn".into(),
            message: "Non-code media assets detected without ATTRIBUTIONS.md or Credits.swift. Apple rule: 'You may include third-party open source code and public domain or Creative Commons-licensed images, sounds, or other media, provided you credit the source and explain why it was used.' (https://developer.apple.com/swift-student-challenge/terms-and-conditions/). If all assets are 100% original, this warning can be safely ignored.".into(),
            file: Some("ATTRIBUTIONS.md".into()),
            line: None,
        });
    } else {
        checks.push(CheckItem {
            id: "attributions-ok".into(),
            category: "attributions".into(),
            name: "Third-Party Media Attribution".into(),
            status: "pass".into(),
            message: if has_attrib { "ATTRIBUTIONS.md / Credits.swift is present.".into() } else { "No non-code media assets requiring attribution detected.".into() },
            file: if has_attrib { Some("ATTRIBUTIONS.md".into()) } else { None },
            line: None,
        });
    }

    let fail_count = checks.iter().filter(|c| c.status == "fail").count();
    let warn_count = checks.iter().filter(|c| c.status == "warn").count();
    let pass_count = checks.iter().filter(|c| c.status == "pass").count();

    Ok(ValidationReport {
        summary: ValidationSummary {
            passed: fail_count == 0,
            can_export: fail_count == 0,
            total_checks: checks.len(),
            pass_count,
            warn_count,
            fail_count,
            estimated_zip_bytes: est_zip,
            max_zip_bytes: cfg.max_zip_size_bytes,
            unverified: cfg.unverified,
            status_notice: cfg.status_notice,
            ui_disclaimer: cfg.disclaimers.ui_disclaimer,
        },
        checks,
    })
}

fn copy_clean_dir(src: &Path, dst: &Path) -> Result<(), String> {
    fs::create_dir_all(dst).map_err(|e| e.to_string())?;
    for entry in walkdir::WalkDir::new(src).min_depth(1) {
        let entry = entry.map_err(|e| e.to_string())?;
        let rel = entry.path().strip_prefix(src).map_err(|e| e.to_string())?;
        let rel_str = rel.to_string_lossy();
        if rel_str.starts_with(".build")
            || rel_str.starts_with(".git")
            || rel_str.starts_with(".DS_Store")
            || rel_str.contains("xcuserdata")
            || rel_str.contains("xcuserdatad")
        {
            continue;
        }
        let target = dst.join(rel);
        if entry.file_type().is_dir() {
            fs::create_dir_all(&target).map_err(|e| e.to_string())?;
        } else {
            if let Some(p) = target.parent() {
                let _ = fs::create_dir_all(p);
            }
            fs::copy(entry.path(), &target).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn export_submission_zip(project_path: String, output_zip_path: String) -> Result<ExportResult, String> {
    let report = validate_submission(project_path.clone())?;
    if !report.summary.can_export {
        return Err(format!(
            "Export refused: project contains {} critical submission failure(s). Resolve all failures before exporting.",
            report.summary.fail_count
        ));
    }

    let root = Path::new(&project_path);
    let out = Path::new(&output_zip_path);

    if let Some(parent) = out.parent() {
        let _ = fs::create_dir_all(parent);
    }

    let parent_dir = root.parent().unwrap_or(root);
    let original_name = root.file_name().and_then(|n| n.to_str()).unwrap_or("App");

    // Apple requires the top-level directory in the submission archive to be named [AppName].swiftpm
    let (archive_parent, archive_target, temp_dir_cleanup) = if original_name.ends_with(".swiftpm") || original_name.ends_with(".xcodeproj") {
        (parent_dir.to_path_buf(), original_name.to_string(), None)
    } else {
        let ts = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).map(|d| d.as_millis()).unwrap_or(0);
        let temp_dir = std::env::temp_dir().join(format!("winxcode_export_{}", ts));
        let staged_target = format!("{}.swiftpm", original_name);
        let staged_path = temp_dir.join(&staged_target);
        let _ = fs::create_dir_all(&temp_dir);
        copy_clean_dir(root, &staged_path)?;
        (temp_dir.clone(), staged_target, Some(temp_dir))
    };

    let status = Command::new("tar")
        .args(["-a", "-c", "-f"])
        .arg(out)
        .args([
            "--exclude", ".build",
            "--exclude", "*/.build",
            "--exclude", "*/.build/*",
            "--exclude", ".git",
            "--exclude", "*/.git",
            "--exclude", "*/.git/*",
            "--exclude", ".DS_Store",
            "--exclude", "*/.DS_Store",
            "--exclude", "*.xcuserdata",
            "--exclude", "*/*.xcuserdata",
            "--exclude", "*/*.xcuserdata/*",
            "--exclude", "xcuserdata",
            "--exclude", "*/xcuserdata",
            "--exclude", "*/xcuserdata/*",
            "--exclude", "*.xcuserdatad",
            "--exclude", "*/*.xcuserdatad",
            "--exclude", "*/*.xcuserdatad/*",
            "--exclude", "xcuserdatad",
            "--exclude", "*/xcuserdatad",
            "--exclude", "*/xcuserdatad/*",
            "--exclude", "*/.*",
            "-C",
        ])
        .arg(&archive_parent)
        .arg(&archive_target)
        .status()
        .map_err(|e| format!("Failed to execute archive command: {}", e))?;

    if let Some(temp_dir) = temp_dir_cleanup {
        let _ = fs::remove_dir_all(temp_dir);
    }

    if !status.success() {
        return Err("Archive packaging command failed.".to_string());
    }

    let meta = fs::metadata(out).map_err(|e| format!("Failed to read exported zip: {}", e))?;

    Ok(ExportResult {
        success: true,
        zip_path: output_zip_path,
        zip_size_bytes: meta.len(),
        message: "Submission ZIP created successfully. Notice: Template format not yet verified on a Mac. Open it in Xcode or Swift Playgrounds before submitting.".into(),
    })
}
