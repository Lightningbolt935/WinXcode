import fs from "fs";

const content = fs.readFileSync("XWinCode/src/lib/preview/swiftui.ts", "utf-8");
const match = content.match(/export const IGNORED = new Set\(\[(\s*[\s\S]*?)\]\);/);
if (!match) {
  console.error("Could not find IGNORED in swiftui.ts");
  process.exit(1);
}

const allModifiers = match[1]
  .split("\n")
  .map(l => l.trim().replace(/[",]/g, ""))
  .filter(l => l.length > 0 && !l.startsWith("//"));

console.log(`Original total in IGNORED: ${allModifiers.length}`);

// Group (a): Pure safe no-ops (accessibility, identity, tags, lifecycle, keyboard hints, gesture handlers, data injection)
const GROUP_A_NO_VISUAL = new Set([
  // Accessibility (18)
  "accessibilityLabel",
  "accessibilityHint",
  "accessibilityIdentifier",
  "accessibilityHidden",
  "accessibilityElement",
  "accessibilityAddTraits",
  "accessibilityValue",
  "accessibilityAdjustableAction",
  "accessibilityAction",
  "accessibilityHeading",
  "accessibilitySortPriority",
  "accessibilityRotor",
  "accessibilityRespondsToUserInteraction",
  "accessibilityChildren",
  "accessibilityInputLabels",
  "accessibilityShowsLargeContentViewer",
  "accessibilityZoomAction",
  "accessibilityScrollAction",

  // Identity, Metadata, Privacy (5)
  "id",
  "help",
  "privacySensitive",
  "privacySensitiveIfAvailable",
  "coordinateSpace",

  // Input & Keyboard Hints (10)
  "keyboardType",
  "textInputAutocapitalization",
  "autocapitalization",
  "autocorrectionDisabled",
  "disableAutocorrection",
  "submitLabel",
  "focused",
  "onSubmit",
  "focusable",
  "textSelection",

  // Lifecycle & Event Callbacks (7)
  "onAppear",
  "onDisappear",
  "task",
  "onChange",
  "onReceive",
  "onGeometryChange",
  "onScrollGeometryChange",

  // Data & State Injection (3)
  "environment",
  "environmentObject",
  "modelContainer",

  // Gestures & Interaction Listeners (13)
  "onLongPressGesture",
  "gesture",
  "simultaneousGesture",
  "highPriorityGesture",
  "draggable",
  "dropDestination",
  "onDrag",
  "onDrop",
  "onHover",
  "allowsHitTesting",
  "contentShape",
  "defersSystemGestures",
  "onContinuousHover",
  "onKeyPress",

  // System, Scroll & Performance Hints without static visual disruption (9)
  "flipsForRightToLeftLayoutDirection",
  "preferredColorSchemeIfAvailable",
  "springLoadingBehavior",
  "scrollDismissesKeyboard",
  "scrollTargetBehavior",
  "scrollTargetLayout",
  "scrollPosition",
  "scrollBounceBehavior",
  "interactiveDismissDisabled",
  "drawingGroup",
  "geometryGroup",
  "sensoryFeedback",
]);

const groupA = [];
const groupB = [];

for (const mod of allModifiers) {
  if (GROUP_A_NO_VISUAL.has(mod)) {
    groupA.push(mod);
  } else {
    groupB.push(mod);
  }
}

console.log(`\nGroup (a) No Visual Effect (Safe No-Ops): ${groupA.length}`);
console.log(`Group (b) Visual Effect Silently Dropped (DEGRADED): ${groupB.length}`);
console.log(`Total: ${groupA.length + groupB.length}`);

console.log("\n--- Group (a) Safe No-Ops ---");
console.log(groupA.join(", "));

console.log("\n--- Group (b) Degraded Visual Modifiers ---");
console.log(groupB.join(", "));
