import type { ColorSpec } from "./types";
import { isT, num, type V } from "./values";

export type PathElement =
  | { type: "move"; to: { x: number; y: number } }
  | { type: "line"; to: { x: number; y: number } }
  | { type: "quadCurve"; to: { x: number; y: number }; control: { x: number; y: number } }
  | { type: "close" }
  | { type: "ellipse"; rect: { x: number; y: number; width: number; height: number } };

export interface PathValue {
  t: "path";
  elements: PathElement[];
}

export interface CanvasFillCommand {
  type: "fill";
  d: string;
  color: ColorSpec;
}

export interface CanvasStrokeCommand {
  type: "stroke";
  d: string;
  color: ColorSpec;
  lineWidth: number;
  lineCap?: string;
  lineJoin?: string;
}

export type CanvasCommand = CanvasFillCommand | CanvasStrokeCommand;

export interface GraphicsContextValue {
  t: "graphics_context";
  commands: CanvasCommand[];
}

export function pathToSvgD(elements: PathElement[]): string {
  const parts: string[] = [];
  for (const el of elements) {
    if (el.type === "move") {
      parts.push(`M ${el.to.x} ${el.to.y}`);
    } else if (el.type === "line") {
      parts.push(`L ${el.to.x} ${el.to.y}`);
    } else if (el.type === "quadCurve") {
      parts.push(`Q ${el.control.x} ${el.control.y} ${el.to.x} ${el.to.y}`);
    } else if (el.type === "close") {
      parts.push("Z");
    } else if (el.type === "ellipse") {
      const { x, y, width, height } = el.rect;
      const rx = width / 2;
      const ry = height / 2;
      const cx = x + rx;
      const cy = y + ry;
      parts.push(`M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`);
    }
  }
  return parts.join(" ");
}

export function extractPoint(v: V): { x: number; y: number } {
  if (!v) return { x: 0, y: 0 };
  if (isT(v, "tuple")) {
    const xIdx = v.labels.indexOf("x");
    const yIdx = v.labels.indexOf("y");
    const x = num(v.items[xIdx >= 0 ? xIdx : 0] ?? 0);
    const y = num(v.items[yIdx >= 0 ? yIdx : 1] ?? 0);
    return { x, y };
  }
  if (isT(v, "rec") || isT(v, "obj")) {
    const x = num(v.fields.get("x") ?? 0);
    const y = num(v.fields.get("y") ?? 0);
    return { x, y };
  }
  return { x: 0, y: 0 };
}

export function extractRect(v: V): { x: number; y: number; width: number; height: number } {
  if (!v) return { x: 0, y: 0, width: 0, height: 0 };
  if (isT(v, "tuple")) {
    const xIdx = v.labels.indexOf("x");
    const yIdx = v.labels.indexOf("y");
    const wIdx = v.labels.indexOf("width");
    const hIdx = v.labels.indexOf("height");
    const x = num(v.items[xIdx >= 0 ? xIdx : 0] ?? 0);
    const y = num(v.items[yIdx >= 0 ? yIdx : 1] ?? 0);
    const width = num(v.items[wIdx >= 0 ? wIdx : 2] ?? 0);
    const height = num(v.items[hIdx >= 0 ? hIdx : 3] ?? 0);
    return { x, y, width, height };
  }
  if (isT(v, "rec") || isT(v, "obj")) {
    const x = num(v.fields.get("x") ?? 0);
    const y = num(v.fields.get("y") ?? 0);
    const width = num(v.fields.get("width") ?? 0);
    const height = num(v.fields.get("height") ?? 0);
    return { x, y, width, height };
  }
  return { x: 0, y: 0, width: 0, height: 0 };
}

export function extractColorSpec(v: V | undefined, _scheme?: "light" | "dark"): ColorSpec {
  if (!v) return { name: "primary" };
  if (isT(v, "color")) return v.spec;
  if (isT(v, "sym")) {
    if (v.name === "color" && v.args && v.args.length > 0) {
      return extractColorSpec(v.args[0].value);
    }
    return { name: v.name };
  }
  return { name: "primary" };
}
