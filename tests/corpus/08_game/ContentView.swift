import SwiftUI

// Corpus App 08: Game using TimelineView
// Tests: TimelineView, .animation(timeline:), TimelineSchedule,
//        Canvas for game rendering, @State game loop, withAnimation

struct Asteroid: Identifiable {
    let id = UUID()
    var x: CGFloat
    var y: CGFloat
    var radius: CGFloat
    var speed: CGFloat
}

struct ContentView: View {
    @State private var asteroids: [Asteroid] = []
    @State private var shipX: CGFloat = 0.5  // 0–1 normalized
    @State private var score = 0
    @State private var lives = 3
    @State private var gameOver = false
    @State private var lastTime: Date? = nil

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let h = geo.size.height

            ZStack {
                // Background
                LinearGradient(colors: [.black, Color(red: 0.05, green: 0.05, blue: 0.2)],
                               startPoint: .top, endPoint: .bottom)
                    .ignoresSafeArea()

                if gameOver {
                    gameOverOverlay
                } else {
                    TimelineView(.animation) { timeline in
                        Canvas { context, size in
                            tick(now: timeline.date, size: size)
                            renderScene(context: &context, size: size)
                        }
                    }

                    // HUD
                    VStack {
                        HStack {
                            Text("Score: \(score)")
                                .font(.headline).foregroundStyle(.white)
                            Spacer()
                            HStack(spacing: 4) {
                                ForEach(0..<3) { i in
                                    Image(systemName: i < lives ? "heart.fill" : "heart")
                                        .foregroundStyle(.red)
                                }
                            }
                        }
                        .padding()
                        Spacer()
                        // Ship drag control
                        Color.clear
                            .gesture(DragGesture(minimumDistance: 0)
                                .onChanged { v in
                                    shipX = max(0, min(1, v.location.x / w))
                                })
                        Text("← Drag to steer →")
                            .font(.caption2).foregroundStyle(.white.opacity(0.5))
                            .padding(.bottom, 32)
                    }
                }
            }
        }
    }

    func tick(now: Date, size: CGSize) {
        guard !gameOver else { return }
        let dt = lastTime.map { now.timeIntervalSince($0) } ?? 0.016
        lastTime = now

        // Spawn
        if Bool.random() && asteroids.count < 12 {
            asteroids.append(Asteroid(x: CGFloat.random(in: 0...1),
                                      y: 0,
                                      radius: CGFloat.random(in: 16...40),
                                      speed: CGFloat.random(in: 0.08...0.2)))
        }

        // Move & check
        let shipPixelX = shipX * size.width
        let shipY = size.height - 60

        asteroids = asteroids.compactMap { a in
            var a = a
            a.y += a.speed * CGFloat(dt) * size.height
            if a.y > size.height + a.radius { score += 1; return nil }
            // Collision
            let ax = a.x * size.width
            let ay = a.y
            let dist = hypot(ax - shipPixelX, ay - shipY)
            if dist < a.radius + 16 {
                lives -= 1
                if lives <= 0 { gameOver = true }
                return nil
            }
            return a
        }
    }

    func renderScene(context: inout GraphicsContext, size: CGSize) {
        // Stars
        for i in 0..<60 {
            let sx = CGFloat(i * 97 % Int(size.width))
            let sy = CGFloat(i * 137 % Int(size.height))
            context.fill(Path(ellipseIn: CGRect(x: sx, y: sy, width: 2, height: 2)), with: .color(.white.opacity(0.6)))
        }
        // Asteroids
        for a in asteroids {
            let ax = a.x * size.width
            context.fill(Path(ellipseIn: CGRect(x: ax - a.radius, y: a.y - a.radius,
                                                width: a.radius * 2, height: a.radius * 2)),
                         with: .color(.gray))
        }
        // Ship
        let sx = shipX * size.width
        var ship = Path()
        ship.move(to: CGPoint(x: sx, y: size.height - 80))
        ship.addLine(to: CGPoint(x: sx - 20, y: size.height - 44))
        ship.addLine(to: CGPoint(x: sx + 20, y: size.height - 44))
        ship.closeSubpath()
        context.fill(ship, with: .color(.cyan))
    }

    var gameOverOverlay: some View {
        VStack(spacing: 24) {
            Text("Game Over").font(.largeTitle).fontWeight(.bold).foregroundStyle(.white)
            Text("Score: \(score)").font(.title2).foregroundStyle(.white)
            Button("Play Again") {
                asteroids = []; score = 0; lives = 3; gameOver = false; lastTime = nil
            }
            .buttonStyle(.borderedProminent)
        }
    }
}

#Preview {
    ContentView()
}
