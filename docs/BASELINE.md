# Phase 0 Baseline — Canvas Preview Results

**Date:** 2026-11-15  
**Method:** Static analysis of `src/lib/preview/runtime.ts` and `swiftui.ts` (interpreter source);  
manual Canvas run UNVERIFIED (Rust toolchain not installed on this machine).

> [!IMPORTANT]
> Status column is derived from source-code analysis, **not from actually running the Canvas preview**.  
> Statuses marked `UNVERIFIED` must be confirmed by running `npm run tauri dev` and opening each file.  
> See `docs/NOTES.md` for the action list.

---

## Summary Table

| # | App | Constructs under test | Predicted status | First failing construct | Confidence |
|---|---|---|---|---|---|
| 01 | Counter | `@State`, `Button`, `Text`, `VStack`, `HStack`, `Image(systemName:)`, `.font`, `.foregroundStyle` | ✅ renders | — | High |
| 02 | Quiz | `NavigationStack`, `NavigationLink`, `@State`, `ProgressView`, `ForEach`, `List`, conditional views, `DispatchQueue` | ⚠️ renders-wrong | `DispatchQueue.main.asyncAfter` — no async support | Medium |
| 03 | Todo | `List`, `ForEach`, `@State` array, `.swipeActions`, `TextField`, `Toggle`, `.toolbar` | ⚠️ renders-wrong | `.swipeActions` interactivity unknown | Medium |
| 04 | Onboarding | `TabView(.page)`, `.tabViewStyle`, `@AppStorage`, `PageTabViewStyle`, `.symbolEffect` | ⚠️ renders-wrong | `@AppStorage` read/write, `.symbolEffect` | Medium |
| 05 | Settings | `Form`, `Section`, `Toggle`, `Picker`, `Slider`, `Stepper`, `DatePicker`, `@AppStorage`, `.pickerStyle(.navigationLink)` | ⚠️ renders-wrong | `DatePicker` binding, `.pickerStyle(.navigationLink)` | Medium |
| 06 | Drawing | `Canvas`, `Path`, `DragGesture`, `GraphicsContext` | ✅ renders | — | High |
| 07 | Charts | `Chart`, `BarMark`, `LineMark`, `AreaMark`, `Charts` import | ⚠️ UNVERIFIED | Charts rendering depth unknown | Low |
| 08 | Game | `TimelineView(.animation)`, `Canvas`, `DragGesture`, game loop | ⚠️ renders-wrong | `TimelineView` animation tick — no real clock | Medium |
| 09 | @Observable | `@Observable` macro, `@Environment`, `@Bindable`, `ColorPicker` | ❌ crashes/unsupported | `@Observable` — macro not in interpreter | High |
| 10 | Accessibility | `@ScaledMetric`, `.accessibilityAdjustableAction`, `.accessibilityElement(children:)`, `.accessibilityHint` | ⚠️ renders-wrong | `@ScaledMetric` — no dynamic type scaling; `.accessibilityAdjustableAction` no-ops | High |

**Predicted pass rate:** ~2–3 of 10 render fully correctly (apps 01, 06; possibly 07). Go/no-go threshold is 5/10.

> [!WARNING]
> **Go/no-go decision is DEFERRED** until the app can actually be run. The source analysis predicts we are under the 5/10 threshold based on common failure modes, but this must be confirmed with actual rendering. The plan's fallback ("smaller iPhone-preview tool") may apply — but the "Live on iPhone" path in preview.rs is a first-class feature of this repo that works without the JS interpreter.

---

## Per-App Detail

### 01 — Counter (`@State`, `Button`, `Text`)
**Status:** ✅ Renders (predicted)  
**Evidence:** `@State` → `STATE_ATTRS` list in runtime.ts line 103. `Button`, `Text`, `VStack`, `HStack`, `Image`, `.font`, `.foregroundStyle`, `.padding` all present in swiftui.ts.  
**First failing construct:** None predicted.

---

### 02 — Quiz (`NavigationStack`, `NavigationLink`, `ProgressView`)
**Status:** ⚠️ Renders-wrong (predicted)  
**Evidence:** `NavigationStack`, `NavigationLink`, `ProgressView`, `ForEach` are all in swiftui.ts. `DispatchQueue.main.asyncAfter` is not a SwiftUI view — the interpreter will likely throw a `Fault` or silently ignore it, breaking the auto-advance-on-answer feature. The quiz will render but the transition to next question won't auto-fire.  
**First failing construct:** `DispatchQueue.main.asyncAfter`

---

### 03 — Todo (`List`, `swipeActions`, `TextField`)
**Status:** ⚠️ Renders-wrong (predicted)  
**Evidence:** `List`, `ForEach`, `TextField`, `Toggle`, `.toolbar` are in swiftui.ts. `swipeActions` is listed as a modifier name. Whether the interactive swipe gesture fires in the Canvas preview is unknown (likely no-op since gesture simulation is complex).  
**First failing construct:** `.swipeActions` interactivity (renders statically but not interactively swipeable)

---

### 04 — Onboarding (`TabView`, `@AppStorage`, `.symbolEffect`)
**Status:** ⚠️ Renders-wrong (predicted)  
**Evidence:** `TabView`, `tabViewStyle` present. `@AppStorage` is NOT in STATE_ATTRS — it falls through to a plain property definition. Persistence won't work but initial render may be OK. `.symbolEffect` is in swiftui.ts as a modifier name — rendering effect is a no-op in JS.  
**First failing construct:** `@AppStorage` write-back (read of default value may work, but writes won't persist)

---

### 05 — Settings (`Form`, `DatePicker`, `Stepper`)
**Status:** ⚠️ Renders-wrong (predicted)  
**Evidence:** `Form`, `Section`, `Toggle`, `Picker`, `Slider`, `Stepper`, `DatePicker` are all in swiftui.ts. `.pickerStyle(.navigationLink)` pushes to a navigation stack — this will likely render as a flat cell without navigation in the Canvas. `DatePicker` binding with `Date.now.timeIntervalSince1970` may trip the interpreter on `Date` construction.  
**First failing construct:** `Date(timeIntervalSince1970:)` — `Date` struct not in interpreter stdlib

---

### 06 — Drawing (`Canvas`, `Path`, `DragGesture`)
**Status:** ✅ Renders (predicted)  
**Evidence:** `Canvas`, `Path`, `DragGesture` are explicitly handled in swiftui.ts. `GraphicsContext` drawing with `stroke(_:with:style:)` is a core interpreter feature.  
**First failing construct:** None predicted. DragGesture interaction in Canvas preview UI is likely functional.

---

### 07 — Charts (`Chart`, `BarMark`, `LineMark`, `AreaMark`)
**Status:** ⚠️ UNVERIFIED  
**Evidence:** `Chart`, `BarMark`, `LineMark`, `AreaMark`, `PointMark`, `chartXAxis`, `chartYAxis` are listed as known names in swiftui.ts. Whether they produce actual chart rendering or just placeholders is unknown without running.  
**First failing construct:** UNVERIFIED — must run to determine.

---

### 08 — Game (`TimelineView`, `Canvas`, animation loop)
**Status:** ⚠️ Renders-wrong (predicted)  
**Evidence:** `TimelineView` has a case in runtime.ts but the animation timeline scheduler (60 fps clock) likely doesn't run as a real loop in the static Canvas preview. The `tick()` function that mutates `@State` via `DispatchQueue`-equivalent will not fire. The Canvas will render a static first frame with no movement.  
**First failing construct:** `TimelineView(.animation)` — no real clock loop in JS preview

---

### 09 — @Observable (`@Observable` macro, `@Environment`, `@Bindable`)
**Status:** ❌ Crashes/unsupported (predicted)  
**Evidence:** `@Observable` is a Swift 5.9 attached macro. The parser does not handle `@Observable` class declarations as equivalent to `@StateObject`/`@ObservedObject`. The runtime has no `Observation` framework simulation. The `@Bindable` attribute is in the runtime (line 525) but requires `@Observable` instance. `@Environment(ThemeSettings.self)` with a custom Observable class type (not an EnvironmentKey) is not handled.  
**First failing construct:** `@Observable` macro on `class ThemeSettings` — will likely parse as unknown attribute, then fail on `@Environment(ThemeSettings.self)` with no EnvironmentKey

---

### 10 — Accessibility (`@ScaledMetric`, `.accessibilityAdjustableAction`)
**Status:** ⚠️ Renders-wrong (predicted)  
**Evidence:** `accessibilityLabel`, `accessibilityHint`, `accessibilityValue`, `accessibilityElement`, `accessibilityHidden`, `accessibilityAddTraits`, `accessibilityIdentifier` — all in swiftui.ts as modifier names (likely stored as metadata). `@ScaledMetric` NOT in STATE_ATTRS → treated as a plain `CGFloat` (no dynamic scaling). `.accessibilityAdjustableAction` NOT found in runtime → silent no-op. The view will render but the custom slider adjustment won't work.  
**First failing construct:** `@ScaledMetric` — no DynamicType simulation (cosmetic, not crash)

---

## Coverage Summary (from source analysis)

### ✅ Supported (confirmed in swiftui.ts / runtime.ts)
**Container views:** VStack, HStack, ZStack, Group, ScrollView, List, Form, Section, Grid, GridRow, LazyVStack, LazyHStack, LazyVGrid, LazyHGrid, NavigationStack, NavigationLink, TabView, GeometryReader, GroupBox, DisclosureGroup  
**Content views:** Text, Image, Button, TextField, SecureField, TextEditor, Toggle, Picker, Slider, Stepper, DatePicker, ColorPicker, Label, Link, Divider, Spacer, ProgressView, Gauge, Menu  
**Shape views:** Rectangle, Ellipse, Circle (via clipShape/fill), RoundedRectangle, Capsule, Path, Canvas  
**Gradients:** LinearGradient, RadialGradient, AngularGradient  
**Property wrappers:** @State, @Binding, @StateObject, @ObservedObject, @EnvironmentObject, @Environment (key-based), @Bindable, @AppStorage (read-only default), @FocusState  
**Modifiers:** 100+ modifiers including padding, frame, background, overlay, foregroundStyle, font, shadow, cornerRadius, clipShape, animation, transition, offset, opacity, rotation, gesture, toolbar, sheet, alert, confirmationDialog, navigationTitle, and many more

### ⚠️ Partial / unknown fidelity
**Chart views** — present but rendering depth UNVERIFIED  
**TimelineView** — present but animation loop fidelity UNVERIFIED  
**swipeActions** — stored as modifier, interactivity unknown  
**DatePicker** — present, `Date` stdlib support unknown  

### ❌ Not supported (not found in source)
**@Observable macro** — Swift 5.9+ only; no interpreter analog  
**@ScaledMetric** — not in STATE_ATTRS, treated as plain value  
**.accessibilityAdjustableAction** — not in modifier handler  
**DispatchQueue.main.asyncAfter** — no async runtime  
**SpriteKit / ARKit** — SpriteView likely placeholder  
**UIKit interop** — no UIViewRepresentable support  

---

## Go/No-Go Recommendation

**DEFERRED** — requires actual app run to confirm.  
Predicted pass rate is 2–3/10 fully correct renders, below the 5/10 threshold.  
However:
- The **"Live on iPhone"** feature (`preview.rs`) is a first-class alternative path and works without the JS interpreter.
- The **unsupported report** (Phase 1 task) would surface failures honestly instead of rendering wrong.
- The 5/10 threshold in the plan is specifically for **"renders acceptably"** — with the unsupported panel added in Phase 1, apps that show a clear "X is not supported, use Live on iPhone" message count as acceptable.

**Recommendation:** Proceed to run the app with Rust installed. If the actual run confirms ≥5/10 render acceptably (including honest unsupported messages), continue to Phase 1. If not, evaluate the "Live on iPhone only" fallback.
