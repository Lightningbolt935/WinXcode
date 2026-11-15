# Legal Notice and Licensing Terms

**WinXcode (based on XWinCode)**

---

## 1. Project License

WinXcode is free and open-source software, licensed under the **GNU General Public License, version 3.0 or later (GPL-3.0-or-later)**.
You may inspect, run, modify, and redistribute this software under the terms of the GPL-3.0 license. Any distributed binary or derivative work must provide corresponding source code under the same license terms.

---

## 2. Third-Party Components & Licenses

WinXcode incorporates open-source libraries and utilities, each distributed under its respective permissive or copyleft license:

| Component | License | Role |
|---|---|---|
| **React 19** | MIT | UI framework |
| **Tauri 2** | MIT / Apache 2.0 | Desktop runtime & native Rust bridge |
| **Monaco Editor** | MIT | Code editor component |
| **xterm.js** | MIT | Terminal emulation |
| **Vitest** | MIT | Headless test harness & test runner |
| **TypeScript** | Apache 2.0 | Language & compiler toolchain |
| **Lucide Icons** | ISC | UI iconography |
| **Tokio / Serde / WalkDir** | MIT / Apache 2.0 | Rust backend async I/O & filesystem utilities |
| **xtool** | GPL-3.0 / Open Source | Optional external toolchain for iOS cross-compilation |
| **libimobiledevice** | LGPL-2.1 | Optional USB communication with iOS devices |

---

## 3. Strict No-Redistribution of Apple Software

**WinXcode does NOT contain, mirror, host, redistribute, or provide any proprietary Apple software.**
Specifically:
- No Apple Xcode binaries, headers, or compilers are bundled.
- No Apple iOS, iPadOS, macOS, or watchOS SDKs or system frameworks are bundled or distributed.
- No Apple simulator images or device runtime disk images are hosted or distributed.

### Clean-Room Windows Preview & Submission Validator
- The **Canvas Preview** runs an independent Swift AST interpreter, lexer, and SVG renderer written from scratch in TypeScript. It executes SwiftUI declarations purely in userland without calling macOS or Apple system frameworks.
- The **Submission Check** validator performs local static analysis based on Apple's publicly published Swift Student Challenge guidelines and rules.
- **No Apple software or macOS hardware is required** to write SwiftUI, view the live preview, validate submissions, or export `.swiftpm` packages.

---

## 4. Xcode & Apple SDK License Restriction (macOS-Only Clause)

If a user independently chooses to download Apple's `Xcode.xip` or extract an iOS SDK for native arm64 binary compilation with `xtool`, the user must be aware of Apple's official license restrictions:

> *"You may only install and use the Apple SDKs on Apple-branded computers running macOS."*
> — [Apple Legal Software License Agreements (SLA)](https://www.apple.com/legal/sla/)

WinXcode does **not** provide, download, host, or bypass this requirement. Compiling native iOS binaries via xtool is an optional advanced feature; students submitting to the Swift Student Challenge can create, preview, validate, and export full App Playgrounds (`.swiftpm`) completely within WinXcode without downloading an Apple SDK or violating Apple's macOS-only SDK clause.

---

## 5. Trademark & Affiliation Notice

- **WinXcode is NOT affiliated with, sponsored by, or endorsed by Apple Inc.**
- Apple, Xcode, Swift, SwiftUI, iOS, iPadOS, macOS, and iPhone are registered trademarks or trademarks of Apple Inc. in the United States and other countries.
- Use of the term "Xcode" or other Apple marks in documentation, user interfaces, or repository names is strictly for nominative, factual reference to denote technical format compatibility (e.g. Swift Playgrounds App packages and Xcode project compatibility).
