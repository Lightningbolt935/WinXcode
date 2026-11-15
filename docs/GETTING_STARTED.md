# Getting Started with WinXcode

Welcome! If you are a student on Windows who wants to build a SwiftUI app and submit to the **Apple Swift Student Challenge**, you are in the right place.

WinXcode lets you write real SwiftUI code, see an interactive live preview on an iPhone screen, check your project against Apple's submission rules, and export a ready-to-submit `.zip` archive — **all directly on Windows, with no Mac and no WSL required**.

---

## 1. Quick Installation

1. Download `WinXcode_setup.exe` from the Releases page.
2. Run the installer. It installs for your user account without requiring administrator privileges.
3. Launch WinXcode.

> [!NOTE]
> You **do NOT need WSL (Windows Subsystem for Linux)**, you do **NOT need an iPhone**, and you do **NOT need a paid Apple Developer account** to design your app, preview your views, and export your challenge entry.

---

## 2. Create Your First Challenge Project

1. On the Welcome screen, click the primary button: **"Start a Swift Student Challenge project"**.
2. Give your project a name (e.g., `MyEcoGame`).
3. Choose a folder on your computer to save it.
4. Click **Create**.

WinXcode generates a standard App Playground package (`MyEcoGame.swiftpm`) containing:
- `Package.swift`: The official manifest configured for iOS.
- `App.swift`: Your application entry point (`@main`).
- `ContentView.swift`: Your initial SwiftUI screen.
- `Assets.xcassets`: Your app icon and accent color catalogs.

---

## 3. Writing SwiftUI with the Live Preview

Open `ContentView.swift` in the editor.
Press **Ctrl + Alt + Enter** (or click the Canvas preview icon in the top right) to open the live iPhone Canvas.

- **Instant updates**: As you type SwiftUI code, the phone preview automatically re-renders.
- **Interactive**: Buttons, toggles, sliders, text fields, and tap/drag gestures respond to your mouse clicks.
- **Dark Mode & Devices**: Switch between Light/Dark mode and choose from different iPhone screen sizes using the toolbar below the preview.

```swift
import SwiftUI

struct ContentView: View {
    @State private var score = 0

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "sparkles")
                .font(.system(size: 60))
                .foregroundStyle(.tint)
            
            Text("Score: \(score)")
                .font(.title.bold())
            
            Button("Tap to Play") {
                score += 1
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}
```

---

## 4. What the Preview CAN and CANNOT Do (Honest Guide)

WinXcode runs an independent, built-in Swift interpreter designed for rapid previewing. It supports the vast majority of SwiftUI used in student apps, but it is good to know its limits:

### What Works Great:
- **Core Views**: `VStack`, `HStack`, `ZStack`, `Grid`, `ScrollView`, `List`, `Form`, `Section`, `NavigationStack`.
- **Inputs & Controls**: `Button`, `Toggle`, `Slider`, `Stepper`, `TextField`, `Picker`, `ColorPicker`.
- **Shapes & Graphics**: `Circle`, `Rectangle`, `RoundedRectangle`, `Capsule`, `Canvas` (custom 2D drawing with `Path`, `move`, `addLine`).
- **Gestures**: `.onTapGesture` and `DragGesture(minimumDistance: 0)` with `.onChanged` and `.onEnded`.
- **State & Data**: `@State`, `@Binding`, `@Observable`, arrays, dictionaries, custom structs, enums with associated values, computed properties, and protocol extensions.

### What the Preview Cannot Render:
- **Hardware-locked APIs**: Camera (`AVCaptureSession`), Bluetooth, ARKit, and CoreMotion sensors.
- **Heavy Frameworks**: `MapKit` (Map views), `VideoPlayer`, `SpriteKit` / `SceneKit`, and Metal shaders.
- **Swift Charts**: `<Chart>` views are not yet supported in the Windows preview.
- **External Web Content**: `WKWebView` will not fetch live web pages in the preview.

If your code uses an unsupported modifier or view, WinXcode will display a clear diagnostic callout explaining what was skipped, rather than crashing.

---

## 5. Checking Your Project ("Submission Check")

Apple has strict rules for Swift Student Challenge entries. WinXcode includes an automated pre-flight tool to check your project before you submit.

1. Click the **Submission Check** icon (the checkmark circle) in the top toolbar.
2. WinXcode inspects your project directory and verifies:
   - **Offline Rule**: Verifies you are not calling `URLSession` or remote servers (judges evaluate apps offline).
   - **No Login Gates**: Verifies you have no sign-in or account creation screens.
   - **No Analytics / Tracking**: Confirms you are not tracking judges.
   - **500 MB Archive Limit**: Calculates your total package size.
   - **Asset References**: Ensures every image referenced in code exists in your asset catalog.
   - **Attributions**: Checks for an `ATTRIBUTIONS.md` if you use third-party icons, sounds, or open-source snippets.

When all checks pass, you will see **"NO OBVIOUS PROBLEMS FOUND"**.

---

## 6. Exporting Your Submission ZIP

1. In the **Submission Check** window, click **Export Submission ZIP**.
2. WinXcode creates a clean `.zip` archive (e.g. `MyEcoGame-Submission.zip`).
3. The archive is automatically formatted according to Apple's requirements:
   - Contains your `MyEcoGame.swiftpm` folder at the root.
   - Completely excludes hidden system files, `.git/`, `.DS_Store`, and temporary build junk.

---

## 7. Next Steps: Testing on Mac or iPad

While WinXcode gives you a high-fidelity preview on Windows, testing on Apple hardware before final submission is always recommended if you have access to a friend's or school's Mac or iPad:

1. Copy your exported `.zip` file to an iPad or Mac (via USB drive, cloud storage, or email).
2. **On iPad**: Tap the `.zip` file in the Files app. Tap the extracted `.swiftpm` folder to open and run it directly in **Swift Playgrounds**.
3. **On Mac**: Double-click `.swiftpm` to run it in **Swift Playgrounds for Mac** or right-click -> **Open With -> Xcode**.
4. Test that your interactive experience can be comfortably explored in **under 3 minutes** (Apple's judging expectation).

---

## 8. Optional: Setting Up Native Build Tools

You only need this section if you want to compile native Windows executable binaries or sideload your app directly onto a physical iPhone plugged into your PC via USB:

- Open **Settings (Ctrl+,) -> Tools & SDKs**.
- Setting up **WSL (Ubuntu)**, **xtool**, and an **iOS SDK** allows cross-compiling real arm64 binaries.
- If you are only creating a Swift Student Challenge entry, you can safely skip this entirely!

---

*Good luck with your Swift Student Challenge project!*
