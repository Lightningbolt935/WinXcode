import { describe, it, expect } from "vitest";
import { parseSwift } from "./parser";

describe("parser semicolon typeText regression", () => {
  it("parses multiple properties on a single line separated by semicolons", () => {
    const src = `
    struct CardData {
        let id = UUID(); let title: String; let subtitle: String; let stat: String
    }
    `;
    const result = parseSwift(src, "test.swift");
    expect(result.errors).toHaveLength(0);
    expect(result.ast.types).toHaveLength(1);

    const decl = result.ast.types[0];
    expect(decl.name).toBe("CardData");
    expect(decl.props).toHaveLength(4);

    expect(decl.props[0].name).toBe("id");
    expect(decl.props[1].name).toBe("title");
    expect(decl.props[1].type).toBe("String");
    expect(decl.props[2].name).toBe("subtitle");
    expect(decl.props[2].type).toBe("String");
    expect(decl.props[3].name).toBe("stat");
    expect(decl.props[3].type).toBe("String");
  });

  it("handles trailing semicolons and mixed commas", () => {
    const src = `
    struct Mixed {
        var a: Int; var b: String; var c: Double, d: Double;
    }
    `;
    const result = parseSwift(src, "mixed.swift");
    expect(result.errors).toHaveLength(0);
    const decl = result.ast.types[0];
    expect(decl.props.map(p => p.name)).toContain("a");
    expect(decl.props.map(p => p.name)).toContain("b");
    expect(decl.props.find(p => p.name === "a")?.type).toBe("Int");
    expect(decl.props.find(p => p.name === "b")?.type).toBe("String");
  });
});

describe("local computed-property regression (Calculator case)", () => {
  it("parses local computed property with getter block in function body", () => {
    const src = `
    struct CalculatorBrain {
        func evaluate() {
            var accumulator: Double? = 0.0

            var description: String? {
                if let acc = accumulator {
                    return "\(acc)"
                } else {
                    return nil
                }
            }

            for element in stack {
                switch element {
                case .operand(let value):
                    accumulator = value
                }
            }
        }
    }
    `;
    const result = parseSwift(src, "calc.swift");
    expect(result.errors).toHaveLength(0);
    expect(result.ast.types).toHaveLength(1);
    const fn = result.ast.types[0].methods[0];
    expect(fn.name).toBe("evaluate");
    // Ensure the getter was parsed into the decl statement
    const declStmt = fn.body.find(s => s.k === "decl" && s.names.includes("description"));
    expect(declStmt).toBeDefined();
    if (declStmt && declStmt.k === "decl") {
      expect(declStmt.getter).toBeDefined();
      expect(declStmt.getter?.length).toBeGreaterThan(0);
    }
  });
});

describe("student code constructs survey", () => {
  it("parses computed properties in structs and extensions", () => {
    const src = `
    struct Circle {
        var radius: Double
        var area: Double {
            3.14159 * radius * radius
        }
    }
    extension Circle {
        var diameter: Double {
            get { 2 * radius }
        }
    }
    `;
    const result = parseSwift(src, "circle.swift");
    expect(result.errors).toHaveLength(0);
    expect(result.ast.types).toHaveLength(2);
    expect(result.ast.types[0].props.find(p => p.name === "area")?.getter).toBeDefined();
    expect(result.ast.types[1].props.find(p => p.name === "diameter")?.getter).toBeDefined();
  });

  it("parses guard/let patterns with multiple conditions", () => {
    const src = `
    struct Auth {
        func validate(input: String?) {
            guard let text = input, !text.isEmpty else {
                return
            }
            print(text)
        }
    }
    `;
    const result = parseSwift(src, "guard.swift");
    expect(result.errors).toHaveLength(0);
  });

  it("parses trailing closures (single and multiple)", () => {
    const src = `
    struct ActionView: View {
        var body: some View {
            Button("Tap") {
                print("tapped")
            }
            CustomContainer {
                Text("First")
            } footer: {
                Text("Footer")
            }
        }
    }
    `;
    const result = parseSwift(src, "trailing.swift");
    expect(result.errors).toHaveLength(0);
  });

  it("parses @ViewBuilder functions and properties (notes method.attrs omission)", () => {
    const src = `
    struct HelperView: View {
        @ViewBuilder
        func sectionHeader(title: String) -> some View {
            Text(title)
            Divider()
        }

        @ViewBuilder
        var statusBadge: some View {
            Circle().fill(.green)
        }
    }
    `;
    const result = parseSwift(src, "viewbuilder.swift");
    expect(result.errors).toHaveLength(0);
    // Property preserves attrs:
    expect(result.ast.types[0].props[0].attrs).toContain("ViewBuilder");
    // Known omission: Method AST does not currently declare or preserve attrs (result.ast.types[0].methods[0].attrs is undefined)
    const method = result.ast.types[0].methods[0] as unknown as { attrs?: string[] };
    expect(method.attrs).toBeUndefined();
  });

  it("surveys trailing closure attachment behavior (same-line vs newline)", () => {
    // Same line trailing closure attaches to call:
    const srcSameLine = `
    struct V: View {
        var body: some View {
            Button("Tap") { print("ok") }
        }
    }
    `;
    const resSameLine = parseSwift(srcSameLine, "same.swift");
    expect(resSameLine.errors).toHaveLength(0);

    // Newline trailing closure: parser requires !tok.nl, so newline brace is parsed as standalone closure stmt
    const srcNewLine = `
    struct V: View {
        var body: some View {
            Button("Tap")
            {
                print("ok")
            }
        }
    }
    `;
    const resNewLine = parseSwift(srcNewLine, "nl.swift");
    expect(resNewLine.errors).toHaveLength(0);
  });

  it("parses switch with associated value patterns", () => {
    const src = `
    enum ResultState {
        case idle
        case success(String)
        case error(code: Int, message: String)
    }

    struct StateHandler {
        func handle(state: ResultState) {
            switch state {
            case .idle:
                break
            case .success(let data):
                print(data)
            case let .error(code, msg):
                print(code, msg)
            case .error(404, _):
                print("not found")
            }
        }
    }
    `;
    const result = parseSwift(src, "switch.swift");
    expect(result.errors).toHaveLength(0);
  });
});
