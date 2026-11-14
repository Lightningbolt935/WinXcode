# Corpus 2 Sources, Licenses & Audit Manifest

This corpus consists of 10 real-world, permissively licensed open-source SwiftUI applications NOT written by us. These serve as an honest, external benchmark for the WinXcode SwiftUI preview engine.

All source repositories have been verified, with pinned git commit hashes and official license files mirrored directly into each application subdirectory.

---

## Benchmark Audit Summary

| # | App | Source | License | Scope Fed | Level | View Nodes | Diagnostics | First Failing / Dropped Construct |
|:--|:----|:-------|:--------|:----------|:------|:-----------|:------------|:-----------------------------------|
| 01 | **FoodTruck** | `apple/sample-food-truck` | Apple Sample Code (MIT-style) | UI Excerpt (2 files) | **DEGRADED** | 21 nodes | 2 | `@ignored:onChange`, `@ignored:environmentObject` (missing external SPM packages) |
| 02 | **SimpleNews** | `twostraws/simple-swiftui` | MIT | Whole Project (6 files) | **DEGRADED** | 5 nodes | 1 | `@ignored:task` (async network fetch skipped; renders loading state) |
| 03 | **SimpleNotes** | `twostraws/simple-swiftui` | MIT | Whole Project (3 files) | **DEGRADED** | 16 nodes | 2 | `@ignored:onAppear`, `@ignored:onChange` |
| 04 | **SimpleScores** | `twostraws/simple-swiftui` | MIT | Whole Project (7 files) | **DEGRADED** | 9 nodes | 7 | `~FileManager`, `.onDelete()`, `@degraded:toolbar`, `@degraded:alert` |
| 05 | **SimpleToDo** | `twostraws/simple-swiftui` | MIT | Whole Project (8 files) | **DEGRADED** | 1 node | 4 | `~FileManager`, `.onDelete()`, `@degraded:toolbar` (empty list due to missing disk state) |
| 06 | **Calculator** | `Swiftify-Corp/Calculator-SwiftUI` | MIT | Whole Project (7 files) | **FAILED** | 1 node | 6 | `CalculatorBrain.swift:179` (`Expected a name` on `case .operand(let value):`), fallback to Unsupported |
| 07 | **CapyTimer** | `andev0x/CapyTimer` | MIT | UI Excerpt + Theme (6 files) | **DEGRADED** | 56 nodes | 2 | `@degraded:sheet`, `@ignored:onAppear` (all views, cards & progress ring render) |
| 08 | **MakeItSo** | `peterfriese/MakeItSo` | Apache-2.0 | UI Excerpt (3 files) | **DEGRADED** | 2 nodes | 1 | `@degraded:sheet` (Firestore SDK omitted; standalone view rendered) |
| 09 | **Countries** | `nalexn/clean-architecture-swiftui` | MIT | UI Excerpt (3 files) | **DEGRADED** | 1 node | 2 | `@ignored:onReceive`, `@ignored:flipsForRightToLeftLayoutDirection` |
| 10 | **ControlRoom** | `twostraws/ControlRoom` | MIT | UI Excerpt (1 file) | **DEGRADED** | 6 nodes | 5 | `?onChange`, `@degraded:contextMenu`, `@degraded:sheet`, `@ignored:help` |

---

## Detailed Application Manifests

### 1. Food Truck (Apple)
- **Author:** Apple Inc.
- **Repository:** `https://github.com/apple/sample-food-truck`
- **Pinned Commit:** `3954a769e99f3cc53297d94f2b960ceb2665b3d6`
- **License:** Apple Sample Code License (Permissive MIT-style)
- **Mirrored License File:** `tests/corpus2/01_food_truck/LICENSE.txt`
- **Scope Fed:** UI excerpt (2 files: `ContentView.swift`, `Sidebar.swift`).
- **Selection Rationale:** The full project is an enterprise multi-target app with 40+ files, StoreKit, SwiftData schemas, and custom Swift Packages. We selected the primary entry navigation view and sidebar hierarchy.
- **Diagnostics Encountered:** Missing external Swift package imports (`FoodTruckModel`, `AccountStore`, `FoodTruckKit`) and missing custom enum view `DetailColumn`. Skips `@ignored:onChange`, `@ignored:environmentObject`.
- **Classification:** **DEGRADED** (21 nodes rendered, 2 diagnostics).

---

### 2. SimpleNews
- **Author:** Paul Hudson (Hacking with Swift)
- **Repository:** `https://github.com/twostraws/simple-swiftui` (Subdirectory: `SimpleNews`)
- **Pinned Commit:** `e24d0442acf4a1ad7d624e4653bca75485296a10`
- **License:** MIT License
- **Mirrored License File:** `tests/corpus2/02_simple_news/LICENSE.md`
- **Scope Fed:** Whole project (all 6 Swift files).
- **Selection Rationale:** Complete standalone news reader app with models, enum state machine, and views.
- **Diagnostics Encountered:** 0 parse errors. Skips `.task { await downloadArticles() }` via `@ignored:task`.
- **Render Output:** Renders the initial loading state: `NavigationStack` -> `VStack` -> `Text("Downloading…")` + `ProgressView()`.
- **Classification:** **DEGRADED** (5 nodes rendered, 1 diagnostic).

---

### 3. SimpleNotes
- **Author:** Paul Hudson (Hacking with Swift)
- **Repository:** `https://github.com/twostraws/simple-swiftui` (Subdirectory: `SimpleNotes`)
- **Pinned Commit:** `e24d0442acf4a1ad7d624e4653bca75485296a10`
- **License:** MIT License
- **Mirrored License File:** `tests/corpus2/03_simple_notes/LICENSE.md`
- **Scope Fed:** Whole project (all 3 Swift files).
- **Selection Rationale:** Complete standalone note-taking app using `TextEditor`, `ControlGroup`, and `@AppStorage`.
- **Diagnostics Encountered:** 0 parse errors. Skips `@ignored:onAppear`, `@ignored:onChange`.
- **Render Output:** Clean render of full note-taking UI: `VStack` with `TextEditor`, formatting `ControlGroup`, and word/character count status bar.
- **Classification:** **DEGRADED** (16 nodes rendered, 2 diagnostics).

---

### 4. SimpleScores
- **Author:** Paul Hudson (Hacking with Swift)
- **Repository:** `https://github.com/twostraws/simple-swiftui` (Subdirectory: `SimpleScores`)
- **Pinned Commit:** `e24d0442acf4a1ad7d624e4653bca75485296a10`
- **License:** MIT License
- **Mirrored License File:** `tests/corpus2/04_simple_scores/LICENSE.md`
- **Scope Fed:** Whole project (all 7 Swift files).
- **Selection Rationale:** Complete player score tracker with `List`, `ForEach`, dialogs, and models.
- **Diagnostics Encountered:** 0 parse errors. Emits `~FileManager` (simulated disk load), `.onDelete()` (unhandled list modifier), `@degraded:toolbar`, `@degraded:alert`, `@ignored:contentShape`, `@degraded:listRowSeparator`, `@ignored:environment`.
- **Render Output:** Renders player list group with empty state text and action controls.
- **Classification:** **DEGRADED** (9 nodes rendered, 7 diagnostics).

---

### 5. SimpleToDo
- **Author:** Paul Hudson (Hacking with Swift)
- **Repository:** `https://github.com/twostraws/simple-swiftui` (Subdirectory: `SimpleToDo`)
- **Pinned Commit:** `e24d0442acf4a1ad7d624e4653bca75485296a10`
- **License:** MIT License
- **Mirrored License File:** `tests/corpus2/05_simple_todo/LICENSE.md`
- **Scope Fed:** Whole project (all 8 Swift files).
- **Selection Rationale:** Complete multi-screen ToDo app with `List(selection:)`, `EditButton`, and view model.
- **Diagnostics Encountered:** 0 parse errors. Emits `~FileManager`, `.onDelete()`, `@degraded:toolbar`, `@ignored:environment`.
- **Render Output:** Empty list (`children: []`) rendered because initial disk read returns null.
- **Classification:** **DEGRADED** (1 node rendered, 4 diagnostics).

---

### 6. Calculator-SwiftUI
- **Author:** Swiftify Corp
- **Repository:** `https://github.com/Swiftify-Corp/Calculator-SwiftUI`
- **Pinned Commit:** `a17cb4d23955398cccf38b73403548a48722f608`
- **License:** MIT License
- **Mirrored License File:** `tests/corpus2/06_calculator/LICENSE`
- **Scope Fed:** Whole project (all 7 Swift files).
- **Selection Rationale:** Full iOS calculator clone with expression brain, buttons, and display.
- **Diagnostics Encountered:** 3 parse errors in `CalculatorBrain.swift:179, 181, 207` (`Expected a name` when parsing local variable declarations inside `evaluate()`). View evaluation falls back to `Unsupported: ContentView: Unknown name '*'`.
- **Classification:** **FAILED** (3 parse errors, runtime fallback).

---

### 7. CapyTimer
- **Author:** Andeph Nguyen (andev0x)
- **Repository:** `https://github.com/andev0x/CapyTimer`
- **Pinned Commit:** `96078520a9c80e8114f30fec127068437bd56eac`
- **License:** MIT License
- **Mirrored License File:** `tests/corpus2/07_capy_timer/LICENSE`
- **Scope Fed:** UI excerpt + Theme (6 files: `ContentView.swift`, `CapyTimerApp.swift`, `TimerView.swift`, `TimerViewModel.swift`, `SettingsView.swift`, `CapyTheme.swift`).
- **Selection Rationale:** Pomodoro timer application. The full repository includes audio sound effects, notification managers, and widget extensions. We extracted the core UI views and its lightweight design system (`CapyTheme.swift`).
- **Diagnostics Encountered:** 0 parse errors. Skips `@ignored:onAppear`, `@degraded:sheet`.
- **Render Output:** Renders 56 view nodes across `ScrollView`, `Card`, `SectionHeader`, `ProgressRing`, and buttons (`.borderedProminent`, `.bordered`).
- **Classification:** **DEGRADED** (56 nodes rendered, 2 diagnostics).

---

### 8. MakeItSo
- **Author:** Peter Friese (Google LLC)
- **Repository:** `https://github.com/peterfriese/MakeItSo`
- **Pinned Commit:** `1e089b47b52adc33551eac948bd8c4ff55298632`
- **License:** Apache License 2.0
- **Mirrored License File:** `tests/corpus2/08_make_it_so/LICENSE`
- **Scope Fed:** UI excerpt (3 files: `ReminderDetailsView.swift`, `ReminderRowView.swift`, `RemindersListViewModel.swift`).
- **Selection Rationale:** Reminders clone demonstrating clean architecture. The full project depends on Firebase/Firestore SDK and Google Sign-In; we isolated the standalone SwiftUI reminder editing views and view models.
- **Diagnostics Encountered:** 0 parse errors. Skips `@degraded:sheet`.
- **Render Output:** Renders reminder details form.
- **Classification:** **DEGRADED** (2 nodes rendered, 1 diagnostic).

---

### 9. CountriesSwiftUI
- **Author:** Alexey Naumov (nalexn)
- **Repository:** `https://github.com/nalexn/clean-architecture-swiftui`
- **Pinned Commit:** `9eca97b8cfff96a14084b564b1fefd949c93d232`
- **License:** MIT License
- **Mirrored License File:** `tests/corpus2/09_countries/LICENSE`
- **Scope Fed:** UI excerpt (3 files: `CountriesListView.swift`, `CountryDetailsView.swift`, `CountriesViewModel.swift`).
- **Selection Rationale:** Clean architecture showcase. The full project depends on CoreData persistent stores and URLSession HTTP pipelines; we extracted the SwiftUI list and details views.
- **Diagnostics Encountered:** 0 parse errors. Skips `@ignored:onReceive`, `@ignored:flipsForRightToLeftLayoutDirection`.
- **Classification:** **DEGRADED** (1 node rendered, 2 diagnostics).

---

### 10. ControlRoom
- **Author:** Paul Hudson / Dave DeLong
- **Repository:** `https://github.com/twostraws/ControlRoom`
- **Pinned Commit:** `1764564f7923f0afc0d216ede573e20bd3c19f6e`
- **License:** MIT License
- **Mirrored License File:** `tests/corpus2/10_control_room/LICENSE`
- **Scope Fed:** UI excerpt (1 file: `ContentView.swift`).
- **Selection Rationale:** macOS utility for controlling Xcode simulators via `simctl` CLI. We extracted the primary split sidebar and detail control view.
- **Diagnostics Encountered:** 0 parse errors. Skips `?onChange`, `@degraded:contextMenu`, `@degraded:sheet`, `@ignored:help`, `@ignored:environmentObject`.
- **Render Output:** Renders macOS simulator sidebar control list.
- **Classification:** **DEGRADED** (6 nodes rendered, 5 diagnostics).
