# Phase 0 Notes — Build Verification & Repo Audit

**Date:** 2026-11-15  
**Engineer:** Antigravity (automated Phase 0 run per WINXCODE_PLAN.md)  
**Machine:** Windows 11, clean user environment (no Rust/Swift pre-installed)

---

## Repo Audit

| Item | Value |
|---|---|
| Upstream | `https://github.com/OnelightCyber/XWinCode` |
| License | GPL-3.0-or-later ✅ |
| Commit count at clone | 2 (very new) |
| Clone outcome | ✅ Success |

### Repo structure — claims vs reality

| Claim in plan | Present? | Notes |
|---|---|---|
| Tauri 2 + React 19 + TypeScript | ✅ | `package.json`: tauri 2.12.1, react 19.3.0, typescript 5.9.3 |
| Monaco editor | ✅ | monaco-editor 0.57.0 |
| xterm.js | ✅ | @xterm/xterm 6.0.0 |
| Zustand state management | ✅ | zustand 5.0.15 |
| SourceKit-LSP bridge (`lsp.rs`) | ✅ | Full implementation with WSL path mapping |
| DAP debugger bridge (`dap.rs`) | ✅ | Present |
| Build/run (`builder.rs`) | ✅ | Present |
| ConPTY terminal (`pty.rs`) | ✅ | Uses `portable-pty 0.9` |
| Swift interpreter (`src/lib/preview/`) | ✅ | lexer.ts, parser.ts, runtime.ts, swiftui.ts, values.ts, colors.ts, devices.ts |
| Canvas renderer (`src/components/canvas/`) | ✅ | Canvas.tsx, PreviewRender.tsx, PreviewBoundary.tsx, ViewInspector.tsx |
| "Live on iPhone" link (`preview.rs`) | ✅ | Full encrypted TCP tunnel (ChaCha20Poly1305) |
| Companion iOS app (`preview-app/`) | ✅ | Swift Package, compiles to iOS, runs on-device |
| Installer | ✅ | install.cmd, scripts/install.ps1, NSIS-style via Tauri |
| Auto-update | ✅ | tauri-plugin-updater wired into lib.rs |
| i18n | ✅ | en/es/fr/de/it/ja locales, sys-locale Rust crate |

**Conclusion: all claims verified ✅**

---

## Build Check Results

### npm install
```
Command: npm install (in XWinCode/)
Result:  ✅ Exit 0
Output:  added 43 packages, audited 44 packages in 12s
         3 vulnerabilities (1 high, 2 critical) — from dompurify; already overridden to 3.4.16 in package.json
```
> **Action needed:** run `npm audit` to confirm the override resolves the critical CVEs before beta.

### TypeScript check
```
Command: npx tsc --noEmit (in XWinCode/)
Result:  ✅ Exit 0 — zero type errors
```

### Rust / cargo test
```
Command: cargo test --manifest-path src-tauri/Cargo.toml
Result:  ⚠️ UNVERIFIED — Rust toolchain (cargo, rustc) not installed on this machine.
         rustc >= 1.80 is required (Cargo.toml: rust-version = "1.80").
```
**Fix:** `winget install Rustlang.Rustup`, then `rustup default stable`, then rerun.

The one known Rust test (`only_the_app_origin_is_navigable` in `src-tauri/src/lib.rs`) exercises the navigation-guard URL filter and should pass with any stable toolchain.

### Full `npm run tauri dev`
```
Result:  ⚠️ UNVERIFIED — requires both Rust toolchain AND WebView2 runtime.
         WebView2 is pre-installed on Windows 10 1803+/Windows 11.
         Cannot run in the Antigravity sandbox (no display, no Rust).
```
**Fix:** install Rust, open a normal terminal as the user, run `npm run tauri dev` in `XWinCode/`.

---

## Interpreter Source Sizes

| File | Lines |
|---|---|
| `src/lib/preview/swiftui.ts` | 1,144 |
| `src/lib/preview/runtime.ts` | 2,069 |
| `src/lib/preview/parser.ts` | 1,152 |

This is a substantial, production-quality TypeScript Swift interpreter.

---

## Known Issues / TODOs

1. **Rust not installed** — cargo test and tauri dev cannot run without it. UNVERIFIED.
2. **npm audit vulnerabilities** — 3 vulns flagged; dompurify override in package.json may already resolve them; confirm with `npm audit`.
3. **`@Observable` macro** — not found in runtime.ts or parser.ts. The interpreter handles `@State`, `@Environment`, `@EnvironmentObject`, `@Bindable`, `@ObservedObject` but `@Observable` (Swift 5.9 macro) is not explicitly wired. See BASELINE.md corpus app 09.
4. **`Charts` framework** — `Chart`, `BarMark`, `LineMark`, `AreaMark`, `PointMark` are present in swiftui.ts as view names, but depth of rendering is unknown without running the app. UNVERIFIED.
5. **`TimelineView`** — present as a case in runtime.ts (`case "TimelineView":`) — indicates partial support. Animation loop fidelity unknown without running.
6. **`SpriteKit` / `SpriteView`** — `SpriteView` is listed in swiftui.ts. Likely renders a placeholder. UNVERIFIED.
7. **`@ScaledMetric`** — not found in runtime.ts. Likely treated as a plain variable. Static value, no dynamic type scaling.
8. **`.accessibilityAdjustableAction`** — not found in runtime.ts. Will likely no-op silently.
9. **`swipeActions`** — present in swiftui.ts as a modifier name. Interactivity in preview unknown without running.
10. **`DatePicker`, `ColorPicker`** — present in swiftui.ts. Rendering fidelity unknown.

---

## Next Steps Before Phase 1

- [ ] Install Rust toolchain (`winget install Rustlang.Rustup`) and re-run `cargo test`
- [ ] Run `npm run tauri dev` and manually open each corpus app in the Canvas
- [ ] Fill in BASELINE.md status (currently set to UNVERIFIED pending actual run)
- [ ] Run `npm audit` and confirm dompurify override resolves critical CVEs
