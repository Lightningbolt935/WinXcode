# Known Limitations & Platform Compatibility Guide

> **Target Audience:** Students preparing submissions for Apple's Swift Student Challenge on Windows.  
> **Rule of Thumb:** WinXcode gets you 95% of the way there on Windows. **Always test on a real Mac or iPad before final submission.**

---

## 1. SwiftUI Live Canvas Preview Limitations

WinXcode includes a clean-room SwiftUI AST parser and SVG/HTML canvas renderer. It runs entirely in userland without calling macOS or Apple frameworks. While it renders the vast majority of standard UI (Text, Button, Image, List, Form, NavigationStack, etc.), the following gaps are known:

### A. Charts & Data Visualization (`SwiftUI Charts`)
- **Status:** **MOCK / SKIPPED**
- **Details:** The `Charts` framework (`Chart`, `BarMark`, `LineMark`, `AreaMark`, `SectorMark`, etc.) is parsed cleanly so your code does not crash, but rendered as a simplified visual wireframe/mock.
- **Student Advice:** If your challenge entry centers around data visualization or charts, test the exact visual layout on an iPad running Swift Playgrounds or a Mac running Xcode.

### B. Animations & Continuous Timers (`TimelineView`)
- **Status:** **STATIC SNAPSHOT (Marked with Banner: `animation not run`)**
- **Details:** `TimelineView(.animation)` and periodic timer publishers render a static frame evaluated at `Date.now()`.
- **Student Advice:** Continuous game loops or 60fps tick-driven animations will appear as a stationary frame in the live preview. Touch/tap interactions and state mutations (`withAnimation`) update state and re-render frames, but continuous automatic ticks require testing on hardware.

### C. Canvas & GraphicsContext Rendering Gaps
- **Status:** **SUPPORTED BASIC 2D PATHS (Advanced features skipped)**
- **Supported:** 2D shapes, lines, quadratic curves, arcs, fill colors, stroke widths, and affine transformations.
- **Unsupported/Skipped:** Complex custom CoreGraphics blend modes, custom GL/Metal shaders, gradient fills with non-linear color stops, and image convolution filters.

### D. System Chrome & Platform Differences
- System modal presentations (`.sheet`, `.fullScreenCover`), alerts, and confirmation dialogs render within the simulated iPhone bezel. Exact native spring animations, haptic feedback, and system status bar styling are approximated.

---

## 2. Swift Language & Runtime Gaps

WinXcode's interpreter parses modern Swift 5.9 and 6.0 constructs, but certain advanced constructs differ from Apple's closed-source compiler (`swiftc`):

| Language Construct | WinXcode Support Status | Notes / Limitations |
|---|---|---|
| **Structs, Enums, Protocols** | Supported | Enums with associated values and protocol extension defaults dispatch correctly. |
| **`@State`, `@Binding`, `@AppStorage`** | Supported (Shimmed) | `@AppStorage` persists locally across re-renders in `localStorage`. |
| **Generics** | Basic Supported | Standard generic types (e.g. `Array<T>`, `Dictionary<K, V>`, simple generic views) work. Complex generic constraints with recursive existential dynamic dispatch may skip. |
| **Property Observers (`didSet`, `willSet`)** | Basic Skipped | Setting struct properties does not trigger arbitrary custom `didSet` blocks. |
| **External Swift Packages (SPM)** | Uncompiled in Preview | External third-party binary libraries cannot be compiled in the JavaScript preview engine. Keep submissions self-contained or standard-library-only. |

---

## 3. Submission Check (Pre-Flight Validator) Scope

The WinXcode Submission Check panel is a static pre-flight validator. It catches the most frequent automatic disqualification issues:
1. Hard zip limit: Rejects archives over 500 MB (Apple limit).
2. Prohibited network connectivity (`URLSession`, `Network`, remote images without fallback).
3. Prohibited authentication gates (Sign in with Apple, Firebase Auth, OAuth).
4. Prohibited judge tracking & analytics SDKs.
5. Missing referenced assets and missing `ATTRIBUTIONS.md` documentation.

### What the Validator CANNOT Detect
- **Swift Compiler Errors:** The validator does not run Apple's closed-source `swiftc`. Code that fails to compile in Xcode due to deep type inference mismatches or missing iOS-only framework headers will not be caught by static regex/AST scanning.
- **Subjective Apple Judging Criteria:** Apple judges evaluate submissions on technical accomplishment, creativity, and the quality of the 3-minute experience. WinXcode cannot score creativity or design quality.

---

## 4. "Needs a Mac to be Sure": How to Verify Before Submitting

Never submit your Swift Student Challenge entry without testing on an Apple device at least once:
1. **Borrow an iPad or Mac:** Ask a school friend, relative, computer lab, or teacher with a Mac (running macOS 14+ with Xcode 16+) or an iPad (running iPadOS 17+ with Swift Playgrounds 4.5+).
2. **Export your ZIP:** Click **Submission Check -> Export Submission ZIP** in WinXcode.
3. **AirDrop or Transfer:** Send the resulting `MyApp-Submission.zip` to the device.
4. **Follow `docs/MAC_VERIFICATION.md`:** Run through the 10-step verification checklist to verify it opens, compiles, and plays smoothly within the 3-minute judging window.
