import SwiftUI

// Corpus App 10: Accessibility-focused app
// Tests: .accessibilityLabel, .accessibilityHint, .accessibilityValue,
//        .accessibilityAddTraits, .accessibilityElement(children:),
//        DynamicType, @ScaledMetric, .minimumScaleFactor,
//        .accessibilityAdjustableAction, VoiceOver-friendly custom controls

struct ContentView: View {
    var body: some View {
        NavigationStack {
            List {
                Section("Demos") {
                    NavigationLink("Dynamic Type") { DynamicTypeDemo() }
                    NavigationLink("Custom Accessible Control") { AccessibleSliderDemo() }
                    NavigationLink("Image Descriptions") { ImageDescriptionDemo() }
                    NavigationLink("Grouped Elements") { GroupedElementsDemo() }
                }
            }
            .navigationTitle("Accessibility")
        }
    }
}

// MARK: - Dynamic Type Demo
struct DynamicTypeDemo: View {
    @ScaledMetric(relativeTo: .body) private var iconSize: CGFloat = 32
    @ScaledMetric(relativeTo: .body) private var padding: CGFloat = 16
    @Environment(\.dynamicTypeSize) private var typeSize

    let items = ["Read a book 📖", "Call a friend 📞", "Go for a walk 🚶", "Drink water 💧"]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: padding) {
                Text("Dynamic Type: \(typeSize.description)")
                    .font(.caption).foregroundStyle(.secondary)
                    .accessibilityLabel("Current text size: \(typeSize.description)")

                ForEach(items, id: \.self) { item in
                    HStack(spacing: padding) {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(.blue.opacity(0.15))
                            .frame(width: iconSize, height: iconSize)
                        Text(item)
                            .font(.body)
                            .minimumScaleFactor(0.8)
                    }
                    .padding(padding)
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
                }
            }
            .padding()
        }
        .navigationTitle("Dynamic Type")
    }
}

// MARK: - Accessible Custom Slider
struct AccessibleSliderDemo: View {
    @State private var volume: Int = 50

    var body: some View {
        VStack(spacing: 32) {
            Image(systemName: volumeIcon)
                .font(.system(size: 64))
                .foregroundStyle(.blue)
                .accessibilityHidden(true)

            Text("Volume: \(volume)%")
                .font(.title2)

            // Custom visual slider
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color(.systemGray5)).frame(height: 12)
                    Capsule().fill(.blue).frame(width: geo.size.width * CGFloat(volume) / 100, height: 12)
                    Circle()
                        .fill(.white)
                        .shadow(radius: 4)
                        .frame(width: 28, height: 28)
                        .offset(x: geo.size.width * CGFloat(volume) / 100 - 14)
                }
                .gesture(DragGesture(minimumDistance: 0).onChanged { value in
                    volume = max(0, min(100, Int(value.location.x / geo.size.width * 100)))
                })
            }
            .frame(height: 32)
            .accessibilityLabel("Volume")
            .accessibilityValue("\(volume) percent")
            .accessibilityHint("Swipe up or down to adjust")
            .accessibilityAdjustableAction { direction in
                switch direction {
                case .increment: volume = min(100, volume + 5)
                case .decrement: volume = max(0, volume - 5)
                @unknown default: break
                }
            }

            HStack {
                Button { volume = max(0, volume - 10) } label: {
                    Image(systemName: "speaker.minus.fill").font(.title2)
                }
                .accessibilityLabel("Decrease volume by 10")
                Spacer()
                Button { volume = max(0, min(100, volume == 0 ? 50 : 0)) } label: {
                    Image(systemName: volume == 0 ? "speaker.slash.fill" : "speaker.fill")
                        .font(.title2)
                }
                .accessibilityLabel(volume == 0 ? "Unmute" : "Mute")
                Spacer()
                Button { volume = min(100, volume + 10) } label: {
                    Image(systemName: "speaker.plus.fill").font(.title2)
                }
                .accessibilityLabel("Increase volume by 10")
            }
            .padding(.horizontal, 32)
        }
        .padding()
        .navigationTitle("Accessible Control")
    }

    var volumeIcon: String {
        switch volume {
        case 0: return "speaker.slash.fill"
        case 1...33: return "speaker.wave.1.fill"
        case 34...66: return "speaker.wave.2.fill"
        default: return "speaker.wave.3.fill"
        }
    }
}

// MARK: - Image Descriptions
struct ImageDescriptionDemo: View {
    struct Item: Identifiable {
        let id = UUID()
        let icon: String
        let description: String
        let isDecorative: Bool
    }

    let items: [Item] = [
        Item(icon: "sun.max.fill", description: "Bright sunny day with clear sky", isDecorative: false),
        Item(icon: "cloud.rain.fill", description: "Rainy weather", isDecorative: false),
        Item(icon: "checkmark.seal.fill", description: "", isDecorative: true),
        Item(icon: "star.fill", description: "5-star rating", isDecorative: false),
    ]

    var body: some View {
        List(items) { item in
            HStack {
                if item.isDecorative {
                    Image(systemName: item.icon)
                        .foregroundStyle(.green)
                        .accessibilityHidden(true)
                    Text("Decorative icon (hidden from VoiceOver)")
                        .font(.caption).foregroundStyle(.secondary)
                } else {
                    Image(systemName: item.icon)
                        .foregroundStyle(.orange)
                        .accessibilityLabel(item.description)
                    Text(item.description)
                }
            }
        }
        .navigationTitle("Image Labels")
    }
}

// MARK: - Grouped Elements
struct GroupedElementsDemo: View {
    struct CardData: Identifiable {
        let id = UUID(); let title: String; let subtitle: String; let stat: String
    }
    let cards = [
        CardData(title: "Steps Today", subtitle: "Goal: 10,000 steps", stat: "7,432"),
        CardData(title: "Active Minutes", subtitle: "Goal: 30 min", stat: "22 min"),
        CardData(title: "Calories", subtitle: "Goal: 500 kcal", stat: "318 kcal"),
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                ForEach(cards) { card in
                    HStack {
                        VStack(alignment: .leading) {
                            Text(card.title).font(.headline)
                            Text(card.subtitle).font(.caption).foregroundStyle(.secondary)
                        }
                        Spacer()
                        Text(card.stat).font(.title2).fontWeight(.bold)
                    }
                    .padding()
                    .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
                    // Group the whole card into one VoiceOver element
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel("\(card.title): \(card.stat). \(card.subtitle)")
                }
            }
            .padding()
        }
        .navigationTitle("Grouped Elements")
    }
}

extension DynamicTypeSize: @retroactive CustomStringConvertible {
    public var description: String {
        switch self {
        case .xSmall: return "xSmall"
        case .small: return "Small"
        case .medium: return "Medium"
        case .large: return "Large (default)"
        case .xLarge: return "xLarge"
        case .xxLarge: return "xxLarge"
        case .xxxLarge: return "xxxLarge"
        case .accessibility1: return "Accessibility 1"
        case .accessibility2: return "Accessibility 2"
        case .accessibility3: return "Accessibility 3"
        case .accessibility4: return "Accessibility 4"
        case .accessibility5: return "Accessibility 5"
        @unknown default: return "Unknown"
        }
    }
}

#Preview {
    ContentView()
}
