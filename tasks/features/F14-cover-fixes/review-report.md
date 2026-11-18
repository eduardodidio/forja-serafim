# F14 — Tech Lead Review Report

**Feature:** F14 — Fix cover upload and structural persistence bugs
**Reviewer:** TechLead agent
**Date:** 2026-11-18
**Build:** `bun run build` passes

---

## T01: processCoverImage() in image-processor.ts

**File:** `admin/src/lib/image-processor.ts`

### Architecture
Correct placement alongside `processImage()`. Constants `COVER_MAX_WIDTH` (1200) and `COVER_QUALITY` (85) are well-named and properly scoped at module level. Function follows the same pattern as `processImage()` without the watermark composite step.

### Code quality
Clean, minimal, correct. No dead code. Existing `processImage()` is untouched.

### Governance check
- No watermark: PASS (no `composite()` or `createWatermarkSvg()` call)
- 1200px max width: PASS
- Quality 85: PASS

### Findings
None.

---

## T02: Cover upload endpoint + GET cache-bust injection in server.ts

**File:** `admin/src/server.ts`

### Architecture
Four changes all in the right places:
1. Import of `processCoverImage` -- correct
2. `PUBLIC_DIR` moved to top-level scope (line 24) -- correct, was previously buried in static file serving
3. Cover upload uses sharp via tmp-file pattern -- correct, mirrors the deck image upload pattern
4. GET /api/collections injects serve-time `?v=<mtime>` -- correct, reads from disk and decorates in-memory only

### Code quality
- The tmp-file + finally cleanup pattern is consistent with the deck image upload code
- Dynamic `import("fs")` for `rmdirSync` on line 405-406 is unnecessary since `fs` is already imported at line 1 (statically). This is copied from the deck upload code which has the same pattern. Not a bug, just redundant.

### Governance check
- Cache-bust NOT persisted: PASS (line 414 writes clean path `/images/covers/${slug}.jpg`)
- GET cache-bust is serve-time only: PASS (line 265-280 decorates in-memory copy)
- Existing covers backwards-compatible: PASS (paths unchanged, just processing added)

### Findings

1. **IMPORTANT — No error response on sharp failure.** If `processCoverImage()` throws (e.g., corrupt image), the `finally` block cleans up tmp files, but then execution continues to line 410-421 where `statSync(dest)` will throw if the destination file was never created. The endpoint has no outer try/catch, so Bun's default 500 handler kicks in. The response will be an opaque 500 without a JSON body, which the admin UI cannot parse gracefully. The deck image upload (line 570-575) handles this with a per-file try/catch and reports failures in the response. Recommend wrapping lines 400-421 in a try/catch that returns `json({ error: "Falha ao processar imagem." }, 500, req)`.

2. **MINOR — Redundant dynamic import of fs.** Line 405-406 uses `const { rmdirSync } = await import("fs")` but `fs` functions are already statically imported at line 1. Could just use `rmdirSync` directly after adding it to the static import. This is cosmetic and copied from existing code.

---

## T03: Loading spinner on cover upload in admin UI

**File:** `admin/public/index.html`

### Architecture
CSS-only overlay + JS spinner element. Correct approach for a vanilla HTML admin panel.

### Code quality
- `cover-loading` class adds dark overlay via `::after` pseudo-element
- `cover-spinner` is a real DOM element positioned above the overlay with `z-index: 10`
- Cleanup is in a `finally` block, handling both success and error paths
- `spinner.parentNode` check prevents errors if the DOM was re-rendered during async operation
- Input is disabled during upload to prevent double-submissions

### Findings

3. **MINOR — Stale reference after loadCollections().** After `loadCollections()` on line 1918, the `preview` variable captured at line 1891 may reference a DOM element that was replaced during re-render. The `finally` block at line 1930-1932 operates on the old `preview` reference. This is harmless (removing classes/children from a detached element is a no-op) but means the spinner removal in the finally block is effectively dead code on the success path. Not a bug since `loadCollections()` re-renders the UI cleanly.

---

## T04: Startup sanitiser strips stale ?v= from collections.json

**File:** `admin/src/server.ts` (lines 786-802)

### Architecture
One-time cleanup block at server startup, placed after git config and before `Bun.serve`. Correct location and approach.

### Code quality
- Uses block scope `{}` to avoid polluting module scope -- good practice
- Handles both `image` and `sampleImages` fields defensively
- `JSON.stringify` comparison for arrays is acceptable for small arrays
- Only writes if dirty -- avoids unnecessary disk I/O and git noise
- Logs when sanitisation occurs

### Governance check
- collections.json currently clean: PASS (verified, no `?v=` found)
- Sanitiser handles legacy data: PASS (strips any `?v=` on startup)

### Findings
None.

---

## Cross-task consistency

- T01 creates `processCoverImage()`, T02 consumes it -- consistent
- T02 ensures clean paths in JSON, T04 sanitises any legacy data -- complementary
- T03 frontend expects the same API response shape that T02 produces -- consistent
- No conflicts between Wave 1 tasks (T02 backend, T03 frontend)

---

## collections.json verification

Confirmed clean:
- No `?v=` query strings in any `image` or `sampleImages` field
- All three collections (castlevania, cavaleiros-do-zodiaco, final-fantasy-vii) have clean paths

---

## Summary of findings

| # | Severity | Task | Description |
|---|----------|------|-------------|
| 1 | IMPORTANT | T02 | No try/catch around sharp processing + response; corrupt image causes opaque 500 |
| 2 | MINOR | T02 | Redundant dynamic import of fs (rmdirSync) |
| 3 | MINOR | T03 | Stale DOM reference after loadCollections() (harmless) |

---

## Verdict: APPROVED

Finding #1 is IMPORTANT but not BLOCKING: the failure mode is a 500 error (acceptable for an admin-only endpoint) rather than data corruption or a security issue. The user sees an error (albeit not a friendly JSON one). Recommend addressing it as a follow-up.

No BLOCKING issues found. All governance conditions are met. Build passes. Code is consistent across tasks.

---

## Retrospective Seeds

- **Pattern:** Cover/image upload endpoints lack explicit try/catch with JSON error responses when sharp processing fails
- **Role(s) affected:** developer, architect
- **Lesson:** When adding image processing to upload endpoints, always wrap the processing call in a try/catch that returns a structured JSON error response (not just relying on framework default 500). Include this in task acceptance criteria for any future image processing tasks.

- **Pattern:** Dynamic imports of already-statically-imported modules get copy-pasted between similar code blocks
- **Role(s) affected:** developer
- **Lesson:** When copying patterns from existing code, check whether dynamic imports are actually needed or if the module is already available in scope. Add the function to the static import instead.
