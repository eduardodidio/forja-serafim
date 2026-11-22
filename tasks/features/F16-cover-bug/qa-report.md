# QA Report -- F16 cover-bug

**Tested:** 2026-11-18
**Verdict:** PASSED

## Test Results

### TC-01: JSON data integrity

**Result: PASS**

- `src/data/collections.json` has correct slug-to-image mapping for all 3 collections:
  - `castlevania` -> `/images/covers/castlevania.jpg`
  - `cavaleiros-do-zodiaco` -> `/images/covers/cavaleiros-do-zodiaco.jpg`
  - `final-fantasy-vii` -> `/images/covers/final-fantasy-vii.jpg`
- No cross-contamination between slugs.
- Zero `?v=` query strings in persisted JSON data (confirmed via grep).

### TC-02: Bundle correctness

**Result: PASS**

- `bun run build` exits 0, produces `dist/assets/index-BntWPToE.js` (383.81 kB).
- Bundle contains correct image path references: `castlevania.jpg` (2 occurrences -- cover + sampleImages fallback), `cavaleiros-do-zodiaco.jpg` (1), `final-fantasy-vii.jpg` (1).
- Build timestamp `1795024976537` is baked into the bundle as a string constant.
- Minified `cacheBust` function present: appends `?v=<timestamp>` or `&v=<timestamp>` depending on existing query params.

### TC-03: Cover upload endpoint (code review)

**Result: PASS (code review only -- admin server not started)**

- Admin server endpoint at `POST /api/collections/:slug/cover` writes image to disk and updates JSON with clean path (no `?v=`).
- Cache-bust is injected at serve-time in GET `/api/collections`, not persisted.

### TC-04: git-persist (code review)

**Result: N/A (no git-persist changes in F16)**

- F16 did not modify git-persist. Pipeline is unchanged from F13.

### TC-05: Cache-bust on front-end

**Result: PASS**

- `src/lib/cache-bust.ts` implements `cacheBust(url)`:
  - Returns URL unchanged if empty string or no `BUILD_TS`.
  - Appends `?v=<timestamp>` for URLs without query params.
  - Appends `&v=<timestamp>` for URLs with existing query params.
- `vite.config.ts` defines `VITE_BUILD_TS` via `JSON.stringify(String(Date.now()))` -- evaluated at build time, so each build gets a fresh timestamp.
- Confirmed in bundle: timestamp `1795024976537` is used as the cache-bust value.

### TC-06: Site pages show correct covers

**Result: PASS (code review)**

- `colecoes.$slug.tsx` line 77: `src={cacheBust(collection.image)}` -- hero cover image uses cacheBust.
- `colecoes.$slug.tsx` line 60: `bustedSampleImages = collection.sampleImages.map(cacheBust)` -- all sample images use cacheBust.
- `card-tile.tsx` line 52: `src={cacheBust(images[displayIdx])}` -- card flip images use cacheBust.
- Lightbox component receives already-busted URLs (`bustedSampleImages` passed at line 102).

### TC-07: Regression -- no missed image paths

**Result: PASS**

- Grep for all `src=` attributes in `*.tsx` files shows:
  - All mutable collection images (cover, sampleImages) go through `cacheBust`.
  - Static assets (hero image, logo) are either Vite-imported (content-hashed) or hardcoded paths not managed by admin. No cache-bust needed.
  - SEO metadata (`og:image`, `twitter:image`, JSON-LD) intentionally uses clean URLs without cache-bust -- correct for social crawlers.

### Lint

**Result: PASS**

- `eslint` on the 4 changed files (`cache-bust.ts`, `card-tile.tsx`, `colecoes.$slug.tsx`, `vite.config.ts`) returns zero errors.
- Pre-existing lint issues in `admin/` are unrelated to F16.

## Coverage Gaps

1. **No automated tests** -- The `cacheBust` function has no unit tests. Edge cases (empty string, URL with existing `?`, null/undefined) are handled in code but not verified by a test suite. This is acceptable for the current project scope but would be a risk if the function evolves.

2. **Browser-level validation not performed** -- TC-05 and TC-06 were validated via code review and bundle inspection, not by actually loading the site in a browser and inspecting the DOM. The build output confirms correctness but does not test runtime rendering.

3. **Admin upload end-to-end not tested** -- TC-03 and TC-04 were validated via code review. The admin server was not started for a live upload test. This is acceptable because F16 did not change any admin code.

## Retrospective Notes

- The fix is minimal and well-scoped: 1 new utility file, 2 modified components, 1 config change.
- The `cacheBust` function correctly handles the edge case of URLs with existing query parameters (uses `&` instead of `?`).
- The `VITE_BUILD_TS` define approach is clean -- each `bun run build` produces a fresh timestamp, ensuring cache-bust values change per deploy.
- No files were missed: all mutable image rendering paths in `src/` apply `cacheBust`.
