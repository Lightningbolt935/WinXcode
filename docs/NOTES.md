# Swift Student Challenge Template & Format Research Notes

> **Status Notice (UNVERIFIED):**
> Every field of the `.swiftpm` template and the validator's package structure check is marked **UNVERIFIED**. The structure is synthesized from Apple Developer documentation and public open-source Swift Student Challenge winning repositories. It must be verified on a physical Mac running Xcode or Swift Playgrounds before official challenge submission.

---

## 1. Public Swift Student Challenge Repositories Surveyed

We surveyed public Swift Student Challenge submissions across GitHub that use the `.swiftpm` App Playground package format:

### Repository 1: `Ronuhz/Swift-Student-Challenge-2025`
- **URL:** https://github.com/Ronuhz/Swift-Student-Challenge-2025
- **Commit Reference:** `main` (Latest WWDC25 submission)
- **App Name:** *(Not) Lost*
- **Manifest:**
  - `// swift-tools-version: 6.0` (or 5.9)
  - `import AppleProductTypes`
  - `.iOSApplication(name: "(Not) Lost", targets: ["AppModule"], appIcon: .asset("AppIcon"), accentColor: .asset("AccentColor"), supportedDeviceFamilies: [.pad, .phone])`
  - `.executableTarget(name: "AppModule", path: ".")`
- **Layout:** Root directory contains `Package.swift`, `Assets.xcassets/`, `.swiftpm/`, and Swift source files directly at root.

### Repository 2: `dongdong867/SimPOS`
- **URL:** https://github.com/dongdong867/SimPOS
- **Commit Reference:** `main` (WWDC24 Winner)
- **App Name:** *SimPOS*
- **Manifest:**
  - `// swift-tools-version: 5.9`
  - `platforms: [.iOS("17.0")]`
  - `.iOSApplication(name: "SimPOS", targets: ["AppModule"], ...)`
  - `.executableTarget(name: "AppModule", path: ".")`
- **Layout:** Source files directly at package root, `Assets.xcassets` with AppIcon and color sets.

### Repository 3: `LayzaCarneiro/SeAjeite`
- **URL:** https://github.com/LayzaCarneiro/SeAjeite
- **Commit Reference:** `main` (WWDC Winner)
- **App Name:** *SeAjeite*
- **Manifest:**
  - `// swift-tools-version: 5.9`
  - `.iOSApplication(name: "SeAjeite", targets: ["AppModule"], ...)`
  - `.executableTarget(name: "AppModule", path: ".")`
- **Layout:** Includes `Package.swift`, `MyApp.swift` (`@main`), `ContentView.swift`, `Assets.xcassets/`, `ATTRIBUTIONS.md`.

### Repository 4: `hhajime/Sensit-WWDC-2023-Swift-Student-Challenge`
- **URL:** https://github.com/hhajime/Sensit-WWDC-2023-Swift-Student-Challenge
- **Commit Reference:** `main` (WWDC23 Winner)
- **App Name:** *Sensit*
- **Manifest:**
  - `// swift-tools-version: 5.6`
  - Uses earlier parameter names `iconAssetName: "AppIcon"` and `accentColorAssetName: "AccentColor"`.
- **Note:** In SwiftPM tools-version 5.8+, Apple unified these into `.asset("AppIcon")` and `.asset("AccentColor")`.

---

## 2. Comparison: WinXcode Template vs Real SSC Repositories

| Manifest / Layout Property | WinXcode Template (`templates/app-playground.swiftpm`) | Real Repositories | Differences / Notes | Verification Status |
|---|---|---|---|---|
| **Tools Version** | `// swift-tools-version: 5.9` | `5.8`, `5.9`, `6.0` | 5.9 provides broad compatibility with Swift Playgrounds 4.4+ and Xcode 15+ | **UNVERIFIED** |
| **Frameworks** | `import PackageDescription`<br>`import AppleProductTypes` | Identical across all repos | Mandatory for `.iOSApplication` | **UNVERIFIED** |
| **Product Type** | `.iOSApplication(...)` | `.iOSApplication(...)` | Identical | **UNVERIFIED** |
| **Target Path** | `path: "."` | `path: "."` or `path: "Sources"` | Root `.` is standard for Swift Playgrounds | **UNVERIFIED** |
| **Executable Target** | `name: "AppModule"` | `name: "AppModule"` | Swift Playgrounds standard target name | **UNVERIFIED** |
| **App Icon** | `appIcon: .asset("AppIcon")` | `.asset("AppIcon")` (5.8+) or `iconAssetName` (5.6) | 5.9 standard is `.asset(...)` | **UNVERIFIED** |
| **Accent Color** | `accentColor: .asset("AccentColor")` | `.asset("AccentColor")` | Standard color set | **UNVERIFIED** |
| **Device Families** | `[.pad, .phone]` | `[.pad, .phone]` | iPad and iPhone supported | **UNVERIFIED** |
| **Assets Directory** | `Assets.xcassets/` | `Assets.xcassets/` | Contains AppIcon and AccentColor | **UNVERIFIED** |
| **Attributions** | `ATTRIBUTIONS.md` | Present in winner projects | Required by challenge rules when media/libraries used | **VERIFIED (Apple Policy)** |

---

## 3. Single Configuration File Location
All structural expectations are strictly centralized in:
- `XWinCode/src-tauri/src/validator/structure.json` (and mirrored in TS at `XWinCode/src/lib/validator/structure.json`)

Modifying `structure.json` immediately updates both the Rust submission validator and the TypeScript pre-flight panel without modifying code logic.
