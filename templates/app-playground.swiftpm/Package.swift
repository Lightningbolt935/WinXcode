// swift-tools-version: 5.9

// UNVERIFIED: Exact minimum toolchain version and deployment target for the 2027 challenge are not published by Apple.
// Official requirement: "Your submission must be an Xcode app or an app playground built with Swift Playgrounds packaged in a ZIP file."
// Verify on a physical Mac or iPad before submitting.

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
