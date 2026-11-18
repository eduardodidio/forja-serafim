# Readiness Report — F14 cover-fixes

**Generated:** 2026-11-18T00:00:00Z
**Feature dir:** tasks/features/F14-cover-fixes/
**Total tasks audited:** 4
**Total ACs declared:** 8

## Check 1 — AC coverage (every AC has >= 1 task)

Note: The README uses checkbox-style ACs rather than numbered AC IDs.
Each checkbox item is labelled AC-A through AC-H for traceability.

| AC ID | AC description | Status | Tasks covering | Detail |
| ----- | -------------- | ------ | -------------- | ------ |
| AC-A | Cover upload converts any image format to proper JPEG via sharp | PASS | T01, T02 | |
| AC-B | No watermark on covers | PASS | T01 | |
| AC-C | collections.json never contains `?v=` query strings | PASS | T02, T04 | |
| AC-D | GET /api/collections returns image URLs with `?v=<mtime>` | PASS | T02 | |
| AC-E | Admin UI shows loading state during cover upload | PASS | T03 | |
| AC-F | Existing covers continue to render correctly | PASS | T02 | |
| AC-G | `bun run build` succeeds | PASS | T04 | |
| AC-H | All tasks implemented and tested | PASS | T01, T02, T03, T04 | Meta AC — satisfied by completion of all tasks |

## Check 2 — Bidirectional traceability (every task cites >= 1 AC)

Note: Task files use "Acceptance criteria" sections with checkboxes
rather than "Maps to AC:" fields. Each task's AC section is non-empty
and maps to one or more global ACs.

| Task | Status | ACs cited | Detail |
| ---- | ------ | --------- | ------ |
| T01 | PASS | AC-A, AC-B | 6 local ACs covering JPEG conversion, no watermark |
| T02 | PASS | AC-A, AC-C, AC-D, AC-F | 7 local ACs covering sharp processing, clean JSON, serve-time cache-bust |
| T03 | PASS | AC-E | 5 local ACs covering spinner overlay and cleanup |
| T04 | PASS | AC-C, AC-G | 4 local ACs covering JSON sanitisation and build verification |

## Check 3 — File collision (same-Wave tasks don't share files)

| Wave | Status | Colliding paths | Tasks involved |
| ---- | ------ | --------------- | -------------- |
| 0 | PASS | (none) | T01 only |
| 1 | PASS | (none) | T02: admin/src/server.ts; T03: admin/public/index.html |
| 2 | PASS | (none) | T04 only |

## Check 4 — Wave 0 completeness (deps/perms/scaffolding)

| Item needed by Wave >= 1 | Status | Wave 0 covers? | Detail |
| ------------------------ | ------ | -------------- | ------ |
| `processCoverImage` export from image-processor.ts | PASS | Yes — T01 (Wave 0) | T02 imports this function |
| `.tmp-upload` directory under COVERS_DIR | PASS | N/A | Created inline by T02 with `mkdirSync({ recursive: true })` |

No missing Wave 0 prerequisites found. All dependencies that Wave >= 1 tasks
require are either created in Wave 0 or handled inline.

## Check 5 — Testing section non-empty

| Task | Status | Detail |
| ---- | ------ | ------ |
| T01 | PASS | 4 manual tests + 4 test scenarios (happy, edge, error) |
| T02 | PASS | 5 manual tests + 5 test scenarios (happy, edge, error) |
| T03 | PASS | 4 manual tests + 3 test scenarios (happy, error, edge) |
| T04 | PASS | 3 manual tests + 4 test scenarios (happy, edge, boundary) |

## Summary

- PASS: 5
- FAIL: 0

**Verdict:** READY
