# QA Report -- F12

**Feature:** Project Review: Bug Fixes & Flow Hardening
**Validated at:** 2026-11-17T17:30:00-03:00
**Verdict:** PASS

## Build & Lint

- Build: PASS -- `bun run build` completes in ~400ms, produces `dist/index.html` + assets with no errors.
- Lint: PASS -- `bun run lint` exits 0 with zero errors and zero warnings.

## Task Validation

### F12-T01: PASS -- Server Hardening

All six items from the task spec are confirmed in the code:

1. **Bun.write awaited** -- All three `Bun.write()` calls in `admin/src/server.ts` are properly `await`ed (lines 367, 387, 511). This eliminates the race condition where `processImage` could read a file before it was fully written to disk.

2. **PDF MIME validation** -- Line 379-382: validates both file extension (`.pdf`) AND MIME type (`application/pdf`), with empty-string MIME accepted as a fallback for browsers that omit it. Returns 400 with "Arquivo deve ser PDF." on mismatch.

3. **Slug sanitization** -- `isValidSlug()` helper (line 36-38) uses regex `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` and is applied at all 7 slug-extracting route handlers: collection CRUD (line 309), cover upload (line 354), manual upload (line 375), reorder (line 403), image delete (line 430), and image upload (line 463). Path traversal attempts like `../../../etc/passwd` or slugs with special characters are rejected with 400.

4. **writeJson atomic write with cleanup** -- `data-io.ts` lines 10-24: writes to a tmp file with random hex suffix, then `renameSync`. On rename failure, the tmp file is cleaned up via `unlinkSync` in a try/catch, and the error is re-thrown.

5. **Image processing error reporting** -- Line 492 declares `failed` array. Lines 517-519 catch `processImage` errors and push `{ file, error }` entries. Line 531 returns both `processed` and `failed` arrays in the response.

6. **Cleanup failure logging** -- Line 528: `console.warn("[Upload] Failed to cleanup tmp dir:", err)` -- no longer silent.

### F12-T02: PASS -- PWA Manifest & Icons

1. **Manifest link in index.html** -- Line 19 of `index.html`: `<link rel="manifest" href="/manifest.json" />`. Confirmed also present in built `dist/index.html` (line 19).

2. **Icon sizes corrected** -- `manifest.json` declares two distinct files: `favicon-192.png` at 192x192 and `favicon.png` at 512x512. Both files verified to exist on disk via glob search.

3. **Duplicate manifest link removed** -- `__root.tsx` head() no longer includes a `rel: "manifest"` entry. Grep confirms zero matches for "manifest" in that file. This prevents duplicate `<link rel="manifest">` tags in the DOM.

### F12-T03: PASS -- Input Validation Hardening

Testimonial validation on POST (lines 544-549):

- `name.length > 100` returns 400
- `text.length > 500` returns 400
- `deck.length > 100` returns 400

Testimonial validation on PUT (lines 567-572): same limits applied for each field when present.

Collection validation on POST (lines 267-274):

- `name.length > 100` returns 400
- `description.length > 500` returns 400
- `moxfieldUrl.length > 500` returns 400
- `deckcheckUrl.length > 500` returns 400

Collection validation on PUT (lines 317-324): same limits applied conditionally.

URL validation via `isValidUrl()` helper (lines 40-48): rejects non-http(s) URLs, allows empty strings for optional fields. Applied to both `moxfieldUrl` and `deckcheckUrl` on POST and PUT.

### F12-T04: PASS -- Documentation & Lint

1. **CLAUDE.md updated** -- Stack line now reads "Vite + React 19 + TanStack Router + TypeScript + Tailwind CSS v4". Architecture section reads "Vite + React 19 com TanStack Router (file-based routing, client-side SPA)". No mention of "TanStack Start" or "SSR" found.

2. **eslint no-unused-vars** -- `eslint.config.js` line 36-42: rule is `["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }]`. Lint passes clean with zero warnings.

## Global Acceptance Criteria

- [x] Zero race conditions em upload de arquivos -- All 3 `Bun.write()` calls awaited.
- [x] PWA manifest discoverable pre-hydrate -- `<link rel="manifest">` in `index.html` source and built output, no duplicate from `__root.tsx`.
- [x] Input validation on all user-facing endpoints -- Slugs validated via regex, text fields have length limits, PDF has MIME check, URLs validated via `isValidUrl()`.
- [x] Error reporting to frontend -- Image processing failures reported via `failed` array in response. Cleanup failures logged with `console.warn`.
- [x] Docs reflect real stack -- CLAUDE.md updated from "TanStack Start" to "Vite + TanStack Router", no mention of SSR.

## Issues Found

None. All acceptance criteria are met. The implementation is clean and matches the specifications from each task file.

## Test Coverage Notes

1. **Manual/integration tests not executable in this environment** -- Tests TC-T02-04 (Lighthouse PWA audit), TC-T02-05 (PWA install prompt on mobile), IT-01 through IT-05 (full admin flow with live server) require a running server and browser. These are deferred to manual testing by the developer.

2. **P2 test cases** -- TC-T03-03 (1-char testimonial text accepted) and TC-T01-16 (cleanup failure logging) are verified via code review but not runtime-tested. The code paths are straightforward.

3. **Existing slug validation** -- The regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` correctly matches all existing collection slugs (castlevania, cavaleiros-do-zodiaco, final-fantasy-vii). No regression risk.

4. **Frontend handling of `failed` array** -- As noted by the Tech Lead, the admin frontend (`admin/public/index.html`) should display failed uploads to the user. This is outside F12 scope but worth verifying in a future feature.

5. **`_SESSION_SECRET` variable** -- Declared but unused (line 56 of server.ts), prefixed with underscore to suppress lint. Tech Lead recommends removing entirely in a future cleanup.
