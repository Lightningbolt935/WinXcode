import SwiftUI
import AuthenticationServices
import FirebaseAnalytics

struct ContentView: View {
    var body: some View {
        VStack {
            SignInWithAppleButton(.signIn, onRequest: { _ in }, onCompletion: { _ in })
        }
        .onAppear {
            Analytics.logEvent("judge_opened_app", parameters: [:])
        }
    }
}
