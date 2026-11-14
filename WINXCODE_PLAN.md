# WinXcode: Implementation Plan (for Antigravity)

> Drop this file in the repo root and tell the agent: "Read WINXCODE_PLAN.md fully. Work phase by phase. Stop at each phase's acceptance criteria and show me the evidence."

---

## 1. Goal

A Windows desktop IDE that lets students who have no Mac write SwiftUI, **see a live preview of their screens**, and **check that their project is a valid Swift Student Challenge submission**.

One-line pitch: *"Windows? Here's your path to a valid Swift Student Challenge entry."*

## 2. Strategy: fork, don't rebuild

Fork **OnelightCyber/XWinCode** (GPL-3.0-or-later). It already has:

- Tauri 2 + React 19 + TypeScript + Monaco + xterm.js
- SourceKit-LSP bridge (`src-tauri/src/lsp.rs`)
- Debugger bridge (`dap.rs`), build/run (`builder.rs`), ConPTY terminal (`pty.rs`)
- A Swift interpreter for the Canvas preview (`src/lib/preview/`: lexer, parser, runtime, iPhone models) and the renderer (`src/components/canvas/`)
- "Live on iPhone" link (`preview.rs`) and a companion app (`src-tauri/preview-app/`)
- Installer, auto-update, i18n

Caveat: the repo is very new (2 commits, 1 star at time of writing) and was only read, not run, when this plan was written. **Phase 0 exists to verify its claims.**

Legal constraints (non-negotiable):
- The fork stays GPL-3.0-or-later and ships its source.
- Do not bundle or redistribute any Apple software or SDK. Users extract the iOS SDK themselves.
- Keep the README's Apple-license notice. Add a plain-language notice that the Xcode/SDK license restricts use to Apple-branded computers, so users decide knowingly.
- Use a name that doesn't use "Xcode" as a brand. Keep "not affiliated with Apple" text.

## 3. Scope

### In scope
1. Reliable live SwiftUI preview (fidelity and honesty about what is unsupported)
2. Swift Student Challenge submission validator + project template
3. Easier first-run setup for students
4. Beta with real students

### Out of scope (do not build before the Feb 2027 deadline)
- A new interpreter from scratch
- Cloud Mac rendering or simulator streaming
- Storyboards, asset catalog editors, plugin system, Git UI
- Guaranteeing Apple judging outcomes

## 4. Challenge rules to design against

Verify against https://developer.apple.com/swift-student-challenge/eligibility/ before coding the validator; rules change yearly.

- 2027 window reported as Feb 8-28, 2027
- Entry is an Xcode app or a Swift Playground app playground, zipped, up to 500 MB (2026 was 25 MB; **confirm the 2027 number**)
- Command line tools and plain packages are not eligible
- Built and runnable with Xcode 27 / Swift Playground 4.7 or later
- Works offline, all resources bundled
- Individual work, English content
- Experienced in 3 minutes or less
- Disqualifiers (2026 terms): does not run during judging, requires sign-in, contains analytics aimed at tracking judges, plagiarized or unattributed third-party content, was submitted before with few changes

## 5. Phases

### Phase 0: Verify the base (Week 1, ~Nov 16-22)

Tasks
- Fork, clone, `npm install`, `npm run tauri dev`. Fix any build issues; record them in `docs/NOTES.md`.
- Run `npx tsc --noEmit` and `cargo test --manifest-path src-tauri/Cargo.toml`.
- Create `tests/corpus/`: 10+ realistic student-style SwiftUI apps, easy to hard:
  1. Counter with `@State`
  2. Quiz app with `NavigationStack` and a results screen
  3. Todo list with `List`, `ForEach`, swipe actions
  4. Onboarding flow with `TabView` paging and animations
  5. Settings screen with `Form`, `Toggle`, `Picker`
  6. Drawing app using `Canvas` / `Path` / `DragGesture`
  7. Chart app using `Charts`
  8. Game using `TimelineView` or `SpriteKit`
  9. App using `@Observable` models and `@Environment`
  10. Accessibility-focused app (Dynamic Type, VoiceOver labels)
- Write `scripts/preview-baseline.*` that opens each file in the Canvas and records: renders / renders-wrong / crashes / unsupported. If headless is hard, do it manually and fill in `docs/BASELINE.md`.

Acceptance
- App builds and runs on a clean Windows 11 machine
- `docs/BASELINE.md` has a table of corpus results with the first failing construct for each failure
- **Go/no-go**: if fewer than ~5 of 10 render acceptably, stop and report; the fallback plan is a smaller "preview on my iPhone" tool

### Phase 1: Preview fidelity and honesty (Weeks 2-4)

Tasks
- Add an **"Unsupported" report**: when the interpreter hits an unknown view, modifier, or API, show it in a panel ("`Canvas` is not supported in the preview, use Live on iPhone to check this") instead of rendering silently wrong. Honest failure is a feature.
- Add a **coverage table** (`docs/COVERAGE.md`, generated if possible) listing supported views/modifiers/property wrappers.
- Fix failures from the baseline in order of how often they'd appear in student apps. Re-run the corpus after each fix; never regress a passing app.
- Add a "Check on iPhone" button that appears whenever the report is non-empty.
- Add unit tests for every construct you fix (`src/lib/preview/*.test.ts`).

Acceptance
- Corpus pass rate improves versus Phase 0, shown in `BASELINE.md`
- No silent wrong renders for known-unsupported constructs
- Tests pass in CI

### Phase 2: Challenge validator + template (Weeks 3-5)

Tasks
- **Template**: "Swift Student Challenge app playground" in the New Project sheet. Generate the structure from a real Xcode/Playground-created template (copy its `Package.swift` shape; do not guess `appModuleIdentifier` and product settings). Include a README for the 3-minute experience and an `ATTRIBUTIONS.md` stub.
- **Validator** (Rust command + UI panel "Submission Check"), each check returns pass / warn / fail with file and line:
  - Package structure matches an app playground; target platform and Swift tools version are sensible
  - Zipped size under the limit (configurable constant)
  - No network use: flag `URLSession`, `URL(string: "http`, remote `AsyncImage`, `WKWebView` loading remote URLs
  - No sign-in or auth SDKs (`ASAuthorization`, Firebase, etc.)
  - No analytics/tracking SDKs
  - All referenced assets exist locally in the package
  - Third-party content: warn if `ATTRIBUTIONS.md` is empty and the project contains non-code assets
  - Reminder checklist items that cannot be automated: 3-minute experience, English only, solo work
- **Export**: "Export submission ZIP" that runs the validator first and refuses on failures.
- Prominent disclaimer in the UI: *"This check catches common problems but can't guarantee your project opens and runs in Xcode or Swift Playground. Test it on a real Mac if you can."*

Acceptance
- Validator has tests with passing and failing fixtures
- Exported ZIP opens in real Xcode or Swift Playground on a Mac (manual test by a friend; record the result in `docs/NOTES.md`)

### Phase 3: First-run experience (Weeks 5-6)

Tasks
- Simplify setup: a guided checklist for Swift, WSL, xtool, SDK, and Apple Devices that can be skipped. **Preview and validator must work without WSL or an iPhone.**
- Clear, plain-language errors for each setup failure with a link to a fix.
- Welcome screen: "Start a challenge project" is the primary button.
- Docs: `docs/GETTING_STARTED.md`, `docs/LICENSE_NOTICE.md`.
- Code-sign the installer if you can afford a certificate; otherwise document the SmartScreen warning with screenshots.

Acceptance
- A tester who has never seen the app can go from install to a previewed screen in under 15 minutes (time 3 people)

### Phase 4: Beta (Weeks 7-8, target ~Jan 5)

Tasks
- Recruit 10-20 testers from the dev community. Give them a short feedback form: what broke, what was confusing, which preview mismatches they saw.
- Add an opt-in "copy diagnostics" button (no automatic telemetry).
- Triage feedback into a public `ROADMAP.md`; fix blockers; cut a `0.1.0` release.

Acceptance
- At least 5 testers got a validated ZIP that opened in real Xcode/Playground
- Known limitations are listed publicly in the README

## 6. Marketing notes (non-code)

- Launch in **early January**, not February.
- Honest messaging: "preview is an approximation; use Live on iPhone or a Mac for final checks."
- Collect testimonials only from people who actually submitted. Never promise winning or passing.

## 7. Rules for the agent

1. Do not fabricate. If you can't run or verify something, say so and mark it **UNVERIFIED** in `docs/NOTES.md`.
2. Read before editing: open the relevant files in `src/lib/preview/`, `src/components/canvas/`, and `src-tauri/src/` before changing them.
3. Small, reviewable commits with the corpus result in the message.
4. After each change run `npx tsc --noEmit` and `cargo test --manifest-path src-tauri/Cargo.toml`.
5. Never commit secrets, Apple credentials, or Apple SDK files.
6. Don't add telemetry that sends data off the machine.
7. Update `CHANGELOG.md` under `## [Unreleased]`.
8. At the end of each phase, stop and summarize: what was done, evidence (test output, screenshots), what is unverified, and the next phase's first step.

## 8. Risks

| Risk | Mitigation |
|---|---|
| XWinCode doesn't build or work as advertised | Phase 0 go/no-go; fallback is a smaller iPhone-preview tool |
| Interpreter can't handle common student code | Unsupported report + Live on iPhone fallback |
| Exported project doesn't open in real Xcode | Template copied from a real one; Mac test before beta; disclaimer |
| Xcode/SDK license issue | Plain notice to users; get legal advice before wide marketing |
| Apple changes rules | Validator constants in one config file; re-verify each year |
| Time (solo, part-time) | Phases are cuttable from the bottom; Phase 0-2 are the minimum viable product |
