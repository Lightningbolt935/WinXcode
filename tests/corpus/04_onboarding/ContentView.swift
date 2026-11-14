import SwiftUI

// Corpus App 04: Onboarding Flow
// Tests: TabView (.page style), PageTabViewStyle, .animation, .transition,
//        @State Bool, Button navigation between pages, @AppStorage

struct OnboardingPage: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let subtitle: String
    let color: Color
}

let pages: [OnboardingPage] = [
    OnboardingPage(icon: "swift", title: "Welcome to SwiftLearn",
                   subtitle: "Your personal Swift coding companion, right on your iPhone.",
                   color: .orange),
    OnboardingPage(icon: "lightbulb.fill", title: "Learn by Doing",
                   subtitle: "Interactive challenges keep you engaged and help concepts stick.",
                   color: .yellow),
    OnboardingPage(icon: "chart.line.uptrend.xyaxis", title: "Track Progress",
                   subtitle: "See your streaks, completed lessons, and skill growth over time.",
                   color: .green),
    OnboardingPage(icon: "person.2.fill", title: "Join the Community",
                   subtitle: "Share solutions, get hints, and cheer each other on.",
                   color: .blue),
]

struct ContentView: View {
    @State private var currentPage = 0
    @AppStorage("hasSeenOnboarding") private var hasSeenOnboarding = false

    var body: some View {
        if hasSeenOnboarding {
            HomeView(hasSeenOnboarding: $hasSeenOnboarding)
        } else {
            OnboardingView(currentPage: $currentPage, hasSeenOnboarding: $hasSeenOnboarding)
        }
    }
}

struct OnboardingView: View {
    @Binding var currentPage: Int
    @Binding var hasSeenOnboarding: Bool

    var body: some View {
        VStack {
            TabView(selection: $currentPage) {
                ForEach(Array(pages.enumerated()), id: \.offset) { idx, page in
                    OnboardingPageView(page: page)
                        .tag(idx)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .always))
            .animation(.easeInOut, value: currentPage)
            .indexViewStyle(.page(backgroundDisplayMode: .always))

            Button {
                withAnimation {
                    if currentPage < pages.count - 1 {
                        currentPage += 1
                    } else {
                        hasSeenOnboarding = true
                    }
                }
            } label: {
                Text(currentPage < pages.count - 1 ? "Next" : "Get Started")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .padding(.horizontal, 32)
            .padding(.bottom, 32)
            .tint(pages[currentPage].color)
            .animation(.easeInOut, value: currentPage)
        }
    }
}

struct OnboardingPageView: View {
    let page: OnboardingPage

    var body: some View {
        VStack(spacing: 32) {
            Spacer()
            Image(systemName: page.icon)
                .font(.system(size: 100))
                .foregroundStyle(page.color)
                .symbolEffect(.bounce, value: page.id)

            Text(page.title)
                .font(.largeTitle)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)

            Text(page.subtitle)
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            Spacer()
            Spacer()
        }
    }
}

struct HomeView: View {
    @Binding var hasSeenOnboarding: Bool
    var body: some View {
        NavigationStack {
            Text("Welcome back! 🎉")
                .font(.largeTitle)
                .navigationTitle("Home")
                .toolbar {
                    Button("Reset") { hasSeenOnboarding = false }
                }
        }
    }
}

#Preview {
    ContentView()
}
