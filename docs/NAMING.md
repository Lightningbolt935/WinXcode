# WinXcode Naming Audit & Rebranding Checklist

> [!IMPORTANT]
> **Status:** AUDIT ONLY — DO NOT RENAME YET.
> Per Phase 3b instructions, all project references containing "Xcode" are inventoried here with an exhaustive migration checklist. Renaming will be executed during the branding/release phase.

---

## 1. Inventory: Every Place Containing "Xcode" / "XWinCode" / "WinXcode"

### A. Repository & Directory Structure
1. Workspace root directory: `c:\Users\Snehil Sahay\Desktop\WinXcode`
2. Desktop application submodule directory: `XWinCode/`

### B. Application Manifests & Configurations
| File Path | Field / Line | Current Value | Proposed Action |
|---|---|---|---|
| `XWinCode/package.json` | `"name"` (line 2) | `"xwincode"` | Update to new package name |
| `XWinCode/src-tauri/Cargo.toml` | `name` (line 2) | `"xwincode"` | Update Rust crate name |
| `XWinCode/src-tauri/tauri.conf.json` | `"productName"` (line 3) | `"XWinCode"` | Update executable product name |
| `XWinCode/src-tauri/tauri.conf.json` | `"identifier"` (line 12) | `"com.onelight.xwincode"` | Update bundle identifier |
| `XWinCode/src-tauri/tauri.conf.json` | `"windows"[0]."title"` (line 16) | `"XWinCode"` | Update default window title |
| `XWinCode/src-tauri/tauri.conf.json` | `"copyright"` (line 42) | `"Copyright © 2024 OnelightCyber"` | Retain upstream credit while noting fork |
| `.github/workflows/ci.yml` | `name` (line 1) | `WinXcode CI` | Update CI workflow title |
| `.github/workflows/ci.yml` | `name` (line 68) | `WinXcode-Windows-Installer` | Update CI artifact name |

### C. Application Source Code & Storage Namespaces
| File Path | Occurrence / Line | Context |
|---|---|---|
| `XWinCode/src/lib/preview/runtime.ts` | Line 139 | `localStorage` prefix: `winxcode:appstorage:${key}` |
| `XWinCode/src/components/SettingsSheet.tsx` | Line 696 | UI header: `<h2>XWinCode</h2>` |
| `XWinCode/src/components/SettingsSheet.tsx` | Line 678 | Upstream credit: `{ name: "XWinCode (Upstream)", ... }` |
| `XWinCode/src/components/Welcome.tsx` | Line 2 | Welcome screen branding and icon |
| `XWinCode/src/components/TitleBar.tsx` | Window header | Dynamic title string fallback |
| `XWinCode/src/i18n/locales/en.json` | Lines 660, 664 | About tagline, legal disclaimer, and editor theme keywords |
| `XWinCode/src/i18n/locales/*.json` | All locale files | Translated product mentions in strings |

### D. Documentation, Plans, & Scripts
| File Path | Context |
|---|---|
| `README.md` | Root repository README (`WinXcode`) |
| `XWinCode/README.md` | Desktop app README (`XWinCode`) |
| `WINXCODE_PLAN.md` | Project master specification & roadmap |
| `docs/BASELINE.md` | Preview harness benchmark documentation |
| `docs/CHALLENGE_RULES.md` | Apple Swift Student Challenge validator rules |
| `docs/COVERAGE.md` | SwiftUI coverage matrix & shims |
| `docs/LICENSE_NOTICE.md` | Licensing terms & Apple SDK disclaimer |
| `docs/MAC_VERIFICATION.md` | Mac testing checklist |
| `docs/NOTES.md` | Research notes & template survey |
| `scripts/generate-coverage.mjs` | Coverage generator script header & comments |
| `scripts/preview-baseline.ps1` | Benchmark script console output |
| `scripts/screenshot-corpus.mjs` | Corpus runner tool console output |
| `tests/preview-harness/corpus.test.ts` | Harness description and header |
| `tests/corpus/05_settings/ContentView.swift` | Demo text string: `WinXcode Demo App v1.0` |

---

## 2. Step-by-Step Rebrand Checklist (Execution Plan)

When renaming is authorized:
- [ ] **Step 1: Manifest Updates**
  - Update `XWinCode/package.json` (`name`).
  - Update `XWinCode/src-tauri/Cargo.toml` (`[package].name`).
  - Update `XWinCode/src-tauri/tauri.conf.json` (`productName`, `identifier`, `windows[0].title`).
- [ ] **Step 2: Storage Namespace Migration**
  - Update `runtime.ts` `localStorage` prefix from `winxcode:appstorage:` to new namespace with backward-compatible fallback reader.
- [ ] **Step 3: User Interface & i18n Strings**
  - Update `About()` component in `SettingsSheet.tsx`.
  - Update `en.json` and other locale files (keep upstream fork notice intact).
- [ ] **Step 4: CI & Build Configuration**
  - Update `.github/workflows/ci.yml` artifact names and installer targets.
- [ ] **Step 5: Documentation & Guides**
  - Update `README.md`, `docs/`, and references across user guides.
- [ ] **Step 6: Validation & Smoke Testing**
  - Run `npx tsc --noEmit`.
  - Run `npx vitest run`.
  - Build application package to verify installer bundle names.

---

## 3. Candidate Replacement Names

| Candidate Name | Pros | Cons / Considerations |
|---|---|---|
| **WinSwift** | Ultra-clean, concise, instantly communicates "Swift on Windows" | Generic; needs distinctive icon |
| **SwiftForge** | Evokes an active workshop/foundry for crafting Swift projects | Independent identity; completely clear of Apple trademarks |
| **SwiftStudio** | Familiar IDE terminology; prestigious professional feel | "Studio" is widely used by Microsoft / Google / Android |
| **PlaySwift** | Highlights Swift Student Challenge and App Playgrounds focus | May sound limited to toys/games rather than full IDE |
| **SwiftCraft** | Friendly, educational, approachable for students | "Craft" association with Minecraft |

**Recommended Choice:** **WinSwift** or **SwiftForge** (both entirely eliminate "Xcode" from the product brand while retaining clear developer meaning).
