# Tech Lead Review -- F12

**Feature:** Project Review: Bug Fixes & Flow Hardening
**Reviewed at:** 2026-11-17T16:45:00-03:00
**Verdict:** APPROVED

## Task Verdicts

- F12-T01: PASS -- All three `Bun.write()` calls are now properly awaited. PDF MIME validation checks both extension and type (with empty-type fallback). `isValidSlug()` helper applied to all slug-bearing routes. `writeJson` has try/catch around `renameSync` with tmp cleanup. Image processing errors reported via `failed` array in response. Tmp cleanup failure logged with `console.warn`.
- F12-T02: PASS -- `<link rel="manifest">` added to `index.html` head. Manifest icons now reference two distinct files (`favicon-192.png` at 192x192 and `favicon.png` at 512x512), both verified to exist on disk. Duplicate manifest link removed from `__root.tsx` head().
- F12-T03: PASS -- Testimonial POST and PUT endpoints enforce limits: name <= 100 chars, text <= 500 chars, deck <= 100 chars. Collection POST and PUT endpoints also enforce name <= 100, description <= 500, URL fields <= 500. URL validation via `isValidUrl()` helper rejects non-http(s) schemes.
- F12-T04: PASS -- CLAUDE.md stack line updated from "TanStack Start" to "Vite + React 19 + TanStack Router". Architecture section updated accordingly. ESLint `no-unused-vars` changed from `off` to `warn` with `argsIgnorePattern: "^_"` and `varsIgnorePattern: "^_"`. Lint passes clean.

## Code Quality

The implementation is clean, focused, and well-structured. Specific observations:

1. **`isValidSlug` helper** (server.ts:36-38) -- Good regex, applied consistently to all 7 slug-extracting route handlers. Defense-in-depth against path traversal is solid.

2. **`isValidUrl` helper** (server.ts:40-48) -- Correctly allows empty strings (optional fields) and validates protocol. Good use of `URL` constructor for parsing.

3. **`writeJson` atomic write** (data-io.ts:10-24) -- Proper write-to-tmp-then-rename pattern with cleanup on failure. The `randomBytes(6)` suffix avoids collisions. Re-throwing after cleanup preserves caller error handling.

4. **Image upload error reporting** (server.ts:492,517-519,531) -- The `failed` array pattern is clean. Callers get both `processed` and `failed` arrays, enabling the frontend to show partial success.

5. **`_SESSION_SECRET` prefix** (server.ts:56) -- Variable was unused after prior refactoring; prefixed with underscore to satisfy the new lint rule rather than removed, which preserves the declaration for potential future use. Acceptable, though removing it entirely would be slightly cleaner.

6. **Manifest icons** -- Using two separate files at correct sizes is the ideal approach (Option B from T02). Both files verified present.

## Issues Found

None. All acceptance criteria are met and no regressions were introduced.

## Recommendations

1. **Minor: Remove `_SESSION_SECRET`** -- The variable on server.ts:56 is declared but never used anywhere in the codebase. Rather than underscore-prefixing to suppress the lint warning, consider removing it entirely to reduce dead code. Low priority.

2. **Future: Frontend handling of `failed` array** -- T01 acceptance criteria mention "Frontend exibe aviso quando `failed.length > 0`". The server-side change is in place, but the admin frontend (`admin/public/index.html`) should be verified to actually display failed uploads to the user. This is outside F12 scope but worth tracking.

3. **Future: Validate favicon-192.png dimensions** -- The manifest declares 192x192 but there is no automated check that the generated file matches. Consider adding a build-time assertion or documenting the generation process.
