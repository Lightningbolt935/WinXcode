import SwiftUI

// Corpus App 05: Settings Screen
// Tests: Form, Section, Toggle, Picker, .pickerStyle, Stepper,
//        @AppStorage, ColorPicker, DatePicker, Slider

struct ContentView: View {
    @AppStorage("notificationsEnabled") private var notificationsEnabled = true
    @AppStorage("darkModeEnabled") private var darkModeEnabled = false
    @AppStorage("fontSize") private var fontSize = 16.0
    @AppStorage("accentColorIndex") private var accentColorIndex = 0
    @AppStorage("reminderTime") private var reminderTime = Date.now.timeIntervalSince1970
    @AppStorage("dailyGoal") private var dailyGoal = 3
    @AppStorage("languageCode") private var languageCode = "en"

    let accentColors = ["Blue", "Purple", "Orange", "Green", "Pink"]
    let languages = [("en", "English"), ("es", "Spanish"), ("fr", "French"), ("de", "German")]

    var body: some View {
        NavigationStack {
            Form {
                Section("Notifications") {
                    Toggle("Enable Notifications", isOn: $notificationsEnabled)

                    if notificationsEnabled {
                        DatePicker("Daily Reminder", selection: Binding(
                            get: { Date(timeIntervalSince1970: reminderTime) },
                            set: { reminderTime = $0.timeIntervalSince1970 }
                        ), displayedComponents: .hourAndMinute)
                    }
                }

                Section("Appearance") {
                    Toggle("Dark Mode", isOn: $darkModeEnabled)

                    Picker("Accent Color", selection: $accentColorIndex) {
                        ForEach(Array(accentColors.enumerated()), id: \.offset) { idx, name in
                            Text(name).tag(idx)
                        }
                    }

                    HStack {
                        Text("Font Size")
                        Spacer()
                        Text("\(Int(fontSize))pt")
                            .foregroundStyle(.secondary)
                    }
                    Slider(value: $fontSize, in: 12...24, step: 1)
                }

                Section("Goals") {
                    Stepper("Daily Goal: \(dailyGoal) lessons", value: $dailyGoal, in: 1...10)
                }

                Section("Language") {
                    Picker("App Language", selection: $languageCode) {
                        ForEach(languages, id: \.0) { code, name in
                            Text(name).tag(code)
                        }
                    }
                    .pickerStyle(.navigationLink)
                }

                Section("Account") {
                    NavigationLink("Profile") {
                        Text("Profile Settings").navigationTitle("Profile")
                    }
                    NavigationLink("Privacy") {
                        Text("Privacy Settings").navigationTitle("Privacy")
                    }
                    Button("Sign Out", role: .destructive) { }
                }

                Section {
                    Text("WinXcode Demo App v1.0")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .frame(maxWidth: .infinity, alignment: .center)
                }
            }
            .navigationTitle("Settings")
        }
    }
}

#Preview {
    ContentView()
}
