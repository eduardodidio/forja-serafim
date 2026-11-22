# Readiness Report — F16 cover-bug

**Generated:** 2026-11-18T00:00:00Z
**Feature dir:** tasks/features/F16-cover-bug/
**Total tasks audited:** 4
**Total ACs declared:** 0

## Check 1 — AC coverage

**Result: PASS**

Bugfix — no formal ACs declared. The README describes the bug, hypotheses,
and relevant files. Each task has clear investigation goals or fix criteria
that serve as implicit acceptance conditions.

## Check 2 — Bidirectional traceability

**Result: PASS**

No tasks contain `**Maps to AC:**` fields. This is expected — bugfix with
no AC system. Each task clearly states its purpose and dependencies:

| Task    | Maps to AC | Note                                       |
| ------- | ---------- | ------------------------------------------ |
| F16-T01 | n/a        | Diagnostic — slug-image mapping            |
| F16-T02 | n/a        | Diagnostic — upload pipeline + git-persist |
| F16-T03 | n/a        | Fix — cause-root correction + cache-bust   |
| F16-T04 | n/a        | Validation — local dev + preview           |

## Check 3 — File collision

**Result: PASS**

| Wave | Tasks    | Overlap? | Detail                                                                                                                                                                                                                              |
| ---- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W1   | T01, T02 | No       | T01 investigates data layer (`collections.json`, bundle, front-end components). T02 investigates admin pipeline (`server.ts` endpoints, `git-persist.ts`, admin UI). Both are read-only diagnostic tasks — no file writes expected. |
| W2   | T03      | n/a      | Single task in wave.                                                                                                                                                                                                                |
| W3   | T04      | n/a      | Single task in wave.                                                                                                                                                                                                                |

No file collisions detected.

## Check 4 — Wave 0 completeness

**Result: PASS**

No Wave 0 defined. W1 tasks are purely diagnostic (code reading and local
testing). All required files already exist in the repo:

- `src/data/collections.json` — exists
- `src/lib/store-data.ts` — exists
- `src/components/card-tile.tsx` — exists
- `admin/src/server.ts` — exists
- `admin/src/lib/git-persist.ts` — exists

No new dependencies, environment variables, or setup steps are needed
before W1 can begin.

## Check 5 — Testing section non-empty

**Result: PASS**

| Task    | Testing lines | Meets threshold (>= 3)? |
| ------- | ------------- | ----------------------- |
| F16-T01 | 4             | Yes                     |
| F16-T02 | 6             | Yes                     |
| F16-T03 | 6             | Yes                     |
| F16-T04 | 6             | Yes                     |

All tasks have substantive testing checklists.

## Summary

| Check                         | Result                                 |
| ----------------------------- | -------------------------------------- |
| 1. AC coverage                | PASS (bugfix — no formal ACs declared) |
| 2. Bidirectional traceability | PASS (bugfix — no AC system)           |
| 3. File collision             | PASS                                   |
| 4. Wave 0 completeness        | PASS                                   |
| 5. Testing section non-empty  | PASS                                   |

All 5 checks passed. The feature is well-structured with clear diagnostic
tasks in W1, a fix task in W2 that depends on W1 findings, and validation
in W3. No blockers identified.

**Verdict:** READY
