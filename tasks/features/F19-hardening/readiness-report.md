# F19 Readiness Report

**Date:** 2026-11-23
**Verdict:** PASS

## Checklist

| # | Check | Result | Notes |
|---|-------|--------|-------|
| 1 | Target files exist | PASS | All source files exist: `admin/src/lib/git-persist.ts`, `admin/src/lib/data-io.ts`, `admin/src/server.ts`, `vite.config.ts`, `src/data/collections.json`, `src/data/testimonials.json`, `src/data/settings.json`, `admin/src/lib/paths.ts`. T06 creates a new test file (`admin/src/__tests__/hardening.test.ts`) which is expected. |
| 2 | No file conflicts in same Wave | PASS | Wave 0: T01 (`git-persist.ts`), T02 (`data-io.ts`), T03 (`vite.config.ts`) -- all different files. Wave 1: T04 only (`server.ts`). Wave 2: T05 only (`server.ts`). Wave 3: T06 only (new test file). No two tasks in the same Wave touch the same file. |
| 3 | Dependencies are correct | PASS | T04 depends on T02 (needs `DataCorruptionError`). T05 depends on T02 + T04 (needs `validateJson` and T04's `safeHandleRequest` wrapper already in place). T06 depends on T01-T05. All correct. |
| 4 | Acceptance criteria are testable | PASS | Each AC is concrete and verifiable (TypeScript compilation, error types, HTTP status codes, file existence). |
| 5 | Dev Notes are actionable | PASS | All tasks include code snippets, exact file paths, and line references. T05 specifies startup block ordering. T01 specifies which functions to export. |
| 6 | No missing tasks | PASS | All 6 Global ACs are covered (see check 9). |
| 7 | Wave ordering makes sense | PASS | Wave 0 (hotfix, no deps) -> Wave 1 (API hardening, depends on T02) -> Wave 2 (startup self-heal, depends on T02+T04) -> Wave 3 (smoke tests, depends on all). |
| 8 | No circular dependencies | PASS | Dependency graph is a DAG: T01/T02/T03 (independent) -> T04 (depends on T02) -> T05 (depends on T02+T04) -> T06 (depends on all). |
| 9 | Global AC coverage | PASS | AC1 -> T03, AC2 -> T04, AC3 -> T01, AC4 -> T02, AC5 -> T05, AC6 -> T06. |

## Previous Issue Resolution

The prior report (verdict: BLOCKED) identified that T04 and T05 both modified `admin/src/server.ts` in Wave 1. This has been fixed:

- T04 moved to Wave 1 (sole task).
- T05 moved to Wave 2 (sole task), with explicit dependency on T04.
- T06 moved to Wave 3 (sole task).

The `server.ts` file is now touched sequentially: T04 in Wave 1, then T05 in Wave 2. No parallel conflict.

## Minor Observations (non-blocking)

- T05 uses `writeFileSync` and `copyFileSync` directly in `server.ts`, but `server.ts` currently only imports `readFileSync` from `fs`. The developer will need to add `writeFileSync` and `copyFileSync` to the existing `fs` import. The dev notes for T05 mention `copyFileSync` but not `writeFileSync` explicitly. Minor -- any developer should catch this during implementation.
- `collections.json` currently has query-string cache-bust params on some token images (castlevania collection). The existing startup sanitizer handles this. Not related to F19 but worth noting.

## Summary

F19 is **PASS**. The previously blocking file conflict (T04/T05 both in Wave 1 touching `server.ts`) has been resolved by separating them into Wave 1 and Wave 2 respectively. All 9 checklist items pass. The plan is ready for execution.
