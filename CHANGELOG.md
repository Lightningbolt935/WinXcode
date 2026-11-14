# Changelog

All notable changes will be documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Added
- Phase 1a Item 3: Shims for `DispatchQueue.main.asyncAfter` and `@AppStorage` persistence:
  - `DispatchQueue.main.asyncAfter` and `DispatchQueue.main.async` support with timer queue maintaining strict deadline + sequence FIFO ordering
  - `DispatchTime.now()`, `.now() + seconds`, `.seconds(n)`, and `.milliseconds(n)` deadline offset arithmetic
  - Virtual time clock advancement (`advanceTimers`, `flushTimers`, `clearTimers`) for deterministic testing
  - Canvas preview integration: `rt.onUpdate` automatically triggers canvas re-render when timers fire
  - `@AppStorage` persistence shim: persistent key-value store backed by memory and `localStorage` (`winxcode:appstorage:*`), enabling persistence across re-renders and separate `Runtime` instances
  - Unit tests in `XWinCode/src/lib/preview/runtime.test.ts` (7 comprehensive tests passing)
- Phase 1a Item 2: Unsupported callout panel & ignored modifier classification in Canvas and PreviewRender:
  - Visual callouts in Canvas (`.canvas-unsupported-banner`, `.canvas-ignored-banner`) with "Check on iPhone" quick-action button
  - Distinct classification between Level 1 UNSUPPORTED (renders wrong or device-only) and Level 2 IGNORED (safe no-op layout/a11y modifiers)
  - Added `.accessibilityAdjustableAction`, `.accessibilityAction`, `.accessibilityHeading`, `.accessibilitySortPriority`, `.accessibilityRotor`, `.accessibilityRespondsToUserInteraction`, `.accessibilityChildren`, `.accessibilityInputLabels`, `.accessibilityShowsLargeContentViewer`, `.accessibilityZoomAction`, `.accessibilityScrollAction` to `IGNORED` set
  - Unit tests in `XWinCode/src/lib/preview/swiftui.test.ts`
### Fixed
- Phase 1a Item 1: Parser `;` terminator bug in `parser.ts:551` and `parser.ts:561` where `typeText` did not stop at semicolons on same-line declarations
### Added
- Phase 1a Item 1: Unit tests in `src/lib/preview/parser.test.ts` for multiple properties separated by semicolons
- Phase 1a Item 0: `tests/corpus2/` — 10 real-world permissively licensed open-source SwiftUI apps (Apple, Paul Hudson, Swiftify, Peter Friese, etc.)
- Phase 1a Item 0: `tests/corpus2/SOURCES.md` — source URLs, copyright, and licenses for all 10 apps
- Phase 1a Item 0: `tests/preview-harness/corpus.test.ts` expanded to run both Corpus 1 and Corpus 2
- Phase 1a Item 0: `tests/preview-harness/out/corpus2/` — JSON results and summary for Corpus 2 (9/10 clean pass)
- Phase 1a Item 0: `docs/BASELINE.md` updated with Corpus 2 benchmark table
- Phase 0: Forked OnelightCyber/XWinCode (GPL-3.0-or-later)
- Phase 0: `tests/corpus/` — 10 SwiftUI student-style apps (01–10)
- Phase 0: `docs/NOTES.md` — build verification and repo audit
- Phase 0: `scripts/preview-baseline.ps1` — interactive baseline runner
- Phase 0: `WINXCODE_PLAN.md` — full implementation plan
- Phase 0b: `tests/preview-harness/corpus.test.ts` — automated headless test harness for preview interpreter
- Phase 0b: `tests/preview-harness/out/` — JSON view tree and diagnostic dumps for all 10 corpus apps
- Phase 0b: `docs/BASELINE.md` rewritten with measured parse/evaluate results, fix sizes, and @Observable resolution
