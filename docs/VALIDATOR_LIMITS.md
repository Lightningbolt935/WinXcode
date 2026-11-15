# Swift Student Challenge Validator Limitations & Scope

**WinXcode Pre-Flight Submission Check**

---

## 1. Purpose & Scope

The WinXcode Submission Check is a pre-flight verification tool designed to help students identify common technical errors and disqualification triggers before submitting their projects to the Apple Swift Student Challenge.

The validator runs static analysis against the project directory and checks against Apple's published challenge guidelines and terms.

---

## 2. What the Validator Checks

| Check Category | Implementation | Level |
|---|---|---|
| **Project Structure** | Verifies root `Package.swift`, tools version header (`// swift-tools-version: 5.9`), `PackageDescription` and `AppleProductTypes` imports, `.iOSApplication` target, and mandatory files (`App.swift`, `ContentView.swift`, `Assets.xcassets/Contents.json`). | `FAIL` if missing |
| **Archive Size Limit** | Estimates compressed archive size against Apple's strict 500 MB limit. Warns if size exceeds 100 MB. | `FAIL` if > 500 MB, `WARN` if > 100 MB |
| **Offline Operation** | Scans for network APIs (`URLSession`, `URLRequest`, `NWPathMonitor`, `NWConnection`, `WebSocketTask`), hardcoded remote HTTP/HTTPS URLs in `URL(string:)`, remote `AsyncImage`, and `WKWebView`. Submissions must run offline. | `FAIL` (or `WARN` for `WKWebView`) |
| **No Sign-In Gates** | Checks for `AuthenticationServices`, `SignInWithAppleButton`, `FirebaseAuth`, `Amplify.Auth`. Submissions requiring login are disqualified by Apple. | `FAIL` |
| **No Tracking / Telemetry** | Checks for analytics SDKs (`FirebaseAnalytics`, `Mixpanel`, `Amplitude`, `AppTrackingTransparency`, `ATTrackingManager`). Tracking judges is strictly prohibited. | `FAIL` |
| **Asset Catalog Validation** | Matches `Image("...")` references against assets in `Assets.xcassets`. | `FAIL` if referenced asset missing |
| **Attribution Policy** | Checks for `ATTRIBUTIONS.md`, `ATTRIBUTIONS.txt`, or `Credits.swift` when non-code media assets are detected. | `WARN` if missing (does not block export) |

---

## 3. What the Validator CANNOT Catch (Limits)

The validator relies on static analysis and pattern matching. It has several inherent limitations:

1. **No Swift Compiler (`swiftc`) on Windows:**
   WinXcode does not invoke Apple's official `swiftc` compiler or Xcode build system. Syntax errors, complex type-checker ambiguities, or Swift concurrency warnings that only the macOS compiler detects will not be caught here.

2. **Dynamic / Obfuscated Network Calls:**
   Constructing URLs via dynamic string manipulation or using lower-level POSIX socket APIs (e.g., in C/C++ libraries) will not be flagged by static pattern matching.

3. **Subjective Judging Criteria:**
   Apple's challenge criteria include:
   - Technical accomplishment
   - Creativity of the idea
   - Content and design
   - Feasibility of being experienced and evaluated within **3 minutes**
   No automated tool can verify these subjective factors.

4. **Completeness and Legality of Attributions:**
   The validator checks that an attributions file exists when assets are present, but it cannot verify whether your attributions fulfill the specific licenses (MIT, CC-BY, Apache 2.0, Public Domain) of the third-party assets used.

5. **Device & OS Specific Features:**
   Features relying on real iOS hardware (Camera, ARKit, CoreMotion, CoreML performance, Metal shaders) cannot be executed in the Windows preview and must be verified on a physical device.

---

## 4. Recommendations for Applicants

- **Test on a Mac if possible:** Before final submission, open your exported `.swiftpm` or `.zip` on a physical Mac or iPad running Swift Playgrounds or Xcode.
- **Run the 3-Minute Test:** Hand your app to a friend or mentor with a 3-minute timer. If they cannot understand or complete the core interactive experience within 3 minutes, simplify your flow.
- **Credit Everything:** When in doubt, list every open-source snippet, font, sound effect, and image in `ATTRIBUTIONS.md` along with a 1-2 sentence explanation of why you used it.
