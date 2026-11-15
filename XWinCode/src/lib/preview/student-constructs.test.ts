import { describe, it, expect } from "vitest";
import { Runtime } from "./runtime";

describe("Student Constructs Survey", () => {
  const evaluate = (src: string, target?: string) => {
    const rt = new Runtime();
    rt.setFiles([{ path: "Test.swift", src }]);
    const targets = rt.targets("Test.swift");
    const key = target ?? targets[0]?.key;
    if (!key) return { rt, errors: ["No target found"], tree: null, notes: [] };
    const res = rt.render("Test.swift", key);
    return { rt, errors: res.errors.map(e => e.message), tree: res.tree, notes: res.notes };
  };

  it("1. Computed properties (structs and extensions)", () => {
    // 1a. Struct getter
    const src1 = `
      import SwiftUI
      struct Circle {
        var radius: Double
        var area: Double {
          3.14159 * radius * radius
        }
      }
      struct TestView: View {
        let c = Circle(radius: 10)
        var body: some View {
          Text("Area: \\(c.area)")
        }
      }
    `;
    const res1 = evaluate(src1);
    expect(res1.errors).toEqual([]);
    expect(res1.tree?.props.text).toContain("314.159");

    // 1b. Struct getter/setter
    const src2 = `
      import SwiftUI
      struct Temperature {
        var celsius: Double
        var fahrenheit: Double {
          get { celsius * 1.8 + 32 }
          set { celsius = (newValue - 32) / 1.8 }
        }
      }
      struct TestView: View {
        var t = Temperature(celsius: 25)
        var body: some View {
          Text("F: \\(t.fahrenheit)")
        }
      }
    `;
    const res2 = evaluate(src2);
    expect(res2.errors).toEqual([]);

    // 1c. Extension computed property
    const src3 = `
      import SwiftUI
      extension Int {
        var isEven: Bool { self % 2 == 0 }
      }
      struct TestView: View {
        var body: some View {
          Text("Even: \\(4.isEven)")
        }
      }
    `;
    const res3 = evaluate(src3);
    expect(res3.errors).toEqual([]);
    expect(res3.tree?.props.text).toBe("Even: true");

    // 1d. Property observers (didSet / willSet)
    const src4 = `
      import SwiftUI
      struct StepTracker: View {
        var steps: Int = 0 {
          didSet { print("steps changed") }
        }
        var body: some View {
          Text("Steps: \\(steps)")
        }
      }
    `;
    const res4 = evaluate(src4);
    // Let's see if property observers parse and evaluate
    console.log("1d. Property observers (didSet):", res4.errors);
  });

  it("2. Guard/let patterns", () => {
    // 2a. Simple guard let
    const src1 = `
      import SwiftUI
      struct TestView: View {
        func greet(_ name: String?) -> String {
          guard let n = name else { return "Guest" }
          return "Hello, \\(n)"
        }
        var body: some View {
          Text(greet("Sam"))
        }
      }
    `;
    const res1 = evaluate(src1);
    expect(res1.errors).toEqual([]);
    expect(res1.tree?.props.text).toBe("Hello, Sam");

    // 2b. Multiple guard let conditions and boolean clauses
    const src2 = `
      import SwiftUI
      struct TestView: View {
        func check(a: Int?, b: Int?) -> String {
          guard let x = a, let y = b, x > 0, y > 0 else {
            return "Invalid"
          }
          return "Sum: \\(x + y)"
        }
        var body: some View {
          Text(check(a: 5, b: 10))
        }
      }
    `;
    const res2 = evaluate(src2);
    console.log("2b. Multi guard let conditions:", res2.errors);

    // 2c. Guard case pattern matching
    const src3 = `
      import SwiftUI
      enum Item { case note(String) }
      struct TestView: View {
        func text(from item: Item) -> String {
          guard case .note(let txt) = item else { return "None" }
          return txt
        }
        var body: some View {
          Text(text(from: .note("Test")))
        }
      }
    `;
    const res3 = evaluate(src3);
    console.log("2c. Guard case pattern matching:", res3.errors);
  });

  it("3. Trailing closures (same-line vs newline vs multiple trailing)", () => {
    // 3a. Same line vs newline
    const src1 = `
      import SwiftUI
      struct TestView: View {
        @State private var count = 0
        var body: some View {
          VStack {
            Button("Same") {
              count += 1
            }
            Button("New")
            {
              count += 2
            }
          }
        }
      }
    `;
    const res1 = evaluate(src1);
    expect(res1.errors).toEqual([]);

    // 3b. Multiple trailing closures (Swift 5.3+)
    const src2 = `
      import SwiftUI
      struct TestView: View {
        var body: some View {
          Button {
            print("tap")
          } label: {
            Text("Custom Label")
          }
        }
      }
    `;
    const res2 = evaluate(src2);
    console.log("3b. Multiple trailing closures:", res2.errors);
  });

  it("4. @ViewBuilder functions and properties", () => {
    // 4a. @ViewBuilder function returning multiple child views without explicit container
    const src1 = `
      import SwiftUI
      struct TestView: View {
        @ViewBuilder
        func card() -> some View {
          Text("Title")
          Text("Subtitle")
        }
        var body: some View {
          VStack {
            card()
          }
        }
      }
    `;
    const res1 = evaluate(src1);
    console.log("4a. @ViewBuilder func multiple views:", res1.errors);

    // 4b. @ViewBuilder computed property with if/else
    const src2 = `
      import SwiftUI
      struct TestView: View {
        var showDetails = true
        @ViewBuilder
        var content: some View {
          if showDetails {
            Text("Details")
          } else {
            Text("Summary")
          }
        }
        var body: some View {
          content
        }
      }
    `;
    const res2 = evaluate(src2);
    console.log("4b. @ViewBuilder computed property:", res2.errors);
  });

  it("5. Switch with associated values and patterns", () => {
    const src1 = `
      import SwiftUI
      enum StateResult {
        case idle
        case success(String)
        case error(code: Int, message: String)
      }
      struct TestView: View {
        let state = StateResult.success("Loaded")
        var body: some View {
          switch state {
          case .idle:
            Text("Idle")
          case .success(let msg):
            Text("Success: \\(msg)")
          case let .error(code, msg):
            Text("Error \\(code): \\(msg)")
          }
        }
      }
    `;
    const res1 = evaluate(src1);
    expect(res1.errors).toEqual([]);

    // 5b. Switch with where clause
    const src2 = `
      import SwiftUI
      enum Status {
        case count(Int)
      }
      struct TestView: View {
        let s = Status.count(15)
        var body: some View {
          switch s {
          case .count(let n) where n > 10:
            Text("High: \\(n)")
          default:
            Text("Low")
          }
        }
      }
    `;
    const res2 = evaluate(src2);
    console.log("5b. Switch with where clause:", res2.errors);
  });

  it("6. Nested struct mutation like items[i].done.toggle()", () => {
    const src = `
      import SwiftUI
      struct TodoItem {
        var title: String
        var done: Bool
      }
      struct TestView: View {
        @State private var items = [TodoItem(title: "Task 1", done: false)]
        var body: some View {
          Button(items[0].done ? "Done" : "Pending") {
            items[0].done.toggle()
          }
        }
      }
    `;
    const res = evaluate(src);
    expect(res.errors).toEqual([]);
    const eventId = res.tree?.event;
    expect(eventId).toBeDefined();
    if (eventId) {
      res.rt.dispatch({ id: eventId, kind: "tap" });
      const after = res.rt.render("Test.swift", "view:TestView");
      expect(after.tree?.props.title).toBe("Done");
    }
  });

  it("7. currentStroke?.points.append(...) (nested struct optional chaining mutation)", () => {
    const src = `
      import SwiftUI
      struct Stroke {
        var points: [CGPoint]
      }
      struct TestView: View {
        @State private var currentStroke: Stroke? = Stroke(points: [])
        var body: some View {
          Button("Add") {
            currentStroke?.points.append(CGPoint(x: 10, y: 20))
          }
          Text("Points: \\(currentStroke?.points.count ?? 0)")
        }
      }
    `;
    const res = evaluate(src);
    expect(res.errors).toEqual([]);
    const eventId = res.tree?.children?.[0]?.event;
    if (eventId) {
      res.rt.dispatch({ id: eventId, kind: "tap" });
      const after = res.rt.render("Test.swift", "view:TestView");
      console.log("7. currentStroke?.points.append result:", after.tree?.children?.[1]?.props.text);
    }
  });

  it("8. Array/dictionary mutation through @State/@Binding", () => {
    // 8a. Array/dict @State mutation
    const src1 = `
      import SwiftUI
      struct TestView: View {
        @State private var list = ["A", "B"]
        @State private var dict = ["key": "val"]
        var body: some View {
          VStack {
            Button("MutateArray") {
              list.append("C")
              list.remove(at: 0)
            }
            Button("MutateDict") {
              dict["newKey"] = "newVal"
            }
            Text("List: \\(list.count), Dict: \\(dict.count)")
          }
        }
      }
    `;
    const res1 = evaluate(src1);
    expect(res1.errors).toEqual([]);
    const btn1 = res1.tree?.children?.[0]?.event;
    if (btn1) res1.rt.dispatch({ id: btn1, kind: "tap" });
    const btn2 = res1.tree?.children?.[1]?.event;
    if (btn2) res1.rt.dispatch({ id: btn2, kind: "tap" });
    const after1 = res1.rt.render("Test.swift", "view:TestView");
    expect(after1.tree?.children?.[2]?.props.text).toBe("List: 2, Dict: 2");

    // 8b. @Binding mutation passed to child view
    const src2 = `
      import SwiftUI
      struct RowView: View {
        @Binding var isDone: Bool
        var body: some View {
          Button(isDone ? "Yes" : "No") {
            isDone.toggle()
          }
        }
      }
      struct ParentView: View {
        @State private var completed = false
        var body: some View {
          RowView(isDone: $completed)
        }
      }
    `;
    const res2 = evaluate(src2, "view:ParentView");
    console.log("8b. @Binding mutation:", res2.errors);
    const childBtn = res2.tree?.event;
    if (childBtn) {
      res2.rt.dispatch({ id: childBtn, kind: "tap" });
      const after2 = res2.rt.render("Test.swift", "view:ParentView");
      console.log("8b. After binding tap:", after2.tree?.props.title);
    }
  });

  it("9. Enums with associated values & if case let", () => {
    // 9a. if case let pattern matching
    const src1 = `
      import SwiftUI
      enum ResultValue {
        case ok(String)
        case fail
      }
      struct TestView: View {
        let res = ResultValue.ok("Passed")
        var body: some View {
          if case .ok(let msg) = res {
            Text("OK: \\(msg)")
          } else {
            Text("Failed")
          }
        }
      }
    `;
    const res1 = evaluate(src1);
    console.log("9a. if case let:", res1.errors, res1.tree?.props.text);
  });

  it("10. Protocols and protocol extensions", () => {
    // 10a. Protocol default implementation via extension
    const src1 = `
      import SwiftUI
      protocol Greetable {
        func greeting() -> String
      }
      extension Greetable {
        func greeting() -> String { "Hello default" }
      }
      struct Person: Greetable {}
      struct TestView: View {
        let p = Person()
        var body: some View {
          Text(p.greeting())
        }
      }
    `;
    const res1 = evaluate(src1);
    console.log("10a. Protocol extension tree:", JSON.stringify(res1.tree), "errors:", res1.errors);
    expect(res1.errors).toEqual([]);
    expect(res1.tree?.props.text).toBe("Hello default");

    // 10b. Protocol as existential type: let p: Greetable
    const src2 = `
      import SwiftUI
      protocol Greetable {
        func greeting() -> String
      }
      struct Dog: Greetable {
        func greeting() -> String { "Woof" }
      }
      struct TestView: View {
        let pet: Greetable = Dog()
        var body: some View {
          Text(pet.greeting())
        }
      }
    `;
    const res2 = evaluate(src2);
    console.log("10b. Protocol existential type tree:", JSON.stringify(res2.tree), "errors:", res2.errors);
    expect(res2.errors).toEqual([]);
    expect(res2.tree?.props.text).toBe("Woof");

    // 10c. Protocol default computed property via extension
    const src3 = `
      import SwiftUI
      protocol IdentifiableNamed {
        var name: String { get }
      }
      extension IdentifiableNamed {
        var greeting: String { "Hello, \\(name)!" }
      }
      struct User: IdentifiableNamed {
        var name: String
      }
      struct TestView: View {
        let u = User(name: "Alice")
        var body: some View {
          Text(u.greeting)
        }
      }
    `;
    const res3 = evaluate(src3);
    expect(res3.errors).toEqual([]);
    expect(res3.tree?.props.text).toBe("Hello, Alice!");

    // 10d. Protocol extension default method called on self
    const src4 = `
      import SwiftUI
      protocol Describable {
        func describeMe() -> String
      }
      extension Describable {
        func describeMe() -> String { "I am describable" }
      }
      struct ItemView: View, Describable {
        var body: some View {
          Text(describeMe())
        }
      }
    `;
    const res4 = evaluate(src4);
    expect(res4.errors).toEqual([]);
    expect(res4.tree?.props.text).toBe("I am describable");
  });

  it("12. Additional Student Patterns: Generics, Operator Closures, ViewBuilder Containers", () => {
    // 12a. Generic struct / function (CapyTimer failure case)
    const src1 = `
      import SwiftUI
      struct Box<T> {
        var value: T
      }
      struct TestView: View {
        let b = Box(value: "Generic Content")
        var body: some View {
          Text(b.value)
        }
      }
    `;
    const res1 = evaluate(src1);
    console.log("12a. Generic struct:", res1.errors, res1.tree?.props?.text);

    // 12b. Standalone operator passed as closure argument (Calculator failure case)
    const src2 = `
      import SwiftUI
      struct TestView: View {
        func apply(_ op: (Int, Int) -> Int, _ a: Int, _ b: Int) -> Int {
          op(a, b)
        }
        var body: some View {
          Text("Product: \\(apply(*, 3, 4))")
        }
      }
    `;
    const res2 = evaluate(src2);
    console.log("12b. Operator closure (*):", res2.errors, res2.tree?.props?.text);

    // 12c. Custom View with @ViewBuilder closure parameter
    const src3 = `
      import SwiftUI
      struct Container<Content: View>: View {
        @ViewBuilder let content: () -> Content
        var body: some View {
          VStack {
            content()
          }
        }
      }
      struct TestView: View {
        var body: some View {
          Container {
            Text("Inside container")
          }
        }
      }
    `;
    const res3 = evaluate(src3);
    console.log("12c. Custom @ViewBuilder container:", res3.errors, res3.tree?.children?.[0]?.props?.text);
  });

  it("11. Extensions", () => {
    // 11a. Generic extension / constrained extension
    const src1 = `
      import SwiftUI
      extension Array where Element == Int {
        func sumAll() -> Int {
          var total = 0
          for x in self { total += x }
          return total
        }
      }
      struct TestView: View {
        let numbers = [1, 2, 3, 4]
        var body: some View {
          Text("Sum: \\(numbers.sumAll())")
        }
      }
    `;
    const res1 = evaluate(src1);
    console.log("11a. Extension where Element == Int:", res1.errors, res1.tree?.props.text);
  });
});
