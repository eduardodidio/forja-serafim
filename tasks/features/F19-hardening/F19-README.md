# F19 — Hardening: JSON validation, git-merge safety, API error handling

**Status:** done
**Priority:** CRITICAL (active production incident)
**Decision:** D-20261123-001

## Problem

Production `collections.json` corrupted by git merge conflict markers during `fetchAndRebase()`. All admin API endpoints return 500. Anderson locked out.

## Task Table

| Task    | Title                                          | Wave | Files                                 |
| ------- | ---------------------------------------------- | ---- | ------------------------------------- |
| F19-T01 | Fix fetchAndRebase conflict detection + backup | 0    | admin/src/lib/git-persist.ts          |
| F19-T02 | Add JSON validation to readJson/writeJson      | 0    | admin/src/lib/data-io.ts              |
| F19-T03 | Harden vite sitemap plugin                     | 0    | vite.config.ts                        |
| F19-T04 | Wrap API handlers with try/catch               | 1    | admin/src/server.ts                   |
| F19-T05 | Startup data migration + self-heal             | 2    | admin/src/server.ts                   |
| F19-T06 | Smoke tests                                    | 3    | admin/src/**tests**/hardening.test.ts |

## Wave Assignments

- **Wave 0** (hotfix — unblocks production): T01, T02, T03 (parallel)
- **Wave 1** (API hardening): T04 (depends on T02)
- **Wave 2** (startup self-heal): T05 (depends on T02, T04)
- **Wave 3** (prevention): T06 (depends on T01-T05)

## Global Acceptance Criteria

1. `bun run build` succeeds even when `collections.json` is malformed
2. All `/api/*` endpoints return structured JSON errors (never crash)
3. `fetchAndRebase()` detects merge conflicts and restores from backup
4. `readJson()` validates JSON and detects conflict markers
5. Server startup auto-heals corrupted JSON and migrates missing `tokens` field
6. Smoke tests cover all hardening scenarios
