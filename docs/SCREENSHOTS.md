# WinXcode Visual Screenshot Harness

This guide explains how to capture and inspect live visual screenshots of the Canvas preview for all 20 benchmark applications (10 Corpus 1 student apps and 10 Corpus 2 open-source apps).

> **Policy on Verification:**
> In accordance with project policy, screenshots must be inspected visually. Automated passes or headless tests do not substitute for examining the rendered PNG images.

---

## 1. Prerequisites

Ensure you have Node.js (v18+ or v20+) installed.

If Playwright is not yet installed in your environment, install it once:
```powershell
npm install -D playwright
npx playwright install chromium
```

---

## 2. Automated Run (Windows PowerShell)

The screenshot runner connects to the running Vite development server, loads each Swift file into the Canvas via the dev query loader (`?file=...`), and saves high-resolution PNG captures.

### Step 1: Start the Frontend Dev Server
In **Terminal 1**:
```powershell
cd XWinCode
npm run dev
```
Confirm the output shows Vite listening on port 1420:
```text
  VITE v8.3.2  ready in 450 ms

  ➜  Local:   http://localhost:1420/
```

### Step 2: Run the Screenshot Tool
In **Terminal 2** (from the repository root):
```powershell
node scripts/screenshot-corpus.mjs
```

The script will launch headless Chromium, navigate to each app, wait for the Canvas and device frame to settle, and save the screenshots into `tests/screenshots/`.

---

## 3. Output Artifacts

The captured PNG files are written to:
`tests/screenshots/`

### Corpus 1: Student Apps
| File | App | Key Constructs |
| :--- | :--- | :--- |
| `corpus1_01_counter.png` | 01 Counter | `@State`, `Button`, `Text`, `VStack` |
| `corpus1_02_quiz.png` | 02 Quiz | `NavigationStack`, `NavigationLink`, `ProgressView` |
| `corpus1_03_todo.png` | 03 Todo | `List`, `ForEach`, `TextField` |
| `corpus1_04_onboarding.png` | 04 Onboarding | `TabView(.page)`, `@AppStorage`, `.symbolEffect` |
| `corpus1_05_settings.png` | 05 Settings | `Form`, `Toggle`, `Picker`, `Slider`, `DatePicker` |
| `corpus1_06_drawing.png` | 06 Drawing | `Canvas`, `Path`, `DragGesture`, `GraphicsContext` |
| `corpus1_07_charts.png` | 07 Charts | `Chart`, `BarMark`, `LineMark` |
| `corpus1_08_game.png` | 08 Game | `Canvas`, `TimelineView(.animation)`, game loop |
| `corpus1_09_observable.png` | 09 Observable | `@Observable` macro, `@Environment` |
| `corpus1_10_accessibility.png` | 10 Accessibility | `@ScaledMetric`, `.accessibilityAdjustableAction` |

### Corpus 2: External Open-Source Apps
| File | App | Source |
| :--- | :--- | :--- |
| `corpus2_01_food_truck.png` | 01 FoodTruck | Apple Inc. Sample Code |
| `corpus2_02_simple_news.png` | 02 SimpleNews | Paul Hudson (twostraws) |
| `corpus2_03_simple_notes.png` | 03 SimpleNotes | Paul Hudson (twostraws) |
| `corpus2_04_simple_scores.png` | 04 SimpleScores | Paul Hudson (twostraws) |
| `corpus2_05_simple_todo.png` | 05 SimpleToDo | Paul Hudson (twostraws) |
| `corpus2_06_calculator.png` | 06 Calculator | Swiftify |
| `corpus2_07_capy_timer.png` | 07 CapyTimer | andev0x |
| `corpus2_08_make_it_so.png` | 08 MakeItSo | Peter Friese |
| `corpus2_09_countries.png` | 09 Countries | Alexey Naumov |
| `corpus2_10_control_room.png` | 10 ControlRoom | Paul Hudson |

---

## 4. Interactive Browser Preview

You can also preview any individual Swift file directly in Google Chrome, Microsoft Edge, or Firefox by opening:

- `http://localhost:1420/?file=tests/corpus/01_counter/ContentView.swift`
- `http://localhost:1420/?file=tests/corpus2/07_capy_timer/ContentView.swift`

This activates the dev loader, automatically mounts the simulated project environment, loads the file into Monaco Editor, and activates the live Canvas preview with instant hot-reloading on changes.

---

## 5. Visual Inspection Checklist

When inspecting the generated PNG images in `tests/screenshots/`, check against the 4 tiers:
1. **CLEAN**: Full iPhone device frame, crisp text and controls, no warning banners.
2. **DEGRADED**: Yellow banner (`⚠️ Degraded: ...`) indicating dropped visual modifiers (e.g. sheets, alerts, toolbars).
3. **BEHAVIOR SKIPPED**: Purple banner (`⚡ BEHAVIOR SKIPPED · Runtime & interactions skipped · Check on iPhone →`) for runtime hooks (`task`, `onAppear`, `onChange`, gestures).
4. **EMPTY / FAILED**: Red syntax error banner, `⚠️ Unsupported View`, or nearly blank preview ($\le 3$ nodes).
