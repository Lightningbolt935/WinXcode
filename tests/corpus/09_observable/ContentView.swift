import SwiftUI
import Observation

// Corpus App 09: @Observable models and @Environment
// Tests: @Observable macro, @Environment, EnvironmentKey, NavigationStack,
//        @Bindable, dependency injection pattern, computed properties

@Observable
class ThemeSettings {
    var isDark: Bool = false
    var accentColor: Color = .blue
    var fontSize: CGFloat = 16

    var foreground: Color { isDark ? .white : .black }
    var background: Color { isDark ? Color(.systemGray6) : .white }
}

@Observable
class CartStore {
    var items: [CartItem] = []

    var total: Double { items.reduce(0) { $0 + $1.price * Double($1.qty) } }
    var count: Int { items.reduce(0) { $0 + $1.qty } }

    func add(_ product: Product) {
        if let idx = items.firstIndex(where: { $0.productId == product.id }) {
            items[idx].qty += 1
        } else {
            items.append(CartItem(productId: product.id, name: product.name, price: product.price))
        }
    }

    func remove(at offsets: IndexSet) {
        items.remove(atOffsets: offsets)
    }
}

struct CartItem: Identifiable {
    let id = UUID()
    let productId: UUID
    var name: String
    var price: Double
    var qty: Int = 1
}

struct Product: Identifiable {
    let id = UUID()
    var name: String
    var price: Double
    var emoji: String
}

let catalog: [Product] = [
    Product(name: "Swift Book", price: 29.99, emoji: "📗"),
    Product(name: "Dev Stickers", price: 9.99, emoji: "🎨"),
    Product(name: "Keyboard", price: 149.00, emoji: "⌨️"),
    Product(name: "USB-C Hub", price: 59.99, emoji: "🔌"),
    Product(name: "Desk Lamp", price: 39.99, emoji: "💡"),
]

struct ContentView: View {
    @State private var theme = ThemeSettings()
    @State private var cart = CartStore()

    var body: some View {
        NavigationStack {
            ProductListView()
                .environment(theme)
                .environment(cart)
                .preferredColorScheme(theme.isDark ? .dark : .light)
                .tint(theme.accentColor)
        }
    }
}

struct ProductListView: View {
    @Environment(ThemeSettings.self) private var theme
    @Environment(CartStore.self) private var cart

    var body: some View {
        List(catalog) { product in
            HStack {
                Text(product.emoji).font(.largeTitle)
                VStack(alignment: .leading) {
                    Text(product.name).font(.headline)
                    Text("\(product.price, format: .currency(code: "USD"))")
                        .font(.subheadline).foregroundStyle(.secondary)
                }
                Spacer()
                Button {
                    cart.add(product)
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                }
            }
        }
        .navigationTitle("Shop")
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                NavigationLink {
                    ThemeEditorView()
                        .environment(theme)
                } label: {
                    Image(systemName: "paintpalette")
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                NavigationLink {
                    CartView()
                        .environment(cart)
                } label: {
                    Label("Cart", systemImage: "cart.fill")
                        .overlay(alignment: .topTrailing) {
                            if cart.count > 0 {
                                Text("\(cart.count)")
                                    .font(.caption2).fontWeight(.bold)
                                    .foregroundStyle(.white)
                                    .padding(4)
                                    .background(.red, in: Circle())
                                    .offset(x: 10, y: -10)
                            }
                        }
                }
            }
        }
    }
}

struct CartView: View {
    @Environment(CartStore.self) private var cart

    var body: some View {
        List {
            ForEach(cart.items) { item in
                HStack {
                    Text(item.name)
                    Spacer()
                    Text("×\(item.qty)").foregroundStyle(.secondary)
                    Text("\(item.price * Double(item.qty), format: .currency(code: "USD"))")
                }
            }
            .onDelete { cart.remove(at: $0) }
        }
        .navigationTitle("Cart · \(cart.total, format: .currency(code: "USD"))")
    }
}

struct ThemeEditorView: View {
    @Environment(ThemeSettings.self) private var theme

    var body: some View {
        @Bindable var theme = theme
        Form {
            Toggle("Dark Mode", isOn: $theme.isDark)
            ColorPicker("Accent Color", selection: $theme.accentColor)
            Slider(value: $theme.fontSize, in: 12...24, step: 1) {
                Text("Font Size: \(Int(theme.fontSize))pt")
            }
        }
        .navigationTitle("Theme")
    }
}

#Preview {
    ContentView()
}
