# WinXcode SwiftUI Interpreter & Preview Coverage

This document is the authoritative coverage specification for the WinXcode headless/desktop SwiftUI preview engine. It is generated from `src/lib/preview/swiftui.ts` and `src/lib/preview/runtime.ts`.

**Last updated**: 2026-11-15  
**Engine version**: Tauri 2 + React 19 + WinXcode Parser/Runtime 2.0  
**Test Suite**: 41 unit & corpus harness tests passing

---

## 1. Executive Summary

| Construct Category | Total Supported | Degraded (Visual Dropped) | Behavior Skipped (Runtime) | Ignored (Safe No-Op) | Explicitly Unsupported |
|:-------------------|:----------------|:--------------------------|:---------------------------|:---------------------|:-----------------------|
| **Views & Containers** | **62** | — | — | 0 | **15** (visible callout) |
| **View Modifiers** | **57** | **114** (amber banner) | **20** (purple banner) | **52** (safe no-op) | Fall-through emits diagnostic |
| **Property Wrappers** | **14** | — | — | 0 | 0 |
| **Runtime Shims** | **2** (`DispatchQueue.asyncAfter`, `@AppStorage`) | — | — | — | — |

---

## 2. Supported Views (62)


### Layout & Containers
| View | Description / Behavior in Preview |
|:-----|:----------------------------------|
| `VStack` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `HStack` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `ZStack` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `LazyVStack` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `LazyHStack` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `LazyVGrid` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `LazyHGrid` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Grid` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `GridRow` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `ScrollView` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `ScrollViewReader` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Group` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `ViewThatFits` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Spacer` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Divider` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Section` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |


### Controls & Inputs
| View | Description / Behavior in Preview |
|:-----|:----------------------------------|
| `Button` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Toggle` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Slider` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Stepper` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `TextField` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `SecureField` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `TextEditor` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Picker` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `DatePicker` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `ColorPicker` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Link` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Menu` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `ShareLink` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |


### Display & Content
| View | Description / Behavior in Preview |
|:-----|:----------------------------------|
| `Text` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Image` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Label` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `ProgressView` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `ContentUnavailableView` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `EmptyView` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |


### Navigation & Hierarchy
| View | Description / Behavior in Preview |
|:-----|:----------------------------------|
| `NavigationStack` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `NavigationView` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `NavigationSplitView` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `NavigationLink` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `TabView` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Tab` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `DisclosureGroup` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |


### Shapes & Gradients
| View | Description / Behavior in Preview |
|:-----|:----------------------------------|
| `Rectangle` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `RoundedRectangle` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `UnevenRoundedRectangle` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Circle` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Capsule` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `Ellipse` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `ContainerRelativeShape` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `LinearGradient` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `RadialGradient` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `AngularGradient` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |


### Panels & Grouping
| View | Description / Behavior in Preview |
|:-----|:----------------------------------|
| `Form` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `List` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `ControlGroup` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `GroupBox` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `LabeledContent` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |
| `GeometryReader` | Native HTML/SVG rendering with exact iOS metrics, dark mode, and state bindings |


---

## 3. Supported View Modifiers (57)

These modifiers alter the layout, styling, text presentation, or behavior of view nodes in the preview hierarchy:

| Category | Modifiers |
|:---------|:----------|
| **Layout & Spacing** | `.padding`, `.frame`, `.fixedSize`, `.offset`, `.position`, `.aspectRatio`, `.scaledToFit`, `.scaledToFill`, `.layoutPriority`, `.ignoresSafeArea` |
| **Styling & Color** | `.background`, `.overlay`, `.foregroundStyle`, `.foregroundColor`, `.tint`, `.accentColor`, `.opacity`, `.shadow`, `.border`, `.clipShape`, `.cornerRadius` |
| **Typography** | `.font`, `.fontWeight`, `.bold`, `.italic`, `.underline`, `.strikethrough`, `.lineLimit`, `.multilineTextAlignment`, `.textCase`, `.truncationMode`, `.kerning` |
| **Control & Interaction** | `.onTapGesture`, `.disabled`, `.buttonStyle`, `.pickerStyle`, `.textFieldStyle`, `.toggleStyle`, `.listStyle`, `.badge`, `.tag`, `.tabItem` |
| **Animations & Transitions** | `.animation`, `.transition`, `.scaleEffect`, `.rotationEffect`, `.rotation3DEffect`, `.blur` |

---

## 4. Property Wrappers (14)

| Property Wrapper | Status | Implementation & Coverage |
|:-----------------|:-------|:--------------------------|
| `@State` | **Full** | Reactive local view state, triggers re-render on mutation |
| `@Binding` | **Full** | Two-way binding via `$` prefix, reads/writes parent or constant slot |
| `@AppStorage` | **Full (Shimmed)** | Persistent key-value storage backed by memory + localStorage (`winxcode:appstorage:*`), shared across views & re-renders |
| `@Observable` | **Full** | Swift 5.9 observation macro: classes track property access, @Environment(Type.self) injection, @Bindable support |
| `@Bindable` | **Full** | Creates two-way bindings to properties on @Observable model objects |
| `@Environment` | **Partial** | Supports colorScheme, dismiss, horizontalSizeClass, verticalSizeClass, and custom @Observable types by type name |
| `@EnvironmentObject` | **Partial** | Resolves shared objects by type name from runtime environment |
| `@StateObject` | **Full** | Instantiates and retains ObservableObject across view evaluations |
| `@ObservedObject` | **Full** | Observes external ObservableObject instances |
| `@ScaledMetric` | **Full** | Scales numeric dimensions relative to current Dynamic Type size |
| `@FocusState` | **Stub** | Focus binding state tracked in view slot |
| `@GestureState` | **Stub** | Transient gesture tracking state |
| `@SceneStorage` | **Stub** | Scene-level state stored in view slot |
| `@Query` | **Stub** | SwiftData query wrapper defaults to empty array placeholder |

---

## 5. Degraded Modifiers (114 — Visual Effects Dropped)

When encountered, these modifiers have real visual presentation, styling, layout, or modal consequences that the preview engine does not currently render.

**Honesty guarantee**: Rather than silently ignoring them, the engine tags them with `@degraded:<name>` and the Canvas displays a prominent amber warning banner:  
*"Visual effects dropped · Check on iPhone"*.

```
.// Animations (4)
  "contentTransition(), .// Charts (11)
  "chartXAxis(), .// Colors(), .// Component Styles (8)
  "labelStyle(), .// Graphics(), .// Layout Sizing & Padding (12)
  "safeAreaInset(), .// List & Scroll Layout/Styling (15)
  "listRowSeparator(), .// Navigation & Toolbars (8)
  "toolbar(), .// Presentation & Modal Overlays (11)
  "sheet(), .// Symbols & Badges (5)
  "symbolRenderingMode(), .// Typography & Text Layout (11)
  "monospacedDigit(), .Compositing & Masking (7)
  "compositingGroup(), .Filters & Shaders (12)
  "brightness(), .alert(), .allowsTightening(), .annotation(), .badge(), .baselineOffset(), .blendMode(), .blur(), .buttonBorderShape(), .chartForegroundStyleScale(), .chartLegend(), .chartPlotStyle(), .chartXScale(), .chartYAxis(), .chartYScale(), .colorInvert(), .colorMultiply(), .confirmationDialog(), .containerRelativeFrame(), .contentMargins(), .contextMenu(), .contrast(), .datePickerStyle(), .defaultScrollAnchor(), .dynamicTypeSize(), .dynamicTypeSizeIfAvailable(), .fileExporter(), .fileImporter(), .fixedSize(), .focusEffectDisabled(), .foregroundStyleBy(), .foregroundStyleIfAvailable(), .frameIfAvailable(), .fullScreenCover(), .gaugeStyle(), .grayscale(), .headerProminence(), .hoverEffect(), .hueRotation(), .imageScaleIfAvailable(), .indexViewStyle(), .inspector(), .interpolationMethod(), .kerning(), .keyframeAnimator(), .layoutPriority(), .lineHeight(), .listItemTint(), .listRowBackground(), .listRowInsets(), .listRowSpacing(), .listSectionSeparator(), .listSectionSpacing(), .luminanceToAlpha(), .mask(), .matchedGeometryEffect(), .menuStyle(), .minimumScaleFactor(), .multilineTextAlignmentIfAvailable(), .navigationBarBackButtonHidden(), .navigationBarHidden(), .navigationDestination(), .navigationSplitViewColumnWidth(), .navigationSplitViewStyle(), .persistentSystemOverlays(), .phaseAnimator(), .photosPicker(), .popover(), .presentationBackground(), .presentationCornerRadius(), .presentationDetents(), .presentationDragIndicator(), .progressViewStyle(), .redacted(), .refreshable(), .safeAreaPadding(), .safeAreaPaddingIfAvailable(), .saturation(), .scenePadding(), .scrollClipDisabled(), .scrollContentBackground(), .scrollIndicators(), .scrollTransition(), .searchable(), .statusBarHidden(), .swipeActions(), .symbolEffect(), .symbolSize(), .symbolVariant(), .tabItemBadge(), .tabViewStyle(), .tableStyle(), .toggleStyle(), .toolbarBackground(), .toolbarColorScheme(), .toolbarRole(), .toolbarTitleDisplayMode(), .tracking(), .truncationMode(), .unredacted(), .visualEffect(), .zIndex()
```

---

## 6. Behavior Skipped Modifiers (20 — Runtime Behavior Skipped)

When encountered, these modifiers affect lifecycle execution, data binding, or interactive gestures that do not execute in static preview mode.

**Honesty guarantee**: Rather than treating them as inert, the engine tags them with `@behavior:<name>` and the Canvas displays a purple callout banner:  
*"Runtime & interactions skipped · Check on iPhone"*.

```
.// Environment & Data Injection (3)
  "environment(), .// Gestures & User Interactions (12)
  "gesture(), .// Lifecycle & Asynchronous Tasks (5)
  "task(), .defersSystemGestures(), .draggable(), .dropDestination(), .environmentObject(), .highPriorityGesture(), .modelContainer(), .onAppear(), .onChange(), .onContinuousHover(), .onDisappear(), .onDrag(), .onDrop(), .onHover(), .onKeyPress(), .onLongPressGesture(), .onReceive(), .simultaneousGesture()
```

---

## 7. Ignored Modifiers (52 — Safe No-Ops)

When encountered, these modifiers are acknowledged, classified as **IGNORED**, recorded in diagnostics (`@ignored:<name>`), and return the view tree unmodified. They have truly no visual or runtime impact on the preview (pure metadata or accessibility).

```
.// Accessibility (18)
  "accessibilityLabel(), .// Identity(), .// Input & Keyboard Hints (10)
  "keyboardType(), .// System(), .Metadata(), .Privacy (5)
  "id(), .Scroll & Performance Hints without static visual disruption (16)
  "allowsHitTesting(), .accessibilityAction(), .accessibilityAddTraits(), .accessibilityAdjustableAction(), .accessibilityChildren(), .accessibilityElement(), .accessibilityHeading(), .accessibilityHidden(), .accessibilityHint(), .accessibilityIdentifier(), .accessibilityInputLabels(), .accessibilityRespondsToUserInteraction(), .accessibilityRotor(), .accessibilityScrollAction(), .accessibilityShowsLargeContentViewer(), .accessibilitySortPriority(), .accessibilityValue(), .accessibilityZoomAction(), .autocapitalization(), .autocorrectionDisabled(), .contentShape(), .coordinateSpace(), .disableAutocorrection(), .drawingGroup(), .flipsForRightToLeftLayoutDirection(), .focusable(), .focused(), .geometryGroup(), .help(), .interactiveDismissDisabled(), .onGeometryChange(), .onScrollGeometryChange(), .onSubmit(), .preferredColorSchemeIfAvailable(), .privacySensitive(), .privacySensitiveIfAvailable(), .scrollBounceBehavior(), .scrollDismissesKeyboard(), .scrollPosition(), .scrollTargetBehavior(), .scrollTargetLayout(), .sensoryFeedback(), .springLoadingBehavior(), .submitLabel(), .textInputAutocapitalization(), .textSelection()
```

### Accessibility Classification
Accessibility modifiers (`.accessibilityLabel`, `.accessibilityHint`, `.accessibilityAdjustableAction`, `.accessibilityAction`, `.accessibilityHeading`, `.accessibilitySortPriority`, etc.) are recognized as Level 2 IGNORED. They do not alter visual layout on device frames, allowing student apps with high accessibility marks to render cleanly without errors.

---

## 8. Explicitly Unsupported Views (15)

When the preview interpreter encounters any of these constructs, it creates an `Unsupported` node and emits a Level 1 **UNSUPPORTED** diagnostic. 

**Honesty guarantee**: The Canvas displays a visible callout banner with an amber warning:  
*"Renders on device only · Check on iPhone"*.

| Unsupported View | Rationale / Hardware Requirement | Workaround / Next Step |
|:-----------------|:----------------------------------|:-----------------------|
| `Canvas` | Requires Metal / CoreGraphics native 2D rasterizer | Use **Live on iPhone** link (Phase 1b proposal below) |
| `Chart` | Apple Swift Charts framework | Use **Live on iPhone** link (Phase 1b proposal below) |
| `Map` | Apple MapKit framework (requires Apple Maps tiles & auth) | Test on connected iPhone |
| `VideoPlayer` | AVKit / AVPlayer native media pipeline | Test on connected iPhone |
| `SpriteView` | SpriteKit 2D game engine | Test on connected iPhone |
| `SceneView` | SceneKit 3D graphics engine | Test on connected iPhone |
| `RealityView` | RealityKit AR / spatial framework | Test on connected iPhone |
| `Model3D` | RealityKit 3D USDZ renderer | Test on connected iPhone |
| `PhotosPicker` | Requires iOS Photo Library permission & sheet | Mock with local asset images |
| `CameraView` | Requires AVFoundation camera capture hardware | Test on connected iPhone |
| `SignInWithAppleButton` | Requires Apple Developer Team ID and Apple ID auth daemon | Prohibited in Student Challenge |
| `PasteButton` | UIPasteboard system sandbox integration | Test on connected iPhone |
| `Gauge` | WatchOS / iOS gauge widget rendering | Test on connected iPhone |
| `MultiDatePicker` | Multi-selection calendar sheet | Test on connected iPhone |

---

## 9. Shims & Runtime Systems

### 7.1 @AppStorage Persistence

The WinXcode interpreter backs `@AppStorage` with a dual-layer persistent storage system:
1. **In-Memory Store (`APP_STORAGE`)**: Global `Map<string, V>` that persists across view re-renders, view transitions, and separate `Runtime` instances within the session.
2. **Web Storage Layer (`localStorage`)**: Keys are serialized to `localStorage` using the namespace prefix `winxcode:appstorage:<key>`. This allows state to survive page reloads and IDE restarts.
3. **Sharing**: Multiple views referencing the same key (e.g. `@AppStorage("isDarkMode")`) immediately share and sync state upon mutation.

#### Known Limits & Boundaries
- **Supported Value Types**: `Bool`, `Int`, `Double`/`CGFloat`, `String`, and JSON-serializable enums (`RawRepresentable` with `String` or `Int` raw values).
- **Unsupported Value Types**: Complex arbitrary `Codable` structs containing custom objects, raw binary `Data`, and security-scoped bookmark URLs are not persisted.
- **Custom Suites**: `store: UserDefaults(suiteName: ...)` is mapped to the same persistent key-value namespace.
- **Cross-Device Sync**: Storage is local to the WinXcode host machine. It does not sync to iCloud KVS or device UserDefaults.

### 7.2 DispatchQueue.main.asyncAfter & Timer Queue

The runtime includes a deterministic timer queue for asynchronous delayed executions:
1. **Ordering Guarantee**: Timers are ordered strictly by `(dueMs, seq)`. If two tasks have different deadlines, earlier tasks always execute before later ones. If two tasks have identical deadlines, they execute in exact FIFO sequence order.
2. **Time Expressions**:
   - `DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) { ... }`
   - `DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(2)) { ... }`
   - `DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(500)) { ... }`
   - `DispatchQueue.main.async { ... }` (scheduled with 0 delay)
3. **Deterministic Testing Controls**:
   - `rt.advanceTimers(ms)`: Advances virtual clock by `ms` and executes all timers that became due.
   - `rt.flushTimers()`: Immediately runs all pending timers in strict order.
   - `rt.clearTimers()`: Clears all pending timers and timers on reset.
4. **Canvas Integration**: When a scheduled timer mutates view state, `rt.onUpdate` fires, automatically re-rendering the Canvas.
