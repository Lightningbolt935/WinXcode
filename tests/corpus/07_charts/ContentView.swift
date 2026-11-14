import SwiftUI
import Charts

// Corpus App 07: Chart App
// Tests: Charts framework, Chart, BarMark, LineMark, PointMark, AreaMark,
//        Picker for chart type switching, @State, ForEach with data

struct DataPoint: Identifiable {
    let id = UUID()
    let label: String
    let value: Double
    let category: String
}

let weeklySteps: [DataPoint] = [
    DataPoint(label: "Mon", value: 6200, category: "Steps"),
    DataPoint(label: "Tue", value: 8100, category: "Steps"),
    DataPoint(label: "Wed", value: 4300, category: "Steps"),
    DataPoint(label: "Thu", value: 9500, category: "Steps"),
    DataPoint(label: "Fri", value: 7800, category: "Steps"),
    DataPoint(label: "Sat", value: 11200, category: "Steps"),
    DataPoint(label: "Sun", value: 5900, category: "Steps"),
]

let monthlyCalories: [DataPoint] = [
    DataPoint(label: "Week 1", value: 14200, category: "Calories"),
    DataPoint(label: "Week 2", value: 16800, category: "Calories"),
    DataPoint(label: "Week 3", value: 13100, category: "Calories"),
    DataPoint(label: "Week 4", value: 17400, category: "Calories"),
]

enum ChartType: String, CaseIterable {
    case bar = "Bar"
    case line = "Line"
    case area = "Area"
}

struct ContentView: View {
    @State private var chartType: ChartType = .bar
    @State private var selectedDataset = 0

    var dataset: [DataPoint] { selectedDataset == 0 ? weeklySteps : monthlyCalories }
    var dataLabel: String { selectedDataset == 0 ? "Daily Steps" : "Weekly Calories" }

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                Picker("Dataset", selection: $selectedDataset) {
                    Text("Steps").tag(0)
                    Text("Calories").tag(1)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)

                VStack(alignment: .leading) {
                    Text(dataLabel)
                        .font(.headline)
                    Text("Total: \(Int(dataset.reduce(0) { $0 + $1.value }), format: .number)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.horizontal)

                Chart(dataset) { point in
                    switch chartType {
                    case .bar:
                        BarMark(
                            x: .value("Day", point.label),
                            y: .value("Value", point.value)
                        )
                        .foregroundStyle(.blue.gradient)
                        .cornerRadius(6)
                    case .line:
                        LineMark(
                            x: .value("Day", point.label),
                            y: .value("Value", point.value)
                        )
                        .foregroundStyle(.blue)
                        .symbol(Circle().strokeBorder(lineWidth: 2))
                        .interpolationMethod(.catmullRom)
                    case .area:
                        AreaMark(
                            x: .value("Day", point.label),
                            y: .value("Value", point.value)
                        )
                        .foregroundStyle(.blue.opacity(0.3).gradient)
                        LineMark(
                            x: .value("Day", point.label),
                            y: .value("Value", point.value)
                        )
                        .foregroundStyle(.blue)
                    }
                }
                .frame(height: 240)
                .padding()
                .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
                .padding(.horizontal)

                Picker("Chart Type", selection: $chartType) {
                    ForEach(ChartType.allCases, id: \.self) { type in
                        Text(type.rawValue).tag(type)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)

                List(dataset) { point in
                    HStack {
                        Text(point.label).fontWeight(.medium)
                        Spacer()
                        Text("\(Int(point.value), format: .number)")
                            .foregroundStyle(.secondary)
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .padding(.horizontal)
            }
            .navigationTitle("Health Charts")
        }
    }
}

#Preview {
    ContentView()
}
