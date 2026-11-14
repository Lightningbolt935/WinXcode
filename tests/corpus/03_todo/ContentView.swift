import SwiftUI

// Corpus App 03: Todo List
// Tests: List, ForEach, .onDelete, .swipeActions, @State with array,
//        TextField, NavigationStack, Identifiable, Toggle

struct TodoItem: Identifiable {
    let id = UUID()
    var title: String
    var isDone: Bool = false
}

struct ContentView: View {
    @State private var items: [TodoItem] = [
        TodoItem(title: "Buy groceries"),
        TodoItem(title: "Read a chapter"),
        TodoItem(title: "Go for a walk"),
    ]
    @State private var newTitle = ""
    @State private var showDone = true

    var filtered: [TodoItem] {
        showDone ? items : items.filter { !$0.isDone }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        TextField("New task…", text: $newTitle)
                        Button {
                            guard !newTitle.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                            items.insert(TodoItem(title: newTitle), at: 0)
                            newTitle = ""
                        } label: {
                            Image(systemName: "plus.circle.fill")
                                .foregroundStyle(.blue)
                        }
                    }
                }

                Section("\(filtered.filter { !$0.isDone }.count) remaining") {
                    ForEach($items) { $item in
                        if showDone || !item.isDone {
                            HStack {
                                Image(systemName: item.isDone ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(item.isDone ? .green : .secondary)
                                    .onTapGesture { item.isDone.toggle() }

                                Text(item.title)
                                    .strikethrough(item.isDone)
                                    .foregroundStyle(item.isDone ? .secondary : .primary)
                            }
                            .swipeActions(edge: .trailing) {
                                Button(role: .destructive) {
                                    items.removeAll { $0.id == item.id }
                                } label: {
                                    Label("Delete", systemImage: "trash")
                                }
                            }
                            .swipeActions(edge: .leading) {
                                Button {
                                    item.isDone.toggle()
                                } label: {
                                    Label(item.isDone ? "Undo" : "Done",
                                          systemImage: item.isDone ? "arrow.uturn.backward" : "checkmark")
                                }
                                .tint(.green)
                            }
                        }
                    }
                }
            }
            .navigationTitle("My Todos")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Toggle(isOn: $showDone) {
                        Text("Show done")
                    }
                    .toggleStyle(.button)
                }
                ToolbarItem(placement: .topBarLeading) {
                    Button("Clear done") {
                        items.removeAll { $0.isDone }
                    }
                    .disabled(items.allSatisfy { !$0.isDone })
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
