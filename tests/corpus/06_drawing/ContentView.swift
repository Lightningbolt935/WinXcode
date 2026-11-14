import SwiftUI

// Corpus App 06: Drawing App
// Tests: Canvas, Path, DragGesture, CGPoint, Color, Stroke, @State with complex types

struct Stroke {
    var points: [CGPoint]
    var color: Color
    var lineWidth: CGFloat
}

struct ContentView: View {
    @State private var strokes: [Stroke] = []
    @State private var currentStroke: Stroke? = nil
    @State private var selectedColor: Color = .black
    @State private var lineWidth: CGFloat = 4
    @State private var showClearAlert = false

    let palette: [Color] = [.black, .red, .blue, .green, .orange, .purple, .pink]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Toolbar
                HStack(spacing: 12) {
                    ForEach(palette, id: \.self) { color in
                        Circle()
                            .fill(color)
                            .frame(width: selectedColor == color ? 32 : 24,
                                   height: selectedColor == color ? 32 : 24)
                            .overlay(Circle().stroke(.white, lineWidth: selectedColor == color ? 3 : 0))
                            .shadow(radius: selectedColor == color ? 2 : 0)
                            .onTapGesture { selectedColor = color }
                            .animation(.spring(response: 0.3), value: selectedColor)
                    }
                    Divider().frame(height: 32)
                    HStack {
                        Image(systemName: "pencil.tip")
                        Slider(value: $lineWidth, in: 1...20)
                            .frame(width: 80)
                        Image(systemName: "pencil.tip")
                            .font(.title2)
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
                .background(.regularMaterial)

                // Canvas
                Canvas { context, size in
                    for stroke in strokes {
                        drawStroke(stroke, in: &context)
                    }
                    if let current = currentStroke {
                        drawStroke(current, in: &context)
                    }
                }
                .background(Color.white)
                .gesture(
                    DragGesture(minimumDistance: 0)
                        .onChanged { value in
                            if currentStroke == nil {
                                currentStroke = Stroke(points: [value.location],
                                                       color: selectedColor,
                                                       lineWidth: lineWidth)
                            } else {
                                currentStroke?.points.append(value.location)
                            }
                        }
                        .onEnded { _ in
                            if let stroke = currentStroke {
                                strokes.append(stroke)
                                currentStroke = nil
                            }
                        }
                )
            }
            .navigationTitle("Drawing Pad")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        guard !strokes.isEmpty else { return }
                        strokes.removeLast()
                    } label: {
                        Image(systemName: "arrow.uturn.backward")
                    }
                    .disabled(strokes.isEmpty)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Clear", role: .destructive) {
                        showClearAlert = true
                    }
                    .disabled(strokes.isEmpty)
                }
            }
            .alert("Clear canvas?", isPresented: $showClearAlert) {
                Button("Clear", role: .destructive) { strokes = [] }
                Button("Cancel", role: .cancel) {}
            }
        }
    }

    func drawStroke(_ stroke: Stroke, in context: inout GraphicsContext) {
        guard stroke.points.count > 1 else { return }
        var path = Path()
        path.move(to: stroke.points[0])
        for point in stroke.points.dropFirst() {
            path.addLine(to: point)
        }
        context.stroke(path,
                       with: .color(stroke.color),
                       style: StrokeStyle(lineWidth: stroke.lineWidth, lineCap: .round, lineJoin: .round))
    }
}

#Preview {
    ContentView()
}
