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

## 3. Candidate Replacement Names & Apple Trademark Analysis

### Apple Trademark Policies & Guidelines
- **Guidelines for Using Apple Trademarks:** [Apple Legal — Guidelines for Using Apple Trademarks and Copyrights](https://www.apple.com/legal/intellectual-property/guidelinesfor3rdparties.html)
- **Official Apple Trademark List:** [Apple Trademark List](https://www.apple.com/legal/intellectual-property/trademark/appletmlist.html)
- **Key Restrictions from Apple Guidelines:**
  > *"You may not use or register, in whole or in part, Apple, the Apple logo, Mac, iPhone, iPad, Xcode, Swift, or any other Apple trademark... as or as part of a company name, trade name, product name, or service name."*  
  > *"You may use Apple trademarks in referential phrases on packaging or promotional materials to describe that the third party product is compatible with the referenced Apple product or technology (e.g., 'for use with Swift' or 'compatible with Xcode projects'). The third party product name must be clearly separated and distinctive."*

---

### Candidate Names Analysis

> [!NOTE]
> Per Phase 3c instructions, no name is selected here. This table evaluates each candidate against Apple's trademark guidelines to inform the final naming decision.

| Candidate Name | Uses Apple's "Xcode" Trademark? | Uses Apple's "Swift" Trademark? | Trademark Compliance Analysis ([Apple Guidelines](https://www.apple.com/legal/intellectual-property/guidelinesfor3rdparties.html)) |
|---|---|---|---|
| **WinSwift** | No | **Yes ("Swift")** | Eliminates "Xcode", but incorporates the registered trademark "Swift" directly into the product name. Violates Apple Rule 2 unless used referentially (e.g., *"WinIDE for Swift"*). |
| **SwiftForge** | No | **Yes ("Swift")** | Eliminates "Xcode", but incorporates the registered trademark "Swift" directly as the leading compound. High trademark collision risk under Apple guidelines. |
| **SwiftStudio** | No | **Yes ("Swift")** | Eliminates "Xcode", but incorporates the registered trademark "Swift". Additionally, "Studio" is widely used by Microsoft and Google. |
| **PlaySwift** | No | **Yes ("Swift")** | Eliminates "Xcode", but incorporates "Swift" and closely mimics "Swift Playgrounds". High confusion/dilution risk under Apple guidelines. |
| **SwiftCraft** | No | **Yes ("Swift")** | Eliminates "Xcode", but incorporates the registered trademark "Swift". Potential secondary association with Minecraft. |
| **AppForge** *(referential: "for Swift")* | **No** | **No** | **Zero Apple trademark infringement.** The product brand is entirely distinctive ("AppForge"). Can safely use permitted referential nominative phrasing: *"AppForge — Windows IDE for Swift & SwiftUI"*. |
| **CodeCanvas** *(referential: "for Swift Playgrounds")* | **No** | **No** | **Zero Apple trademark infringement.** Completely independent brand name. Accurately reflects visual canvas preview capability without trademark conflict. |
| **NorthStar IDE** *(referential: "for Swift Playgrounds")* | **No** | **No** | **Zero Apple trademark infringement.** Distinctive open-source name. Uses referential compatibility statement in tagline. |

