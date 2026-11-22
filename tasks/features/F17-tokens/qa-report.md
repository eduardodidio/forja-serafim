# F17 — QA Report: Tokens

**QA Agent** | **Date:** 2026-11-19
**Verdict: PASS_WITH_NOTES**

---

## Summary

The tokens feature is fully implemented and functional. All four tasks (T01-T04) are complete. The two bugs identified during tech lead review (critical: PUT collection not persisting token updates; moderate: missing cache-bust for token images) have both been fixed. The build passes with zero errors. Diagrams and README were missing and have been created/updated by this QA pass.

---

## Checklist Results

### Functional

| #   | Check                                                                     | Status | Notes                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Token type consistent across store-data.ts, server.ts, collections.json   | PASS   | `Token { image, name, quantity }` identical in `src/lib/store-data.ts` (lines 5-9), `admin/src/server.ts` (lines 111-115); all 3 collections in `collections.json` have `"tokens": []` |
| 2   | POST endpoint creates watermarked token images                            | PASS   | server.ts lines 638-731: validates slug, file types (JPEG/PNG/WebP), quantities (positive integers), calls `processImage()`, saves to `TOKENS_DIR/{slug}/`, updates JSON               |
| 3   | DELETE endpoint removes token + physical file                             | PASS   | server.ts lines 762-793: path traversal blocked (line 768), removes from array, deletes physical file, writes JSON                                                                     |
| 4   | PUT reorder validates and reorders                                        | PASS   | server.ts lines 734-758: validates all submitted images exist in current set, replaces tokens array                                                                                    |
| 5   | PUT collection update handles tokens field                                | PASS   | server.ts line 379: `if (body.tokens !== undefined) col.tokens = body.tokens;` -- critical bug fix confirmed applied                                                                   |
| 6   | Cache-busting applied to token images in GET response                     | PASS   | server.ts lines 285-292: mtime-based cache-bust loop for `col.tokens` -- moderate bug fix confirmed applied                                                                            |
| 7   | Startup cleanup strips query strings from token image paths               | PASS   | server.ts lines 1037-1043: prevents stale cache-bust params from persisting to JSON                                                                                                    |
| 8   | Admin create modal has token upload section                               | PASS   | index.html lines 1308-1320: upload zone with preview grid, name inputs, quantity inputs, remove buttons                                                                                |
| 9   | Admin edit modal has token manage section                                 | PASS   | index.html lines 1743-1793: existing tokens grid with upload, delete, reorder (move up/down), edit quantity                                                                            |
| 10  | Landing page shows token button between cards and links                   | PASS   | colecoes.$slug.tsx lines 147-159: button with Coins icon, count display, positioned after sampleImages and before DeckCheck/Manual section                                             |
| 11  | Token button hidden when no tokens                                        | PASS   | Conditional render: `collection.tokens && collection.tokens.length > 0` (line 147)                                                                                                     |
| 12  | Modal displays tokens with Card3DTilt, quantities, right-click protection | PASS   | tokens-modal.tsx: Card3DTilt wrapper (line 67), quantity badge (lines 87-89), onContextMenu preventDefault (line 68), userSelect/pointerEvents/draggable protections (lines 77-83)     |
| 13  | Modal close: Escape / click outside / X button                            | PASS   | Escape via keydown listener (line 17), overlay click (line 35), X button (lines 39-52)                                                                                                 |
| 14  | Body scroll lock when modal open                                          | PASS   | `document.body.style.overflow = "hidden"` on open, restored on cleanup (lines 21-25)                                                                                                   |
| 15  | Responsive grid (2/3/4 cols)                                              | PASS   | `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` (line 64)                                                                                                                                  |

### Security

| #   | Check                                  | Status | Notes                                                      |
| --- | -------------------------------------- | ------ | ---------------------------------------------------------- |
| 1   | Path traversal blocked in DELETE       | PASS   | Filename checked for `..`, `/`, `\` (server.ts line 768)   |
| 2   | Slug validation on all token endpoints | PASS   | `isValidSlug()` called at lines 641, 737, 765              |
| 3   | File type validation                   | PASS   | Only JPEG/PNG/WebP accepted (lines 676-685)                |
| 4   | Quantity validation                    | PASS   | Positive integers only (lines 670-673)                     |
| 5   | Image protection on landing page       | PASS   | Right-click disabled, pointer-events:none, draggable=false |

### Git Persist

| #   | Check                                   | Status | Notes                  |
| --- | --------------------------------------- | ------ | ---------------------- |
| 1   | `public/images/tokens/` in FILES_TO_ADD | PASS   | git-persist.ts line 71 |
| 2   | gitPersist after token upload           | PASS   | server.ts line 729     |
| 3   | gitPersist after token reorder          | PASS   | server.ts line 757     |
| 4   | gitPersist after token delete           | PASS   | server.ts line 791     |

### Build & Integration

| #   | Check                             | Status | Notes                                                   |
| --- | --------------------------------- | ------ | ------------------------------------------------------- |
| 1   | `bun run build` passes            | PASS   | Zero errors, 425ms build time                           |
| 2   | No TypeScript errors              | PASS   | Build completed with no warnings                        |
| 3   | Existing functionality unaffected | PASS   | sampleImages CRUD, Lightbox, all other routes unchanged |

### Documentation (required by CLAUDE.md)

| #   | Check                                | Status | Notes                                                                |
| --- | ------------------------------------ | ------ | -------------------------------------------------------------------- |
| 1   | `docs/diagrams/F17-architecture.mmd` | PASS   | **Created by QA** -- component/data-flow diagram                     |
| 2   | `docs/diagrams/F17-journey.mmd`      | PASS   | **Created by QA** -- BPMN-style user flows for admin and customer    |
| 3   | README.md mentions F17               | PASS   | **Updated by QA** -- added F17 to changelog, tokens dir to structure |

---

## Issues Found

### Remaining (non-blocking)

1. **MINOR: Reorder endpoint does not validate array length** (server.ts lines 747-753). The endpoint validates that each submitted token image exists in the current set, but does not check that the submitted array length matches the current tokens array length. A malformed request could theoretically drop tokens. Risk is low since only authenticated admins can call this endpoint.

2. **MINOR: No max-length validation on token names** (server.ts lines 653-660). Token names parsed from JSON have no length cap, unlike collection names (100 chars) and descriptions (500 chars). Low risk since only admins can hit this endpoint.

---

## Fixes Applied by QA

1. **Created** `docs/diagrams/F17-architecture.mmd` -- component and data-flow diagram for the tokens feature.
2. **Created** `docs/diagrams/F17-journey.mmd` -- BPMN-style user journey diagram covering admin upload, admin manage, and customer view flows.
3. **Updated** `README.md` -- added F17 to changelog table, added `images/tokens/` to project structure, updated task manifest range to F01-F17.

---

## Conclusion

All functional requirements are met. Both bugs from the tech lead review (critical PUT token persistence and moderate cache-bust) have been confirmed fixed in the current code. The build is clean. The two remaining minor issues (reorder length validation and token name length) are non-blocking improvements that can be addressed in a future pass. Documentation gaps (diagrams and README) have been filled.

**Verdict: PASS_WITH_NOTES** -- ship-ready. Minor improvements recommended for future hardening.
