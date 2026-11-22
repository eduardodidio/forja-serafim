# F17 — Tech Lead Review

**Reviewer:** Tech Lead Agent
**Date:** 2026-11-19
**Verdict:** APPROVED_WITH_NOTES

---

## Summary

The tokens feature is well-implemented and closely follows the plan. The data model is clean, endpoints mirror the existing sampleImages pattern, the admin UI provides full CRUD with optimistic updates, and the landing page modal is polished. The build passes with zero errors. There are two bugs (one critical, one moderate) and a few minor notes.

---

## 1. Architecture (PASS)

The implementation matches the plan precisely:

- Token type added to `store-data.ts` (line 5-9) with `image`, `name`, `quantity`.
- Three new endpoints in `server.ts`: POST upload (line 629), PUT reorder (line 725), DELETE (line 753).
- Token images stored under `public/images/tokens/{slug}/` via `TOKENS_DIR` constant in `paths.ts` (line 13).
- Watermark reuses existing `processImage()` from `image-processor.ts` -- no duplication.
- `git-persist.ts` `FILES_TO_ADD` includes `public/images/tokens/` (line 71).
- Static file serving recognizes `/images/tokens/` as mutable asset (server.ts line 944).
- Tokens are cleanly separated from sampleImages throughout.

## 2. Code Quality (PASS with notes)

Endpoints follow the established patterns of the existing code (cover upload, image upload, image delete, image reorder). The admin UI JavaScript mirrors the sampleImages section structure. The `TokensModal` React component is clean, uses `Card3DTilt` for consistency, and handles Escape key + scroll lock correctly.

## 3. Security (PASS)

- **Path traversal:** Properly blocked in delete endpoint (server.ts line 759).
- **Slug validation:** `isValidSlug()` called on all token endpoints.
- **File type validation:** Only JPEG/PNG/WebP accepted (line 667-677).
- **Input validation:** Quantities validated as positive integers (line 661-664), names/quantities array length checked against files length (line 653-658).
- **Image protection:** Right-click disabled, pointer-events:none, draggable=false in `tokens-modal.tsx` (lines 77-83).

## 4. Data Model (PASS)

Token type is consistent across frontend (`src/lib/store-data.ts` line 5-9), backend (`admin/src/server.ts` line 111-115), and data file (`src/data/collections.json` -- all collections have `tokens: []`). Backward compatibility guard exists on upload (server.ts line 683: `if (!col.tokens) col.tokens = []`). Startup cleanup sanitizes query strings from token image paths (server.ts lines 1028-1035).

## 5. UI Consistency (PASS)

- Admin tokens section matches sampleImages section: same grid layout, upload zone, numbering badges, move up/down/delete controls.
- Landing page button uses gold accent color (`oklch(0.75_0.09_82)`) with `Coins` icon from lucide -- consistent with site theme.
- Modal uses dark background, gold title, `Card3DTilt` cards with quantity badges.

## 6. Git Persist (PASS)

All three mutation endpoints trigger `gitPersist()`:

- Upload: line 720
- Reorder: line 748
- Delete: line 782

The `FILES_TO_ADD` array in `git-persist.ts` includes `public/images/tokens/` (line 71).

## 7. Build (PASS)

`bun run build` succeeds with no errors or warnings.

---

## Issues Found

### CRITICAL: PUT /api/collections/:slug does not persist token updates

**File:** `admin/src/server.ts`, lines 347-373
**Impact:** When the admin changes a token's quantity in the edit modal, the `updateTokenQuantity()` function (admin/public/index.html line 2055) sends `{ tokens: c.tokens }` via `PUT /api/collections/:slug`. However, that endpoint only handles `body.sampleImages` (line 370) and does NOT check for `body.tokens`. The quantity change is lost on next page reload.

**Fix:** Add `if (body.tokens !== undefined) col.tokens = body.tokens;` after line 370 in the PUT handler. Optionally validate the token objects (image paths exist, quantities are positive integers).

### MODERATE: Admin GET /api/collections missing cache-bust for token images

**File:** `admin/src/server.ts`, lines 269-287
**Impact:** The GET endpoint applies mtime-based cache-bust to `col.image` and each `col.sampleImages` entry, but does NOT apply it to `col.tokens[].image`. After uploading a new token, the admin panel may show a stale cached image until a hard refresh.

**Fix:** Add a loop after the sampleImages cache-bust (around line 285) that applies the same pattern to `col.tokens`:

```ts
if (col.tokens) {
  col.tokens = col.tokens.map((t) => {
    const tokenPath = join(PUBLIC_DIR, t.image.replace(/^\//, ""));
    if (existsSync(tokenPath)) {
      const mtime = statSync(tokenPath).mtimeMs;
      return { ...t, image: `${t.image.split("?")[0]}?v=${Math.floor(mtime)}` };
    }
    return t;
  });
}
```

### MINOR: Reorder endpoint does not validate array length

**File:** `admin/src/server.ts`, lines 738-746
**Impact:** The reorder endpoint validates that each submitted token image exists in the current set, but does not verify the submitted array has the same length as the current tokens array. A malformed request could drop tokens or duplicate them.

**Fix:** Add a length check: `if (body.tokens.length !== (col.tokens || []).length) return json({ error: "..." }, 400, req);`

### MINOR: No length validation on token names

**File:** `admin/src/server.ts`, lines 644-658
**Impact:** Token names parsed from the JSON array have no max-length validation. Only authenticated admins can hit this endpoint, so the risk is low, but it is inconsistent with the 100/500 char limits applied elsewhere.

**Fix:** Add a check like `if (names.some(n => typeof n !== 'string' || n.length > 100)) return json({ error: "..." }, 400, req);`

### MINOR: Missing Mermaid diagrams

Per project rules, every feature must produce `docs/diagrams/F17-architecture.mmd` and `docs/diagrams/F17-journey.mmd`. These files do not exist yet.

---

## Conclusion

The feature is well-structured and closely follows existing patterns. The critical bug (token quantity updates not persisted) must be fixed before shipping. The moderate cache-bust issue should also be addressed. The minor items are recommended improvements but not blockers.

**Verdict: APPROVED_WITH_NOTES** -- ship after fixing the critical and moderate issues listed above.
