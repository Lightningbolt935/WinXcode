import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View {
        VStack {
            Text("Network Test")
            AsyncImage(url: URL(string: "https://example.com/banner.png"))
        }
        .onAppear {
            let task = URLSession.shared.dataTask(with: URL(string: "https://api.example.com/scores")!) { data, _, _ in
                print("data fetched")
            }
            task.resume()
        }
    }
}
