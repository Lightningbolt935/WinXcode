# Corpus 2 Sources & Licenses

This corpus consists of 10 real-world, permissively licensed open-source SwiftUI applications NOT written by us. These serve as an honest, external benchmark for the WinXcode SwiftUI preview interpreter.

---

## 1. Food Truck (Apple)
- **Author:** Apple Inc.
- **Repository:** `https://github.com/apple/sample-food-truck`
- **License:** Apple Sample Code License (Permissive MIT-style)
- **Copyright:** Copyright © 2023 Apple Inc.
- **Key Constructs:** `NavigationSplitView`, `NavigationStack`, `NavigationPath`, `@ObservedObject`, `@EnvironmentObject`, `#if os(...)`, `.onChange`, `ToolbarItem`.

## 2. SimpleNews
- **Author:** Paul Hudson (Hacking with Swift)
- **Repository:** `https://github.com/twostraws/simple-swiftui` (Subdirectory: `SimpleNews`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2022 Paul Hudson
- **Key Constructs:** `List`, `Group`, `enum` state machine, `.searchable`, `.refreshable`, `@State`, `@Sendable async`, `Task.sleep`, `ProgressView`.

## 3. SimpleNotes
- **Author:** Paul Hudson (Hacking with Swift)
- **Repository:** `https://github.com/twostraws/simple-swiftui` (Subdirectory: `SimpleNotes`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2023 Paul Hudson
- **Key Constructs:** `TextEditor`, `ControlGroup`, `@AppStorage`, `Label`, `.foregroundStyle`, `.padding`, `.onAppear`, `.onChange`.

## 4. SimpleScores
- **Author:** Paul Hudson (Hacking with Swift)
- **Repository:** `https://github.com/twostraws/simple-swiftui` (Subdirectory: `SimpleScores`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2022 Paul Hudson
- **Key Constructs:** `List`, `ForEach`, `.onDelete`, `@ObservedObject`, `.toolbar`, `ToolbarItem`, `.alert`, `.buttonStyle`, `.listStyle`.

## 5. SimpleToDo
- **Author:** Paul Hudson (Hacking with Swift)
- **Repository:** `https://github.com/twostraws/simple-swiftui` (Subdirectory: `SimpleToDo`)
- **License:** MIT License
- **Copyright:** Copyright (c) 2022 Paul Hudson
- **Key Constructs:** `List(selection:)`, `EditButton`, `Set<ToDoItem>`, `.toolbar`, `.bottomBar`, `@ObservedObject`, `@State`, `.environment(\.editMode)`.

## 6. Calculator-SwiftUI
- **Author:** Swiftify Corp
- **Repository:** `https://github.com/Swiftify-Corp/Calculator-SwiftUI`
- **License:** MIT License
- **Copyright:** Copyright (c) 2022 Swiftify
- **Key Constructs:** Nested `VStack`/`HStack` grid layout, `@State`, custom frame modifiers, `NumberFormatter`, `didSet` on state, `Color(red:green:blue:)`.

## 7. CapyTimer
- **Author:** Andeph Nguyen (andev0x)
- **Repository:** `https://github.com/andev0x/CapyTimer`
- **License:** MIT License
- **Copyright:** Copyright (c) 2025 Andeph Nguyen
- **Key Constructs:** `ScrollView`, `VStack(alignment:spacing:)`, `@EnvironmentObject`, `Button` styles (`.borderedProminent`, `.bordered`), `#Preview`.

## 8. MakeItSo
- **Author:** Peter Friese (Google LLC)
- **Repository:** `https://github.com/peterfriese/MakeItSo`
- **License:** Apache License 2.0
- **Copyright:** Copyright © 2021 Google LLC
- **Key Constructs:** `List`, `ForEach($reminders)`, `@FocusState`, `.swipeActions`, `.sheet`, `.toolbar`, `ToolbarItemGroup`, `.tint`.

## 9. CountriesSwiftUI
- **Author:** Alexey Naumov (nalexn)
- **Repository:** `https://github.com/nalexn/clean-architecture-swiftui`
- **License:** MIT License
- **Copyright:** Copyright © 2024 Alexey Naumov
- **Key Constructs:** `NavigationStack(path:)`, `@ViewBuilder`, `@State private(set)`, `switch` view branching, `Loadable` enum state, `.navigationTitle`.

## 10. ControlRoom
- **Author:** Paul Hudson / Dave DeLong
- **Repository:** `https://github.com/twostraws/ControlRoom`
- **License:** MIT License
- **Copyright:** Copyright (c) 2021 Paul Hudson
- **Key Constructs:** `VStack`, `List(selection:)`, `.contextMenu`, `@AppStorage`, `@ObservedObject`, `@EnvironmentObject`, `.listStyle(.sidebar)`.
