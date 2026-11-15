// swift-tools-version: 5.9

// UNVERIFIED: App Playground manifest based on Apple developer documentation.
// Verify on a physical Mac running Xcode / Swift Playgrounds before submitting.

import PackageDescription
import AppleProductTypes

let package = Package(
    name: "MyPlaygroundApp",
    platforms: [
        .iOS("16.0")
    ],
    products: [
        .iOSApplication(
            name: "MyPlaygroundApp",
            targets: ["AppModule"],
            bundleIdentifier: "com.example.MyPlaygroundApp",
            teamIdentifier: "",
            displayVersion: "1.0",
            bundleVersion: "1",
            appIcon: .asset("AppIcon"),
            accentColor: .asset("AccentColor"),
            supportedDeviceFamilies: [
                .pad,
                .phone
            ],
            supportedInterfaceOrientations: [
                .portrait,
                .landscapeRight,
                .landscapeLeft
            ],
            capabilities: []
        )
    ],
    targets: [
        .executableTarget(
            name: "AppModule",
            path: "."
        )
    ]
)
