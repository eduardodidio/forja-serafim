# F20 — Admin Resilience: Debounced Persist, Stale State Fix, 502 Retry, Landing Page Copy Fix

**Status:** done
**Priority:** HIGH
**Brief:** `tasks/features/F20-_tmp-brief.md`

## Problem

Anderson experiences 502 errors, stale UI state, and missing visual feedback
when editing tokens in the admin panel. Root cause: every token quantity change
fires a synchronous PUT that triggers a full git commit+push cycle (5-10s each),
overwhelming the Render free-tier 30s timeout.

## Task Table

| Task    | Title                                     | Wave | Files Modified                     |
| ------- | ----------------------------------------- | ---- | ---------------------------------- |
| F20-T01 | Debounced/coalescing gitPersist           | 0    | `admin/src/lib/git-persist.ts`     |
| F20-T02 | Use debounced persist in server mutations | 0    | `admin/src/server.ts`              |
| F20-T03 | Fix stale state after delete/re-insert    | 1    | `admin/public/index.html`          |
| F20-T04 | Debounce quantity input + retry on 502    | 1    | `admin/public/index.html`          |
| F20-T05 | Fix "Arte autoral" copy on landing page   | 0    | `src/routes/index.tsx` + SEO files |

## Wave Assignments

- **Wave 0** (server-side + landing page copy): T01, T02, T05 (parallel — different files)
- **Wave 1** (client-side UI fixes): T03, T04 (parallel — different functions in same file, non-overlapping)

## Global Acceptance Criteria

1. Rapid token quantity changes (10+ in 5 seconds) produce at most 2-3 git commits instead of 10+
2. No 502 errors during rapid editing on Render free tier
3. After delete -> re-insert of a token, the UI reflects the correct state without page refresh
4. Token quantity input debounces 500ms before firing PUT
5. A transient 502 from the server is retried once (2s delay) before showing an error toast
6. Existing create/delete operations still use immediate gitPersist (data integrity)
7. No regressions in existing admin functionality
8. Landing page "Arte autoral" block replaced with copy that reflects the real service (personalizacao + impressao, sem implicar que ha um artista desenhando)
