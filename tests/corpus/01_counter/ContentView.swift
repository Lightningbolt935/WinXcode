import SwiftUI

// Corpus App 01: Counter with @State
// Tests: @State, Button, Text, VStack, padding, font modifiers

struct ContentView: View {
    @State private var count: Int = 0

    var body: some View {
        VStack(spacing: 24) {
            Text("Counter")
                .font(.largeTitle)
                .fontWeight(.bold)

            Text("\(count)")
                .font(.system(size: 72, weight: .thin, design: .rounded))
                .foregroundStyle(count >= 0 ? .primary : .red)

            HStack(spacing: 32) {
                Button {
                    count -= 1
                } label: {
                    Image(systemName: "minus.circle.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(.red)
                }

                Button {
                    count = 0
                } label: {
                    Image(systemName: "arrow.counterclockwise.circle.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(.gray)
                }

                Button {
                    count += 1
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(.green)
                }
            }

            Text(count == 0 ? "Start counting!" : count > 0 ? "Going up 🚀" : "Going down 📉")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
