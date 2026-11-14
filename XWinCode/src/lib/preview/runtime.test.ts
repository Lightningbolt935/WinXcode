import { describe, it, expect, beforeEach } from "vitest";
import { Runtime, clearAppStorage } from "./runtime";

describe("Phase 1a Shims: DispatchQueue and @AppStorage", () => {
  beforeEach(() => {
    clearAppStorage();
  });

  describe("DispatchQueue.main.asyncAfter", () => {
    it("executes tasks in correct order based on deadline (earlier first)", () => {
      const rt = new Runtime();
      const executionLog: string[] = [];

      // Register tasks with varying delays
      rt.scheduleTimer(200, () => executionLog.push("task-200ms"));
      rt.scheduleTimer(50, () => executionLog.push("task-50ms"));
      rt.scheduleTimer(100, () => executionLog.push("task-100ms"));

      // Advance 75ms -> task-50ms should run
      rt.advanceTimers(75);
      expect(executionLog).toEqual(["task-50ms"]);

      // Advance another 50ms (total 125ms) -> task-100ms should run
      rt.advanceTimers(50);
      expect(executionLog).toEqual(["task-50ms", "task-100ms"]);

      // Flush remaining -> task-200ms runs
      rt.flushTimers();
      expect(executionLog).toEqual(["task-50ms", "task-100ms", "task-200ms"]);
    });

    it("executes tasks with identical deadlines in deterministic FIFO order", () => {
      const rt = new Runtime();
      const order: number[] = [];

      rt.scheduleTimer(100, () => order.push(1));
      rt.scheduleTimer(100, () => order.push(2));
      rt.scheduleTimer(100, () => order.push(3));

      rt.flushTimers();
      expect(order).toEqual([1, 2, 3]);
    });

    it("evaluates DispatchQueue.main.asyncAfter in Swift code via button action", () => {
      const src = `
      import SwiftUI

      struct AsyncTimerView: View {
          @State private var message = "Initial"

          var body: some View {
              Button(message) {
                  DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                      self.message = "Updated after 100ms"
                  }
              }
          }
      }
      `;
      const rt = new Runtime();
      rt.setFiles([{ path: "AsyncTimerView.swift", src }]);
      const targets = rt.targets("AsyncTimerView.swift");
      expect(targets.length).toBeGreaterThan(0);

      const render1 = rt.render("AsyncTimerView.swift", targets[0].key);
      expect(render1.errors).toHaveLength(0);
      expect(render1.tree?.props?.title).toBe("Initial");

      // Tap button to schedule asyncAfter
      const btnId = render1.tree?.id;
      expect(btnId).toBeDefined();
      rt.dispatch({ id: btnId!, kind: "tap" });

      // Before timer fires, state is still "Initial"
      const beforeTimer = rt.render("AsyncTimerView.swift", targets[0].key);
      expect(beforeTimer.tree?.props?.title).toBe("Initial");

      // Advance timers by 150ms to fire the scheduled block
      rt.advanceTimers(150);

      const render2 = rt.render("AsyncTimerView.swift", targets[0].key);
      expect(render2.tree?.props?.title).toBe("Updated after 100ms");
    });

    it("supports .seconds and .milliseconds deadline offsets with correct order", () => {
      const src = `
      import SwiftUI

      struct MultiOrderView: View {
          @State private var log = ""

          var body: some View {
              Button(log) {
                  DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(2)) {
                      self.log = self.log + " [C:2s]"
                  }
                  DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(100)) {
                      self.log = self.log + " [A:100ms]"
                  }
                  DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                      self.log = self.log + " [B:500ms]"
                  }
              }
          }
      }
      `;
      const rt = new Runtime();
      rt.setFiles([{ path: "MultiOrderView.swift", src }]);
      const targets = rt.targets("MultiOrderView.swift");
      const render = rt.render("MultiOrderView.swift", targets[0].key);

      // Trigger button tap
      const btnId = render.tree?.id;
      expect(btnId).toBeDefined();
      rt.dispatch({ id: btnId!, kind: "tap" });

      // Advance 250ms -> only 100ms task fires
      rt.advanceTimers(250);
      const midRender = rt.render("MultiOrderView.swift", targets[0].key);
      expect(midRender.tree?.props?.title).toBe(" [A:100ms]");

      // Advance another 500ms (total 750ms) -> 500ms task fires
      rt.advanceTimers(500);
      const nextRender = rt.render("MultiOrderView.swift", targets[0].key);
      expect(nextRender.tree?.props?.title).toBe(" [A:100ms] [B:500ms]");

      // Flush remaining -> 2s task fires
      rt.flushTimers();
      const finalRender = rt.render("MultiOrderView.swift", targets[0].key);
      expect(finalRender.tree?.props?.title).toBe(" [A:100ms] [B:500ms] [C:2s]");
    });
  });

  describe("@AppStorage persistence", () => {
    it("uses default value when key does not exist in store", () => {
      const src = `
      import SwiftUI

      struct DefaultStorageView: View {
          @AppStorage("volumeLevel") var volume = 0.8

          var body: some View {
              Text("Volume: \\(volume)")
          }
      }
      `;
      const rt = new Runtime();
      rt.setFiles([{ path: "DefaultStorageView.swift", src }]);
      const targets = rt.targets("DefaultStorageView.swift");
      const res = rt.render("DefaultStorageView.swift", targets[0].key);
      expect(res.errors).toHaveLength(0);
      expect(res.tree?.props?.text).toContain("0.8");
    });

    it("persists writes across distinct Runtime instances", () => {
      const viewSrc = `
      import SwiftUI

      struct WriterView: View {
          @AppStorage("userStreak") var streak = 0

          var body: some View {
              Button("Increment") {
                  streak = streak + 1
              }
          }
      }
      `;
      const rt1 = new Runtime();
      rt1.setFiles([{ path: "WriterView.swift", src: viewSrc }]);
      const targets1 = rt1.targets("WriterView.swift");
      const res1 = rt1.render("WriterView.swift", targets1[0].key);

      // Trigger the button tap event to modify @AppStorage
      const buttonId = res1.tree?.id;
      expect(buttonId).toBeDefined();
      const handled = rt1.dispatch({ id: buttonId!, kind: "tap" });
      expect(handled).toBe(true);

      // Create a completely separate Runtime instance
      const readerSrc = `
      import SwiftUI

      struct ReaderView: View {
          @AppStorage("userStreak") var streak = 0

          var body: some View {
              Text("Current streak: \\(streak)")
          }
      }
      `;
      const rt2 = new Runtime();
      rt2.setFiles([{ path: "ReaderView.swift", src: readerSrc }]);
      const targets2 = rt2.targets("ReaderView.swift");
      const res2 = rt2.render("ReaderView.swift", targets2[0].key);

      expect(res2.errors).toHaveLength(0);
      expect(res2.tree?.props?.text).toBe("Current streak: 1");
    });

    it("shares state between multiple views using the same key in the same runtime", () => {
      const multiSrc = `
      import SwiftUI

      struct ToggleView: View {
          @AppStorage("isDarkMode") var isDarkMode = false

          var body: some View {
              Toggle("Dark Mode", isOn: $isDarkMode)
          }
      }

      struct DisplayView: View {
          @AppStorage("isDarkMode") var isDarkMode = false

          var body: some View {
              Text(isDarkMode ? "DARK" : "LIGHT")
          }
      }
      `;
      const rt = new Runtime();
      rt.setFiles([{ path: "Views.swift", src: multiSrc }]);

      // Initially DisplayView shows LIGHT
      const displayRes1 = rt.render("Views.swift", "view:DisplayView");
      expect(displayRes1.tree?.props?.text).toBe("LIGHT");

      // ToggleView sets isDarkMode to true
      const toggleRes = rt.render("Views.swift", "view:ToggleView");
      const toggleId = toggleRes.tree?.id;
      expect(toggleId).toBeDefined();
      rt.dispatch({ id: toggleId!, kind: "set", value: true });

      // DisplayView now reads DARK
      const displayRes2 = rt.render("Views.swift", "view:DisplayView");
      expect(displayRes2.tree?.props?.text).toBe("DARK");
    });
  });
});
