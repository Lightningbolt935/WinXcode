import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image("NonExistentHeroImage")
                .resizable()
        }
    }
}
