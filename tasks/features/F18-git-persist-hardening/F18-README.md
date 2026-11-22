# F18 — Git-Persist Hardening (Tokens & Geral)

**Status:** planned
**Created:** 2026-11-22
**Slug:** git-persist-hardening

## Context

During token upload for Castlevania on Render, the git-persist auto-save
failed silently — the commit/push never reached GitHub. As a result:

- `collections.json` on GitHub still has `"tokens": []` for all collections
- `public/images/tokens/` is empty in the repo
- The Anderson will need to re-upload tokens after the fix

Root cause analysis points to the git-persist push phase failing on Render
(likely detached HEAD race, auth token issue, or rebase conflict when F17
was pushed while admin was running). The error was shown in the UI banner
but the data was lost on next redeploy.

## Goal

1. Make git-persist more resilient: retry with backoff on transient failures
2. Add structured logging so failures are diagnosable from Render logs
3. Ensure token uploads are covered end-to-end by git-persist
4. Verify the full token pipeline works in production after deploy

## Tasks

| Task | Wave | Description                                                            |
| ---- | ---- | ---------------------------------------------------------------------- |
| T01  | W1   | Add retry with exponential backoff to git push                         |
| T02  | W1   | Add structured logging to git-persist                                  |
| T03  | W2   | Add persist-status endpoint improvements (history + last error detail) |
| T04  | W3   | End-to-end verification and deploy checklist                           |

## Waves

- **Wave 1:** T01, T02 (parallel — independent changes in git-persist)
- **Wave 2:** T03 (depends on T01/T02 for error format)
- **Wave 3:** T04 (manual verification after deploy)

## Diagrams

- Architecture: `docs/diagrams/F18-architecture.mmd`
- Journey: `docs/diagrams/F18-journey.mmd`
