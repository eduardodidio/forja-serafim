# F16 Test Plan — Cover Bug Fix

## 1. Scope

Verify that changing a collection cover image via the admin panel is correctly reflected on the public site. The bug manifests as Castlevania's cover showing `cavaleiros-do-zodiaco.jpg` instead of `castlevania.jpg`. Testing covers:

- JSON data integrity (`collections.json` slug-to-image mapping)
- Vite bundle correctness (baked data matches disk)
- Admin upload pipeline (endpoint -> disk -> JSON -> git-persist)
- Cache-bust mechanism on the front-end
- No regression on Cavaleiros do Zodiaco and Final Fantasy VII collections

## 2. Test Strategy

This is a 4-task bugfix with no new dependencies or infrastructure changes. Strategy:

- **Manual verification** of data files and DOM inspection (T01, T04)
- **Build output inspection** via `bun run build` + grep on bundle (T01)
- **End-to-end pipeline walkthrough** of cover upload flow (T02)
- **Browser-level cache testing** to validate cache-bust (T03, T04)
- **Regression spot-check** on all 3 collections (T04)

No automated test suite exists for this static site, so all validation is manual + build checks.

## 3. Test Cases

### TC-01: JSON data integrity

| Step                                                 | Expected                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| Read `src/data/collections.json`                     | Castlevania entry has `"image": "/images/covers/castlevania.jpg"` |
| Each collection's `image` field matches its own slug | No cross-contamination between slugs                              |

### TC-02: Bundle correctness

| Step                                           | Expected                                                                     |
| ---------------------------------------------- | ---------------------------------------------------------------------------- |
| Run `bun run build`                            | Exits 0, no errors                                                           |
| Search for `castlevania` in `dist/assets/*.js` | The image path for Castlevania points to `castlevania.jpg`, not another slug |
| Search for `cavaleiros-do-zodiaco` in bundle   | Only appears in its own collection entry                                     |

### TC-03: Cover upload endpoint

| Step                                                           | Expected                                                          |
| -------------------------------------------------------------- | ----------------------------------------------------------------- |
| POST a new cover image to `/api/collections/castlevania/cover` | Returns 200 with `{path: "/images/covers/castlevania.jpg?v=..."}` |
| Check `public/images/covers/castlevania.jpg` on disk           | File is the newly uploaded image                                  |
| Check `src/data/collections.json`                              | `image` field updated with clean path (no `?v=`)                  |

### TC-04: git-persist after upload

| Step                                           | Expected                                                                          |
| ---------------------------------------------- | --------------------------------------------------------------------------------- |
| After cover upload, run `git log --oneline -1` | Shows auto-save commit with cover change                                          |
| Check `git diff HEAD~1`                        | Includes changes to `collections.json` and `public/images/covers/castlevania.jpg` |

### TC-05: Cache-bust on front-end

| Step                               | Expected                                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------- |
| Load site, observe cover image     | Image displays correctly                                                                  |
| Upload a different cover via admin | New image file on disk                                                                    |
| Reload site (no cache clear)       | New cover image appears (cache-bust query string or no-cache headers prevent stale image) |
| Inspect `<img>` src in DOM         | Contains cache-bust parameter or headers prevent caching                                  |

### TC-06: Site pages show correct covers

| Step                                          | Expected                                                 |
| --------------------------------------------- | -------------------------------------------------------- |
| Navigate to `/colecoes/castlevania`           | Cover `<img>` src contains `castlevania.jpg`             |
| Navigate to `/colecoes/cavaleiros-do-zodiaco` | Cover src contains `cavaleiros-do-zodiaco.jpg`           |
| Navigate to `/colecoes/final-fantasy-vii`     | Cover src contains `final-fantasy-vii.jpg`               |
| Navigate to `/colecoes` (listing)             | Each card renders its own sampleImages; no slug mismatch |

### TC-07: Regression - card flip and sample images

| Step                                             | Expected                                                  |
| ------------------------------------------------ | --------------------------------------------------------- |
| On `/colecoes`, hover/click each card            | Card flip animation works, sampleImages display correctly |
| No broken images (check for 404s in Network tab) | All image requests return 200                             |

## 4. Fixtures & Mocks

- **Test cover image**: Any JPEG file (minimum 400x400) to upload as a replacement cover for Castlevania.
- **Known-good JSON snapshot**: Copy of current `collections.json` before any changes, to diff against after fix.
- No mocks needed -- all testing is against the real local admin server and build output.

## 5. Regression Risks

| Risk                                                          | Mitigation                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| Fix for Castlevania breaks other collections' cover paths     | TC-06 checks all 3 collections explicitly                     |
| Cache-bust query string breaks image loading in some browsers | TC-05 verifies image actually renders after bust              |
| `git-persist` changes break auto-save for non-cover edits     | Spot-check a collection name edit after fix and verify commit |
| Vite build plugin or config change causes build failure       | TC-02 runs full build                                         |
| Admin UI stops showing updated cover                          | TC-03 verifies admin response; manual check in admin panel    |

## 6. Environment

| Environment             | How to test                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Local dev**           | `bun run dev` for site + `cd admin && bun src/server.ts` for admin. Primary testing environment.                       |
| **Local preview**       | `bun run build && bun run preview` to validate production bundle locally.                                              |
| **Production (Render)** | After deploy, verify `https://forjaserafim.com.br/colecoes/castlevania` shows correct cover. Verify all 3 collections. |

## 7. Exit Criteria

Testing is complete when ALL of the following are true:

- [ ] `collections.json` on disk has correct slug-to-image mapping for all 3 collections
- [ ] `bun run build` succeeds and bundle contains correct mappings
- [ ] `bun run lint` passes
- [ ] Cover upload via admin updates both the image file and JSON correctly
- [ ] git-persist commits and pushes the change
- [ ] Site shows updated cover without manual cache clearing
- [ ] All 3 collection detail pages show their own cover image (no cross-contamination)
- [ ] Card listing page has no broken images or mismapped covers
- [ ] No 404s in browser Network tab when navigating the site
