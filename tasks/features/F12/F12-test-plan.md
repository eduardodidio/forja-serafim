# F12 Test Plan — Project Review: Bug Fixes & Flow Hardening

## 1. Scope

This test plan covers the validation of bug fixes and hardening changes introduced in F12, which addresses findings from a full project audit. The scope includes:

- **Server hardening** (T01): race conditions in `Bun.write()`, PDF MIME validation, slug sanitization, `writeJson` safety, and error reporting for image processing.
- **PWA manifest fixes** (T02): manifest link in `index.html`, correct icon sizes in `manifest.json`, removal of duplicate manifest tags.
- **Input validation hardening** (T03): text length limits on testimonial fields (text, name, deck) and collection fields.
- **Documentation & lint** (T04): CLAUDE.md stack description accuracy, eslint `no-unused-vars` rule change from `off` to `warn`.

## 2. Test Strategy

**Approach:** Primarily manual testing with targeted automated checks.

- **Manual:** Admin panel upload flows, PWA install behavior, Lighthouse audits, input boundary testing.
- **Automated/CLI:** `bun run lint` for lint rule verification, `bun run build` for build integrity, `grep`-based checks for code patterns (e.g., verifying all `Bun.write()` calls are awaited).
- **Code review:** Static analysis of `server.ts`, `data-io.ts`, `index.html`, `manifest.json`, `CLAUDE.md`, and `eslint.config.js` to confirm changes match specifications.

**Tools:**

- Chrome DevTools (Network, Application > Manifest, Console)
- Lighthouse (PWA audit)
- `curl` or Postman (API endpoint testing with crafted payloads)
- `bun run lint`, `bun run build`
- `grep` for static code pattern checks

## 3. Test Cases by Task

### T01 — Server Hardening

| ID        | Description                                  | Steps                                                                                                                        | Expected Result                                                                                    | Priority |
| --------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- |
| TC-T01-01 | Bun.write awaited on cover upload            | 1. Upload a cover image via admin panel. 2. Check server response. 3. Verify file exists on disk immediately after response. | File is fully written before response returns. No race condition.                                  | P0       |
| TC-T01-02 | Bun.write awaited on sample image upload     | 1. Upload a sample image via admin panel. 2. Verify `processImage` does not fail with file-not-found.                        | Image is processed successfully; no ENOENT errors in server logs.                                  | P0       |
| TC-T01-03 | Bun.write awaited on PDF upload              | 1. Upload a valid PDF via admin panel. 2. Verify file exists on disk after response.                                         | PDF file fully written, response includes success.                                                 | P0       |
| TC-T01-04 | PDF MIME validation — invalid type           | 1. Use `curl` to POST a `.pdf` file with MIME type `text/plain`.                                                             | Server returns 400 with error message "Arquivo deve ser PDF."                                      | P0       |
| TC-T01-05 | PDF MIME validation — valid type             | 1. Upload a real PDF file with MIME `application/pdf`.                                                                       | Upload succeeds.                                                                                   | P0       |
| TC-T01-06 | PDF MIME validation — empty type fallback    | 1. POST a `.pdf` file with empty MIME type (simulating some browsers).                                                       | Upload succeeds (empty MIME accepted as fallback).                                                 | P1       |
| TC-T01-07 | Slug sanitization — path traversal attempt   | 1. Send API request with slug `../../../etc/passwd`.                                                                         | Server returns 400. Request is rejected before any file operation.                                 | P0       |
| TC-T01-08 | Slug sanitization — special characters       | 1. Send API request with slug `castlevania; rm -rf /`.                                                                       | Server returns 400.                                                                                | P0       |
| TC-T01-09 | Slug sanitization — valid slug               | 1. Send API request with slug `castlevania`.                                                                                 | Request proceeds normally.                                                                         | P0       |
| TC-T01-10 | Slug sanitization — slug with numbers        | 1. Send API request with slug `final-fantasy-7`.                                                                             | Request proceeds normally.                                                                         | P1       |
| TC-T01-11 | Slug sanitization — uppercase rejected       | 1. Send API request with slug `Castlevania`.                                                                                 | Server returns 400 (slug must be lowercase).                                                       | P1       |
| TC-T01-12 | writeJson — rename failure cleanup           | 1. Simulate `renameSync` failure (e.g., read-only target). 2. Verify tmp file is cleaned up.                                 | Tmp file is deleted. Error is re-thrown to caller.                                                 | P1       |
| TC-T01-13 | writeJson — normal operation                 | 1. Trigger a writeJson operation (e.g., add a collection). 2. Verify JSON file is written correctly.                         | File written atomically, valid JSON content.                                                       | P1       |
| TC-T01-14 | Image processing — partial failure reporting | 1. Upload 3 sample images, one of which is corrupted (e.g., a text file renamed to .jpg).                                    | Response includes `processed` array (2 items) and `failed` array (1 item with filename and error). | P0       |
| TC-T01-15 | Image processing — all succeed               | 1. Upload 3 valid sample images.                                                                                             | Response includes `processed` with 3 items, `failed` is empty array.                               | P1       |
| TC-T01-16 | Cleanup failure logging                      | 1. Trigger upload flow. 2. Simulate tmp cleanup failure. 3. Check server console.                                            | Warning logged: `[Upload] Failed to cleanup tmp dir:` with error details.                          | P2       |

### T02 — PWA Manifest & Icons

| ID        | Description                          | Steps                                                                                               | Expected Result                                                          | Priority |
| --------- | ------------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------- |
| TC-T02-01 | Manifest link in index.html          | 1. Open `index.html` source. 2. Search for `<link rel="manifest">`.                                 | Tag `<link rel="manifest" href="/manifest.json" />` present in `<head>`. | P0       |
| TC-T02-02 | No duplicate manifest tags           | 1. Load site in browser. 2. Inspect DOM `<head>`. 3. Count `<link rel="manifest">` tags.            | Exactly one manifest link tag in the DOM.                                | P1       |
| TC-T02-03 | Manifest icon sizes match real files | 1. Check dimensions of referenced icon files. 2. Compare with `sizes` declared in `manifest.json`.  | Declared sizes match actual file dimensions.                             | P0       |
| TC-T02-04 | Lighthouse PWA manifest check        | 1. Run Lighthouse audit on the site. 2. Check "Installable" section.                                | Manifest is detected and passes validation. No "no manifest" error.      | P0       |
| TC-T02-05 | PWA install prompt on mobile         | 1. Open site in Chrome on Android. 2. Wait for install prompt or check "Add to Home Screen" option. | PWA install option is available.                                         | P1       |
| TC-T02-06 | Manifest JSON valid                  | 1. Fetch `/manifest.json`. 2. Parse as JSON.                                                        | Valid JSON, no syntax errors. Contains `name`, `icons`, `start_url`.     | P1       |

### T03 — Testimonial & Input Validation

| ID        | Description                           | Steps                                                      | Expected Result                                                       | Priority |
| --------- | ------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------- | -------- |
| TC-T03-01 | Testimonial text > 500 chars rejected | 1. POST testimonial with `text` of 501 characters.         | Returns 400: "Texto do depoimento deve ter no maximo 500 caracteres." | P0       |
| TC-T03-02 | Testimonial text = 500 chars accepted | 1. POST testimonial with `text` of exactly 500 characters. | Returns 200, testimonial saved.                                       | P0       |
| TC-T03-03 | Testimonial text = 1 char accepted    | 1. POST testimonial with `text` of 1 character.            | Returns 200, testimonial saved.                                       | P2       |
| TC-T03-04 | Testimonial name > 100 chars rejected | 1. POST testimonial with `name` of 101 characters.         | Returns 400: "Nome deve ter no maximo 100 caracteres."                | P0       |
| TC-T03-05 | Testimonial name = 100 chars accepted | 1. POST testimonial with `name` of exactly 100 characters. | Returns 200, testimonial saved.                                       | P1       |
| TC-T03-06 | Testimonial deck > 100 chars rejected | 1. POST testimonial with `deck` of 101 characters.         | Returns 400: "Nome do deck deve ter no maximo 100 caracteres."        | P0       |
| TC-T03-07 | Testimonial deck = 100 chars accepted | 1. POST testimonial with `deck` of exactly 100 characters. | Returns 200, testimonial saved.                                       | P1       |
| TC-T03-08 | Collection name empty rejected        | 1. POST/PUT collection with empty `name`.                  | Returns 400 with appropriate error message.                           | P1       |
| TC-T03-09 | Collection URL invalid format         | 1. POST/PUT collection with `moxfieldUrl` = "not-a-url".   | Returns 400 with appropriate error message.                           | P1       |

### T04 — Documentation & Lint

| ID        | Description                                 | Steps                                                      | Expected Result                                                                                                             | Priority |
| --------- | ------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------- |
| TC-T04-01 | CLAUDE.md stack line updated                | 1. Read `CLAUDE.md`. 2. Check Stack line.                  | Contains "Vite + React 19 + TanStack Router + TypeScript + Tailwind CSS v4". No mention of "TanStack Start".                | P0       |
| TC-T04-02 | CLAUDE.md architecture section updated      | 1. Read Architecture section of `CLAUDE.md`.               | Describes "Vite + React 19 com TanStack Router (file-based routing, client-side SPA)". No mention of SSR or TanStack Start. | P0       |
| TC-T04-03 | eslint no-unused-vars set to warn           | 1. Read `eslint.config.js`. 2. Find `no-unused-vars` rule. | Rule is `["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }]`.                                                   | P0       |
| TC-T04-04 | Lint passes without errors                  | 1. Run `bun run lint`.                                     | Exit code 0. No errors. Warnings for unused vars are acceptable if prefixed with `_`.                                       | P0       |
| TC-T04-05 | No dead variables without underscore prefix | 1. Run `bun run lint`. 2. Check unused-var warnings.       | No warnings for variables that are genuinely dead (not prefixed with `_`).                                                  | P1       |
| TC-T04-06 | Build succeeds after lint changes           | 1. Run `bun run build`.                                    | Build completes without errors.                                                                                             | P0       |

## 4. Integration Tests

| ID    | Description                               | Steps                                                                                                                                                                                                                                  | Expected Result                                                                                                   | Priority |
| ----- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------- |
| IT-01 | Full upload flow with validation          | 1. Start admin server. 2. Login via Google OAuth. 3. Create a new collection with valid data. 4. Upload cover image. 5. Upload sample images (mix of valid and one invalid). 6. Upload PDF manual. 7. Add testimonial with valid data. | All operations succeed. Cover, samples, and PDF are saved. Failed sample reported in response. Testimonial saved. | P0       |
| IT-02 | Admin panel displays partial failure      | 1. Upload batch of images where one is corrupted. 2. Check the admin UI response.                                                                                                                                                      | UI shows which files succeeded and which failed with error details.                                               | P0       |
| IT-03 | Site build + PWA after all changes        | 1. Apply all T01-T04 changes. 2. Run `bun run build`. 3. Serve built site. 4. Run Lighthouse.                                                                                                                                          | Build succeeds. Lighthouse PWA audit passes manifest check. No console errors.                                    | P0       |
| IT-04 | Malicious input across multiple endpoints | 1. Attempt path traversal via slug in cover upload, sample upload, and manual upload endpoints. 2. Attempt oversized text in testimonial. 3. Attempt invalid MIME PDF upload.                                                          | All requests return 400. No files created outside expected directories.                                           | P0       |
| IT-05 | Data integrity after writeJson changes    | 1. Add a collection. 2. Edit collection. 3. Remove collection. 4. Verify `collections.json` is valid after each operation.                                                                                                             | JSON file is always valid. No orphan tmp files left in directory.                                                 | P1       |

## 5. Regression Risks

| Area                        | Risk                                                                                                                     | Mitigation                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Admin uploads               | Adding `await` to `Bun.write()` could change error handling flow if surrounding code assumed synchronous-like behavior.  | Verify all upload endpoints still return correct responses for both success and failure cases.      |
| PDF upload                  | Stricter MIME validation could reject legitimate PDFs from browsers that send unusual MIME types.                        | Accept empty MIME type as fallback. Test with multiple browsers.                                    |
| Slug validation             | Overly strict regex could reject valid collection slugs that exist in `collections.json`.                                | Verify all existing slugs in `collections.json` match the regex `^[a-z0-9]+(?:-[a-z0-9]+)*$`.       |
| writeJson atomic write      | Changes to `data-io.ts` could introduce bugs in the write path affecting all data operations.                            | Test add/edit/remove collection and testimonial operations.                                         |
| PWA manifest                | Changing icon entries could break existing PWA installs or cached manifests.                                             | Clear service worker cache during testing. Verify install prompt still works.                       |
| eslint rule change          | Changing `no-unused-vars` to `warn` could surface many warnings that require code changes, potentially introducing bugs. | Run lint before and after. Only prefix with `_` or remove genuinely dead code. Do not change logic. |
| __root.tsx manifest removal | Removing the manifest link from `__root.tsx` head() could break if `index.html` link is somehow stripped during build.   | Verify manifest link present in built output, not just source.                                      |

## 6. Environment Requirements

- **Runtime:** Bun (latest stable)
- **Node:** v18+ (for tooling compatibility)
- **OS:** Windows (MINGW64) or Linux
- **Browser:** Chrome (latest) for Lighthouse and PWA testing
- **Admin server:** Running locally (`bun run --cwd admin dev` or equivalent)
- **Auth:** Google OAuth configured with valid `GOOGLE_CLIENT_ID` and `ALLOWED_EMAILS`
- **Test data:**
  - Valid PNG/JPG images for upload testing
  - One corrupted image file (e.g., text file renamed to `.jpg`)
  - Valid PDF file
  - Non-PDF file renamed to `.pdf` (for MIME validation testing)
- **Tools:**
  - `curl` or Postman for API endpoint testing
  - Chrome DevTools / Lighthouse
  - `bun run lint`, `bun run build`

## 7. Exit Criteria

All of the following must be satisfied for F12 to pass QA:

1. **Zero race conditions:** All `Bun.write()` calls in `server.ts` are `await`ed. Confirmed by code review and upload testing (TC-T01-01 through TC-T01-03).
2. **Input validation complete:** All user-facing inputs (slugs, text fields, file types) are validated server-side. All P0 validation test cases pass (TC-T01-04 through TC-T01-11, TC-T03-01 through TC-T03-06).
3. **Error reporting functional:** Image processing failures are reported to the frontend with file names and error details (TC-T01-14). Cleanup failures are logged (TC-T01-16).
4. **writeJson safe:** Atomic write with tmp cleanup on failure confirmed (TC-T01-12, TC-T01-13).
5. **PWA installable:** Lighthouse PWA manifest check passes (TC-T02-04). Manifest link in `index.html` source (TC-T02-01). Icon sizes match real files (TC-T02-03).
6. **Documentation accurate:** CLAUDE.md reflects actual stack — no mention of TanStack Start (TC-T04-01, TC-T04-02).
7. **Lint clean:** `bun run lint` exits 0 with no errors (TC-T04-04). `no-unused-vars` rule set to `warn` (TC-T04-03).
8. **Build passes:** `bun run build` completes without errors (TC-T04-06).
9. **All P0 test cases pass.** P1 test cases pass or have documented justification for deferral. P2 test cases are best-effort.
10. **No regressions:** All existing admin operations (add/edit/remove collection, upload, testimonials) continue to work correctly.
