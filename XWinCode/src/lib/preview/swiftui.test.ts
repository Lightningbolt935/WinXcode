import { describe, it, expect } from "vitest";
import { Runtime } from "./runtime";
import { IGNORED } from "./swiftui";

describe("swiftui unsupported and ignored modifiers", () => {
  it("includes accessibility modifiers in IGNORED set", () => {
    expect(IGNORED.has("accessibilityAdjustableAction")).toBe(true);
    expect(IGNORED.has("accessibilityAction")).toBe(true);
    expect(IGNORED.has("accessibilityHeading")).toBe(true);
    expect(IGNORED.has("accessibilitySortPriority")).toBe(true);
    expect(IGNORED.has("accessibilityRotor")).toBe(true);
  });

  it("classifies ignored modifiers with @ignored note in runtime", () => {
    const src = `
    import SwiftUI

    struct AccessibleView: View {
        var body: some View {
            Text("Adjustable")
                .accessibilityAdjustableAction { direction in
                }
        }
    }
    `;
    const rt = new Runtime();
    rt.setFiles([{ path: "AccessibleView.swift", src }]);
    const targets = rt.targets("AccessibleView.swift");
    expect(targets.length).toBeGreaterThan(0);

    const result = rt.render("AccessibleView.swift", targets[0].key);
    expect(result.errors).toHaveLength(0);
    expect(result.tree).not.toBeNull();
    expect(result.tree?.type).toBe("Text");
    expect(result.notes).toContain("@ignored:accessibilityAdjustableAction");
  });

  it("emits Unsupported node for unhandled views like Canvas", () => {
    const src = `
    import SwiftUI

    struct DrawingPreview: View {
        var body: some View {
            Canvas { context, size in
            }
        }
    }
    `;
    const rt = new Runtime();
    rt.setFiles([{ path: "DrawingPreview.swift", src }]);
    const targets = rt.targets("DrawingPreview.swift");
    expect(targets.length).toBeGreaterThan(0);

    const result = rt.render("DrawingPreview.swift", targets[0].key);
    expect(result.errors).toHaveLength(0);
    expect(result.tree).not.toBeNull();
    expect(result.tree?.type).toBe("Unsupported");
    expect(result.tree?.props?.name).toBe("Canvas");
  });
});
