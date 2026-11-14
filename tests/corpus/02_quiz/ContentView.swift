import SwiftUI

// Corpus App 02: Quiz App
// Tests: NavigationStack, NavigationLink, @State, .navigationTitle,
//        conditional views, List, computed properties

struct Question: Identifiable {
    let id = UUID()
    let text: String
    let choices: [String]
    let correctIndex: Int
}

let sampleQuestions: [Question] = [
    Question(text: "What is the capital of France?",
             choices: ["Berlin", "Madrid", "Paris", "Rome"],
             correctIndex: 2),
    Question(text: "Which planet is closest to the Sun?",
             choices: ["Venus", "Mercury", "Earth", "Mars"],
             correctIndex: 1),
    Question(text: "How many sides does a hexagon have?",
             choices: ["5", "6", "7", "8"],
             correctIndex: 1),
    Question(text: "Who painted the Mona Lisa?",
             choices: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"],
             correctIndex: 2),
]

struct ContentView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 32) {
                Image(systemName: "questionmark.circle.fill")
                    .font(.system(size: 80))
                    .foregroundStyle(.blue)

                Text("Quick Quiz")
                    .font(.largeTitle)
                    .fontWeight(.bold)

                Text("\(sampleQuestions.count) questions • Test your knowledge")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                NavigationLink("Start Quiz") {
                    QuizView()
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
            }
            .padding()
            .navigationTitle("Quiz App")
        }
    }
}

struct QuizView: View {
    @State private var currentIndex = 0
    @State private var score = 0
    @State private var selectedAnswer: Int? = nil
    @State private var showResult = false

    var current: Question { sampleQuestions[currentIndex] }

    var body: some View {
        if showResult {
            ResultView(score: score, total: sampleQuestions.count)
        } else {
            VStack(alignment: .leading, spacing: 20) {
                ProgressView(value: Double(currentIndex), total: Double(sampleQuestions.count))
                    .tint(.blue)

                Text("Question \(currentIndex + 1) of \(sampleQuestions.count)")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                Text(current.text)
                    .font(.title2)
                    .fontWeight(.semibold)
                    .padding(.vertical)

                ForEach(Array(current.choices.enumerated()), id: \.offset) { idx, choice in
                    Button {
                        guard selectedAnswer == nil else { return }
                        selectedAnswer = idx
                        if idx == current.correctIndex { score += 1 }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                            if currentIndex + 1 < sampleQuestions.count {
                                currentIndex += 1
                                selectedAnswer = nil
                            } else {
                                showResult = true
                            }
                        }
                    } label: {
                        HStack {
                            Text(choice)
                            Spacer()
                            if let sel = selectedAnswer {
                                if sel == idx {
                                    Image(systemName: idx == current.correctIndex ? "checkmark.circle.fill" : "xmark.circle.fill")
                                } else if idx == current.correctIndex {
                                    Image(systemName: "checkmark.circle.fill")
                                }
                            }
                        }
                        .padding()
                        .background(answerBackground(for: idx))
                        .foregroundStyle(selectedAnswer == nil ? .primary : answerForeground(for: idx))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
                Spacer()
            }
            .padding()
            .navigationTitle("Quiz")
        }
    }

    func answerBackground(for idx: Int) -> Color {
        guard let sel = selectedAnswer else { return Color(.systemGray6) }
        if idx == current.correctIndex { return .green.opacity(0.2) }
        if idx == sel { return .red.opacity(0.2) }
        return Color(.systemGray6)
    }

    func answerForeground(for idx: Int) -> Color {
        guard let sel = selectedAnswer else { return .primary }
        if idx == current.correctIndex { return .green }
        if idx == sel { return .red }
        return .secondary
    }
}

struct ResultView: View {
    let score: Int
    let total: Int

    var percentage: Double { Double(score) / Double(total) }

    var body: some View {
        VStack(spacing: 24) {
            Image(systemName: percentage >= 0.7 ? "star.fill" : "hand.thumbsup.fill")
                .font(.system(size: 80))
                .foregroundStyle(percentage >= 0.7 ? .yellow : .blue)

            Text("Quiz Complete!")
                .font(.largeTitle)
                .fontWeight(.bold)

            Text("\(score) / \(total)")
                .font(.system(size: 56, weight: .thin, design: .rounded))

            Text(percentage >= 0.7 ? "Great job! 🎉" : "Keep practicing!")
                .font(.title3)
                .foregroundStyle(.secondary)
        }
        .padding()
        .navigationTitle("Results")
    }
}

#Preview {
    ContentView()
}
