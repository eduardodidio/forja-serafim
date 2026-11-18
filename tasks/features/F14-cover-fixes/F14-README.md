# Feature F14 — Fix cover upload and structural persistence bugs

**Status:** planned
**Owner:** @eduardodidio
**PRD:** N/A (bugfix feature)

## Goal

Fix three cover-related bugs: (1) covers bypass sharp processing causing format/rendering issues on first upload, (2) cache-bust query strings leak into committed collections.json, and (3) no loading feedback during cover upload in the admin UI.

## Architecture impact

- **admin/src/lib/image-processor.ts** — new `processCoverImage()` export (no watermark, wider resize)
- **admin/src/server.ts** — cover upload endpoint uses sharp; GET /api/collections injects serve-time cache-bust; cover upload stops persisting `?v=` in JSON
- **admin/public/index.html** — loading spinner on cover preview during upload
- **src/data/collections.json** — sanitised (clean paths only, no query strings)

## Governance (Saruman G-20261118-001)

1. Cover processing must NOT add watermark
2. Cache-bust must NOT be persisted in collections.json
3. Existing covers must still work (backwards-compatible paths)

## Waves

- **Wave 0**: F14-T01 (backend: processCoverImage in image-processor.ts)
- **Wave 1**: F14-T02, F14-T03 (backend: server.ts cover endpoint + GET cache-bust, frontend: upload spinner)
- **Wave 2**: F14-T04 (data: sanitise existing collections.json)

## Global acceptance criteria

- [ ] Cover upload converts any image format to proper JPEG via sharp
- [ ] No watermark on covers
- [ ] collections.json never contains `?v=` query strings
- [ ] GET /api/collections returns image URLs with `?v=<mtime>` for cache-busting
- [ ] Admin UI shows loading state during cover upload
- [ ] Existing covers continue to render correctly
- [ ] `bun run build` succeeds
- [ ] All tasks implemented and tested

## Diagrams

- N/A (bugfix, no new architecture or user journeys)
