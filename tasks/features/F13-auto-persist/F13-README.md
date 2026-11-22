# F13 — Auto-persist Admin Changes to Git

**Status:** planned
**Created:** 2026-11-17
**Decision:** D-20261117-001 (Gandalf: executed, Saruman: agree)

## Problem

Admin mutations (image uploads, collection edits, testimonial CRUD, settings changes) are saved to the Render ephemeral filesystem but NOT committed to git. When Render restarts or redeploys, all uncommitted changes are lost. The user has no visual indication of unsaved state.

## Solution

1. **Auto-persist**: After every mutation endpoint, automatically `git add + commit + push` the affected data files via a shared `gitPersist()` helper with a serial queue.
2. **Dirty-state banner**: A persistent UI banner in the admin showing whether changes are saved to git or pending.

## Architecture

- `gitPersist()` — async helper with serial queue (no concurrent git ops)
- Stages: `src/data/*.json`, `public/images/covers/`, `public/images/decks/`, `public/manuals/`
- Commits: `"Auto-save: <description>"`
- Pushes async — does not block HTTP response
- Tracks state: `clean | dirty | pushing | error`
- `/api/persist-status` — endpoint for UI to query state
- Banner: sticky bar below header, non-dismissable until push succeeds

## Mutation Endpoints Covered (12)

1. `POST /api/collections` — Create collection
2. `PUT /api/collections/:slug` — Edit collection
3. `DELETE /api/collections/:slug` — Delete collection
4. `POST /api/collections/:slug/cover` — Upload cover
5. `POST /api/collections/:slug/manual` — Upload manual PDF
6. `PUT /api/collections/:slug/images/reorder` — Reorder sample images
7. `DELETE /api/collections/:slug/images/:filename` — Delete sample image
8. `POST /api/collections/:slug/images` — Upload deck images
9. `POST /api/testimonials` — Create testimonial
10. `PUT /api/testimonials/:idx` — Edit testimonial
11. `DELETE /api/testimonials/:idx` — Delete testimonial
12. `PUT /api/settings` — Update settings

## Governance Conditions (Saruman G-20261117-001)

1. gitPersist must use a serial queue (no concurrent git operations)
2. Push failures must show user-visible error with retry option
3. Banner must not be dismissable until push succeeds

## Tasks

| Task    | Wave | Description                                         |
| ------- | ---- | --------------------------------------------------- |
| F13-T01 | 0    | Create gitPersist() helper with serial queue        |
| F13-T02 | 1    | Integrate gitPersist into all 12 mutation endpoints |
| F13-T03 | 1    | Add /api/persist-status endpoint + state tracking   |
| F13-T04 | 2    | Add dirty-state banner UI to admin panel            |
| F13-T05 | 2    | Refactor publish to reuse gitPersist (deduplicate)  |

## Waves

- **Wave 0** (1 task): Foundation — git helper
- **Wave 1** (2 tasks, parallel): Backend integration — endpoints + status API
- **Wave 2** (2 tasks, parallel): Frontend + publish refactor
