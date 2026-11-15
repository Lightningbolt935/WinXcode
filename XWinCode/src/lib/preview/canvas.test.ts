import { describe, it, expect } from "vitest";
import { Runtime } from "./runtime";
import { pathToSvgD, extractPoint, extractRect, type PathElement } from "./canvas";

describe("Canvas & Path Runtime", () => {
  it("serializes path elements to SVG path syntax", () => {
    const elements: PathElement[] = [
      { type: "move", to: { x: 10, y: 20 } },
      { type: "line", to: { x: 30, y: 40 } },
      { type: "quadCurve", to: { x: 70, y: 80 }, control: { x: 50, y: 60 } },
      { type: "close" },
    ];
    const d = pathToSvgD(elements);
    expect(d).toBe("M 10 20 L 30 40 Q 50 60 70 80 Z");
  });

  it("serializes ellipseIn to exact SVG arcs", () => {
    const elements: PathElement[] = [
      { type: "ellipse", rect: { x: 10, y: 20, width: 40, height: 60 } },
    ];
    const d = pathToSvgD(elements);
    expect(d).toBe("M 10 50 A 20 30 0 1 0 50 50 A 20 30 0 1 0 10 50 Z");
  });

  it("extracts point and rect from tuple values", () => {
    const pt = extractPoint({ t: "tuple", items: [15, 25], labels: ["x", "y"] });
    expect(pt).toEqual({ x: 15, y: 25 });

    const rect = extractRect({ t: "tuple", items: [5, 10, 100, 200], labels: ["x", "y", "width", "height"] });
    expect(rect).toEqual({ x: 5, y: 10, width: 100, height: 200 });
  });

  it("evaluates Canvas with stroke and fill in Swift code", () => {
    const src = `
      import SwiftUI

      struct TestCanvasView: View {
        var body: some View {
          Canvas { context, size in
            var path = Path()
            path.move(to: CGPoint(x: 10, y: 10))
            path.addLine(to: CGPoint(x: 50, y: 50))
            context.stroke(path, with: .color(.blue), style: StrokeStyle(lineWidth: 3))

            context.fill(Path(ellipseIn: CGRect(x: 20, y: 20, width: 30, height: 30)), with: .color(.red))
          }
        }
      }
    `;

    const rt = new Runtime();
    rt.setFiles([{ path: "Test.swift", src }]);
    const targets = rt.targets("Test.swift");
    expect(targets.length).toBeGreaterThan(0);

    const result = rt.render("Test.swift", targets[0].key);
    expect(result.errors).toEqual([]);
    expect(result.tree).not.toBeNull();
    expect(result.tree?.type).toBe("Canvas");

    const commands = (result.tree?.props.commands as any[]) ?? [];
    expect(commands.length).toBe(2);
    expect(commands[0].type).toBe("stroke");
    expect(commands[0].lineWidth).toBe(3);
    expect(commands[1].type).toBe("fill");
  });

  it("evaluates TimelineView passing date to inner Canvas", () => {
    const src = `
      import SwiftUI

      struct TestTimeline: View {
        var body: some View {
          TimelineView(.animation) { timeline in
            Canvas { context, size in
              var p = Path()
              p.move(to: CGPoint(x: 0, y: 0))
              p.addLine(to: CGPoint(x: 100, y: 100))
              context.stroke(p, with: .color(.green), style: StrokeStyle(lineWidth: 2))
            }
          }
        }
      }
    `;

    const rt = new Runtime();
    rt.setFiles([{ path: "TestTimeline.swift", src }]);
    const targets = rt.targets("TestTimeline.swift");
    const result = rt.render("TestTimeline.swift", targets[0].key);

    expect(result.errors).toEqual([]);
    expect(result.tree?.type).toBe("Canvas");
    const commands = (result.tree?.props.commands as any[]) ?? [];
    expect(commands.length).toBe(1);
    expect(commands[0].type).toBe("stroke");
  });

  it("computes hypot function correctly", () => {
    const src = `
      import SwiftUI

      struct TestHypot: View {
        var body: some View {
          let dist = hypot(3, 4)
          Text("\\(dist)")
        }
      }
    `;

    const rt = new Runtime();
    rt.setFiles([{ path: "TestHypot.swift", src }]);
    const targets = rt.targets("TestHypot.swift");
    const result = rt.render("TestHypot.swift", targets[0].key);

    expect(result.errors).toEqual([]);
    expect(result.tree?.type).toBe("Text");
    expect(result.tree?.props.text).toBe("5.0");
  });
});
