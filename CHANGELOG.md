# Changelog

All notable changes will be documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

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
