# F14 Test Plan — Fix cover upload and structural persistence bugs

| Field | Value |
|-------|-------|
| **Status** | drafted |
| **Generator** | TEA |
| **Generated at** | 2026-11-18 |
| **Source brief** | F14-README.md — fix cover upload (sharp processing, no watermark), serve-time cache-bust injection, loading spinner, collections.json sanitisation |

---

## 1. Header

This test plan covers validation of four bugfix tasks in F14:
- **T01**: New `processCoverImage()` function in `image-processor.ts` (sharp resize, JPEG conversion, no watermark)
- **T02**: Cover upload endpoint refactored to use sharp + tmp-file pattern; GET `/api/collections` injects serve-time `?v=<mtime>` cache-bust; persisted JSON stores clean paths only
- **T03**: Loading spinner overlay in admin UI during cover upload
- **T04**: Startup sanitiser strips stale `?v=` from `collections.json`; manual verification of clean data

All testing is **manual** (no automated test framework in this project).

---

## 2. Fixtures

| Fixture | Path | Domain | Owner |
|---------|------|--------|-------|
| Valid PNG image (>1200px wide) | _test data, not committed_ | image-processing | F14-T01 |
| Valid WebP image with transparency | _test data, not committed_ | image-processing | F14-T01 |
| Small JPEG image (<1200px wide) | _test data, not committed_ | image-processing | F14-T01 |
| Corrupt image file (text renamed to .jpg) | _test data, not committed_ | error-handling | F14-T01 |
| Dirty collections.json (with `?v=12345` on image paths) | _manually crafted for T04 testing_ | data-sanitisation | F14-T04 |

_All fixtures are ephemeral test data created by the tester at test time. No committed fixture files are needed — this is a manual-test project. Justified: creating permanent fixture files adds maintenance cost with no rework prevented, since tests are executed manually._

---

## 3. Harnesses por fronteira

### Unit

**N/A** — No unit test framework configured in this project. All validation is manual or via code review.

### Integration

**Framework:** Manual + `curl`/browser DevTools
**Command:** Start admin server with `bun run --cwd admin dev`, then exercise API endpoints
**Default test path:** Admin panel at `http://localhost:<port>/`

Covers: T01 (sharp processing via upload), T02 (endpoint behaviour + GET cache-bust injection), T04 (startup sanitiser)

### E2E

**N/A** — No E2E framework (Playwright, Cypress, etc.) is configured. The admin panel is a single HTML file with vanilla JS. Manual browser testing covers the E2E scenarios (T03 spinner, full upload flow).

---

## 4. Perf budgets

_Sem perf budgets aplicaveis._ This is a bugfix feature; no performance-sensitive operations are introduced. Cover processing via sharp is an admin-only operation with no user-facing latency constraint.

---

## 5. Mocks vs hits real

| Componente | Decisao | Justificativa |
|-----------|---------|---------------|
| sharp (image processing) | real | Core of the bugfix; must validate actual format conversion. Mocking would defeat the purpose. |
| Filesystem (cover write/read) | real | Bug involves actual file I/O (tmp-file pattern, mtime stat). Must hit real disk. |
| Admin server endpoints | real | Testing endpoint behaviour; curl/browser hits the real Bun server. |
| Google OAuth | mock (bypass) | Use existing dev auth bypass or pre-authenticated session. OAuth is orthogonal to cover bugs. |
| Git persist (F13) | real | T02 changes affect what gets committed to git; verify clean paths in actual git diff. |

---

## 6. Test scenarios resumo

### T01 — processCoverImage()

1. **(F14-T01)** Upload a PNG cover -> verify output at `public/images/covers/<slug>.jpg` is a valid JPEG with max width 1200px
2. **(F14-T01)** Upload a WebP cover with transparency -> verify output is JPEG (no alpha channel crash)
3. **(F14-T01)** Upload an image smaller than 1200px -> verify image is NOT enlarged (`withoutEnlargement: true`)
4. **(F14-T01)** Upload a corrupt image file -> verify sharp throws an error, endpoint returns 500
5. **(F14-T01)** Verify no watermark text ("Forja Serafim") appears on the processed cover image
6. **(F14-T01)** Verify existing `processImage()` function is unchanged (code review)

### T02 — Cover upload endpoint + GET cache-bust

7. **(F14-T02)** Upload JPEG cover -> verify `src/data/collections.json` stores clean path without `?v=`
8. **(F14-T02)** Upload PNG cover -> verify file is converted to JPEG via sharp (not raw `Bun.write`)
9. **(F14-T02)** After upload, verify cover upload response body includes `?v=<mtime>` for immediate UI cache-bust
10. **(F14-T02)** Call GET `/api/collections` -> verify all `image` fields have `?v=<number>` appended
11. **(F14-T02)** Call GET `/api/collections` -> verify all `sampleImages` entries have `?v=<number>` appended
12. **(F14-T02)** Cover file does not exist on disk -> GET `/api/collections` returns path without `?v=` (no crash)
13. **(F14-T02)** Upload cover to a new collection with no existing cover -> works on first attempt
14. **(F14-T02)** After upload, verify tmp file is cleaned up (no leftover in `.tmp-upload/`)
15. **(F14-T02)** Upload corrupt image -> endpoint returns 500, `collections.json` is unchanged
16. **(F14-T02)** Verify git diff after cover upload shows only clean paths (no `?v=` in committed JSON)

### T03 — Loading spinner

17. **(F14-T03)** Click "Trocar capa" in edit modal, select image -> spinner overlay appears on cover preview
18. **(F14-T03)** Wait for upload to complete -> spinner disappears, new image shown
19. **(F14-T03)** During upload, file input is disabled (prevents double-click upload)
20. **(F14-T03)** If server returns error -> spinner removed, error toast shown, no JS errors in console
21. **(F14-T03)** Open different modal during upload -> no JS errors (safe spinner cleanup)

### T04 — Sanitise collections.json

22. **(F14-T04)** With clean `collections.json` -> server startup makes no changes (no-op)
23. **(F14-T04)** Manually add `?v=12345` to an `image` path -> restart server -> verify it is stripped
24. **(F14-T04)** Manually add `?v=99` to a `sampleImages` entry -> restart server -> verify it is stripped
25. **(F14-T04)** Empty `sampleImages` array -> server startup does not crash
26. **(F14-T04)** After sanitisation, `bun run build` succeeds without errors

### Integration / Cross-task

27. **(F14-T01, T02)** Full flow: upload PNG cover via admin UI -> file processed by sharp (T01) -> clean path in JSON (T02) -> cache-bust in GET response (T02) -> spinner shown during upload (T03)
28. **(F14-T02, T04)** Server restart after cover upload -> no stale `?v=` in JSON, GET response has fresh mtime-based cache-bust
29. **(Global)** `bun run build` succeeds after all F14 changes
30. **(Global)** Existing covers continue to render correctly on the public site

---

## 7. Anotacoes para tasks

| Task | Fixture slugs |
|------|---------------|
| F14-T01 | png-large, webp-transparent, jpeg-small, corrupt-image |
| F14-T02 | png-large, corrupt-image, dirty-collections-json |
| F14-T03 | _(no fixtures — visual/manual only)_ |
| F14-T04 | dirty-collections-json |

Tasks annotated: F14-T01, F14-T02, F14-T03, F14-T04 (see appended lines in each task file).
