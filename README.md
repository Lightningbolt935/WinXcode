# WinXcode

**Swift & SwiftUI IDE for Windows — Live Preview & Swift Student Challenge Pre-Flight**

> *"Windows? Here's your path to a valid Swift Student Challenge entry."*

---

## Upstream Attribution & Copyright

WinXcode is a fork of **[OnelightCyber/XWinCode](https://github.com/OnelightCyber/XWinCode)**:
- **Upstream Author:** Copyright (C) 2024 OnelightCyber and contributors.
- **License:** GNU General Public License, version 3.0 or later ([GPL-3.0-or-later](XWinCode/LICENSE)).
- **Upstream Repository:** `https://github.com/OnelightCyber/XWinCode`

All original upstream copyright notices, license texts, and attribution headers are strictly preserved throughout this repository.

---

## Overview

WinXcode enables students and developers on Windows to:
1. **Write Swift and SwiftUI code** with syntax highlighting, autocomplete, and diagnostics.
2. **View live visual previews** of SwiftUI screens using a clean-room TypeScript AST interpreter and SVG Canvas renderer (no Mac or Apple SDK required).
3. **Run Submission Check**: an automated pre-flight validator enforcing the rules of Apple's Swift Student Challenge (offline execution, prohibited network/auth/analytics SDKs, asset bundling, attributions).
4. **Export App Playgrounds (`.swiftpm`)** packaged cleanly into submission-ready `.zip` archives.

---

## Project Structure

- `XWinCode/`: Desktop IDE application (Tauri 2 + React 19 + TypeScript + Rust).
  - `src/lib/preview/`: SwiftUI lexer, parser, runtime, and canvas renderer.
  - `src/lib/validator/`: Swift Student Challenge submission validator.
  - `src/components/`: IDE interface (Editor, Canvas preview, Submission Check, Settings).
- `templates/app-playground.swiftpm/`: Verified Swift Student Challenge App Playground starter template.
- `docs/`: Architecture specifications, baseline benchmarks, coverage matrices, and legal notices:
  - `docs/BASELINE.md`: Measured preview coverage against 20 test apps.
  - `docs/CHALLENGE_RULES.md`: Official Apple Swift Student Challenge rules & validator checks.
  - `docs/COVERAGE.md`: Supported SwiftUI views, modifiers, and shims.
  - `docs/LICENSE_NOTICE.md`: Complete open-source licensing terms and Apple SDK legal disclaimers.
  - `docs/NAMING.md`: Audit of project naming references and rebranding plan.
  - `docs/MAC_VERIFICATION.md`: 10-step checklist for verifying exported submissions on a physical Mac or iPad.

---

## Legal & Trademark Disclaimer

WinXcode is an independent open-source project and is **not affiliated with, sponsored by, or endorsed by Apple Inc.** Apple, Xcode, Swift, SwiftUI, iOS, iPadOS, macOS, and iPhone are registered trademarks of Apple Inc. References to Xcode and Swift Playgrounds are solely for factual compatibility with file formats (`.swiftpm`, `.xcodeproj`).
