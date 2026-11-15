import { describe, it, expect } from "vitest";
import { Runtime } from "./runtime";
import { IGNORED, BEHAVIOR_SKIPPED, DEGRADED } from "./swiftui";

describe("swiftui unsupported and ignored modifiers", () => {
  it("includes accessibility modifiers in IGNORED, runtime hooks in BEHAVIOR_SKIPPED, and visual in DEGRADED", () => {
    expect(IGNORED.has("accessibilityAdjustableAction")).toBe(true);
    expect(IGNORED.has("accessibilityAction")).toBe(true);
    expect(IGNORED.has("accessibilityHeading")).toBe(true);
    expect(IGNORED.has("accessibilitySortPriority")).toBe(true);
    expect(IGNORED.has("accessibilityRotor")).toBe(true);
    expect(IGNORED.has("help")).toBe(true);

    expect(BEHAVIOR_SKIPPED.has("task")).toBe(true);
    expect(BEHAVIOR_SKIPPED.has("onAppear")).toBe(true);
    expect(BEHAVIOR_SKIPPED.has("onChange")).toBe(true);
    expect(BEHAVIOR_SKIPPED.has("environment")).toBe(true);
    expect(BEHAVIOR_SKIPPED.has("gesture")).toBe(true);

    expect(DEGRADED.has("toolbar")).toBe(true);
    expect(DEGRADED.has("sheet")).toBe(true);
    expect(DEGRADED.has("swipeActions")).toBe(true);
    expect(DEGRADED.has("listRowBackground")).toBe(true);
    expect(DEGRADED.has("blur")).toBe(true);
  });

  it("classifies ignored modifiers with @ignored note, behavior with @behavior, and degraded with @degraded", () => {
    const src = `
    import SwiftUI

    struct AccessibleView: View {
        var body: some View {
            Text("Adjustable")
                .accessibilityAdjustableAction { direction in
                }
                .onAppear {
                    print("loaded")
                }
                .toolbar {
                    Text("Action")
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
    expect(result.notes).toContain("@behavior:onAppear");
    expect(result.notes).toContain("@degraded:toolbar");
  });

  it("emits Unsupported node for unhandled views like Chart", () => {
    const src = `
    import SwiftUI

    struct ChartPreview: View {
        var body: some View {
            Chart {
            }
        }
    }
    `;
    const rt = new Runtime();
    rt.setFiles([{ path: "ChartPreview.swift", src }]);
    const targets = rt.targets("ChartPreview.swift");
    expect(targets.length).toBeGreaterThan(0);

    const result = rt.render("ChartPreview.swift", targets[0].key);
    expect(result.errors).toHaveLength(0);
    expect(result.tree).not.toBeNull();
    expect(result.tree?.type).toBe("Unsupported");
    expect(result.tree?.props?.name).toBe("Chart");
  });
});
