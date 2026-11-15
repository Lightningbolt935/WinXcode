# Mac Verification Checklist for WinXcode Template

Follow these 10 steps on a Mac running macOS 14+ (Sonoma/Sequoia) with Xcode 15+ or Swift Playgrounds 4.4+:

1. Copy `templates/app-playground.swiftpm` to your Mac desktop.
2. Double-click `app-playground.swiftpm` to open it in **Swift Playgrounds**. Confirm it opens without manifest syntax errors.
3. Tap **Play** / **Run** in Swift Playgrounds. Confirm the preview and interactive counter run cleanly in the live container.
4. Right-click `app-playground.swiftpm` and select **Open With -> Xcode**. Confirm Xcode loads the project as an App Playground.
5. In Xcode, select an iOS Simulator (e.g. iPhone 15 or iPad Air) and press **Cmd + R** to build and run.
6. Verify that `Assets.xcassets` loads the app icon and accent color without warnings.
7. Open Terminal and run: `du -sh app-playground.swiftpm` to confirm the uncompressed size is under 50 MB.
8. In Finder, right-click `app-playground.swiftpm` and choose **Compress "app-playground.swiftpm"** to produce a `.zip`.
9. Delete the original folder, double-click the `.zip` to extract, and verify the extracted package still opens in Swift Playgrounds.
10. **Record the result:** Open `docs/NOTES.md` in WinXcode, replace `UNVERIFIED` with `VERIFIED on macOS <version> / Xcode <version>`, and commit.

---

## NOTE: Verifying Exported Submission ZIPs

When WinXcode exports a submission zip (via **Submission Check -> Export Submission ZIP**):
1. **Transfer to Mac / iPad:** AirDrop, email, or copy the generated `.zip` archive (e.g. `MyApp-Submission.zip`) to a physical Mac or iPad.
2. **On iPad (Swift Playgrounds):**
   - Tap the `.zip` file in the **Files** app. iPadOS decompresses it into `MyApp.swiftpm`.
   - Tap `MyApp.swiftpm`. iPadOS opens it directly in **Swift Playgrounds**.
   - Tap the **Play** button. Confirm the app runs smoothly with touch interactions and without missing resource errors.
3. **On Mac (Xcode & Swift Playgrounds):**
   - Double-click the `.zip` in Finder to extract `MyApp.swiftpm`.
   - Double-click `MyApp.swiftpm` to verify it opens in **Swift Playgrounds for Mac**.
   - Right-click `MyApp.swiftpm` and select **Open With -> Xcode**. Confirm Xcode loads the project without complaining about manifest structure or unsupported product types.
   - Run in the iOS Simulator (`Cmd+R`).
4. **Archive Structure Verification in Terminal:**
   - Open Terminal on Mac and inspect the zip table of contents:
     ```bash
     zipinfo MyApp-Submission.zip
     ```
   - Confirm the top-level directory in the archive is `MyApp.swiftpm/` (containing `Package.swift`, `App.swift`, `ContentView.swift`, `Assets.xcassets/`, `ATTRIBUTIONS.md`).
   - Confirm that `.git/`, `.build/`, `.DS_Store`, `*.xcuserdata`, and hidden dotfiles were completely excluded.
