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
