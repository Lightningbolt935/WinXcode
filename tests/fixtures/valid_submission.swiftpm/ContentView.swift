import SwiftUI

struct ContentView: View {
    @State private var counter = 0

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "sparkles")
                .font(.system(size: 60))
                .foregroundColor(.accentColor)
            Text("Welcome to Swift Student Challenge")
                .font(.title)
                .bold()
                .multilineTextAlignment(.center)
            Text("Counter: \(counter)")
                .font(.headline)
            Button("Tap Me") {
                counter += 1
            }
            .buttonStyle(.borderedProminent)
        }
        .padding()
    }
}
