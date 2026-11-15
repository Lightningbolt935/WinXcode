# Apple Swift Student Challenge Rules & Validator Specifications

**Fetched From:**
- `https://developer.apple.com/swift-student-challenge/`
- `https://developer.apple.com/swift-student-challenge/eligibility/`
- `https://developer.apple.com/swift-student-challenge/terms-and-conditions/`

**Date Fetched:** November 15, 2026

---

## 1. Official Challenge Requirements

### Eligibility Criteria
- **Individual Work:** Must be created individually; team work is not permitted.
- **Student / Learner Status:** Must fulfill at least one:
  - Enrolled in an accredited academic institution or official homeschool equivalent (or graduated within the past 90 days).
  - Enrolled in an Apple Developer Academy (or graduated within past 90 days).
  - Enrolled in an eligible STEM organization educational curriculum.
  - Graduated high school within past 6 months awaiting or accepted into an accredited college/university.
- **Professional Employment:** Must not be employed full-time as a professional software developer.
- **Account:** Registered Apple Developer (free or paid Apple Developer Program).
- **Age:** 13+ (or 14+, 15+, 16+ depending on jurisdiction, e.g. Brazil, Germany, South Korea, China mainland).
- **Prior Wins:** Can win up to 3 times total; Distinguished Winner only once.

### Technical & Submission Constraints
1. **Archive Size:** ZIP archive must be **500 MB or smaller**.
2. **Project Format:** App Playground (`.swiftpm`) created with Swift Playgrounds or Xcode, or an Xcode project.
3. **Offline Operation:** Submissions are judged in an offline environment without Internet connectivity. The app must run standalone.
4. **All Assets Local:** All images, models, audio, datasets, or dependencies must be packaged locally in the project.
5. **No Sign-In / Authentication Gate:** Apps must not require sign-in, account creation, or login credentials.
6. **No Judge Tracking / Analytics:** Apps must not include analytics, telemetry, or tracking code designed to log or monitor judges' activity.
7. **3-Minute Interactive Experience:** Designed to be evaluated and experienced within roughly three minutes.
8. **Third-Party Code & Attributions (Official Apple Rule Text):**
   > *"You may include third-party open source code and public domain or Creative Commons-licensed images, sounds, or other media, provided you credit the source and explain why it was used."*
   > — Source: [Apple Swift Student Challenge Terms and Conditions](https://developer.apple.com/swift-student-challenge/terms-and-conditions/) & [Eligibility](https://developer.apple.com/swift-student-challenge/eligibility/)
   Credit is required for third-party code and media; the validator emits a `WARN` (not a hard `FAIL`) when non-code assets exist without an attribution document.

---

## 2. Comparison Against Assumptions

| Assumption | Official Apple Rule | Difference / Status |
|---|---|---|
| **500 MB zip limit** | Maximum 500 MB zip file | **Exact Match** |
| **App playground or Xcode project** | App playground (`.swiftpm`) or Xcode app project | **Exact Match** |
| **Offline** | Must run completely offline; no network dependencies | **Exact Match** |
| **No sign-in** | Disqualification if app requires sign-in/login | **Exact Match** |
| **3-minute experience** | Designed to be experienced within 3 minutes | **Exact Match** |
| **No tracking of judges** | Explicit prohibition against tracking or analytics targeting review | **Exact Match** |
| **Attribution required** | Third-party open source and assets require credit & explanation | **Confirmed Rule** (Validator checks for `ATTRIBUTIONS.md` or inline credits) |

---

## 3. Automated Validator Rules (WinXcode "Submission Check")

The WinXcode submission validator runs the following automated checks on the project directory prior to export:

### Rule 1: Project Structure (`PASS` / `FAIL`)
- Validates that the project contains a root `Package.swift` (for Swift Playgrounds App `.swiftpm`) or `.xcodeproj` bundle.
- Validates required SwiftPM manifest structure (`package.toolsVersion`, `platforms`, `executableTarget` or `appTarget`).

### Rule 2: Package Archive Size (`PASS` / `WARN` / `FAIL`)
- Calculates total uncompressed size and simulated zipped size:
  - `< 100 MB`: **PASS** (Optimal).
  - `100 MB - 450 MB`: **WARN** (Large asset warning).
  - `> 500 MB`: **FAIL** (Hard rejection; exceeds Apple submission limit).

### Rule 3: Network & Connectivity Prohibitions (`PASS` / `WARN` / `FAIL`)
- Scans source code for network APIs that require connectivity:
  - `URLSession.shared.data(...)`, `URLRequest`, `Network.NWPathMonitor`: **WARN / FAIL** with file:line.
  - `AsyncImage(url:)` without bundled fallback: **WARN** with file:line.
  - `WKWebView`: **WARN** with file:line (web view might attempt remote fetches).

### Rule 4: Sign-In & Authentication Prohibitions (`PASS` / `FAIL`)
- Scans source code and package dependencies for auth gates:
  - `AuthenticationServices`, `SignInWithAppleButton`: **FAIL** (sign-in prohibited by Apple judging rules).
  - Firebase Auth, AWS Amplify Auth, OAuth libraries: **FAIL**.

### Rule 5: Tracking & Telemetry Prohibitions (`PASS` / `FAIL`)
- Scans for analytics and tracking SDKs:
  - `FirebaseAnalytics`, `Mixpanel`, `Amplitude`, `AppCenter`, `FacebookCore`, `GoogleAnalytics`: **FAIL**.
  - `AppTrackingTransparency`, `ATTrackingManager`: **FAIL**.

### Rule 6: Asset Bundling & Missing Resources (`PASS` / `WARN`)
- Scans for referenced image and audio names in Swift code (e.g. `Image("...")`, `Bundle.main.url(forResource:...)`) and verifies existence in asset catalog or project resources.

### Rule 7: Attributions Document (`PASS` / `WARN`)
- Checks for `ATTRIBUTIONS.md` or `Credits.swift` if third-party packages or assets are detected.

---

## 4. UI Disclaimer

*WinXcode Submission Check is an independent pre-flight tool to assist students with format and policy compliance. It is not affiliated with, endorsed by, or sponsored by Apple Inc. Passing all checks does not guarantee acceptance, judging scores, or awards from Apple.*
