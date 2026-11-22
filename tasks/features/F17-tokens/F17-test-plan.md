# F17 Test Plan — Tokens

## 1. Scope

### In Scope

- **Data model**: New `Token` type and `tokens: Token[]` field on `Collection` in `src/lib/store-data.ts`
- **Backend endpoints** (in `admin/src/server.ts`):
  - `POST /api/collections/:slug/tokens` — upload token images with names and quantities
  - `DELETE /api/collections/:slug/tokens/:filename` — remove a single token
  - `PUT /api/collections/:slug/tokens/reorder` — reorder the tokens array
- **Image processing**: Watermark applied to token images via `processImage()`, stored at `public/images/tokens/{slug}/{name}.jpg`
- **Storage**: `TOKENS_DIR` constant in `admin/src/lib/paths.ts`, auto-created directories, static serving
- **gitPersist integration**: `public/images/tokens/` added to `FILES_TO_ADD` in `admin/src/lib/git-persist.ts`
- **Admin UI**: Token section in create/edit collection modals in `admin/public/index.html`
- **Landing page**: `TokensModal` component (`src/components/tokens-modal.tsx`) and trigger button in `src/routes/colecoes.$slug.tsx`

### Out of Scope

- Changes to existing sampleImages, covers, videos, or testimonials functionality
- Google OAuth / authentication logic (assumed working)
- Render deployment pipeline
- SEO metadata for tokens
- Drag-and-drop reordering (only up/down buttons)

---

## 2. Test Strategy

### Approach

| Layer              | Method                           | Tools / Environment                                                                   |
| ------------------ | -------------------------------- | ------------------------------------------------------------------------------------- |
| Unit (backend)     | Manual function-level testing    | Bun test runner or manual curl against local admin server (`bun run dev` in `admin/`) |
| Integration (API)  | HTTP request/response validation | `curl` / Postman against `http://localhost:3001` (admin dev server)                   |
| E2E / UI (admin)   | Manual browser testing           | Chrome DevTools on `http://localhost:3001`                                            |
| E2E / UI (landing) | Manual browser testing           | Chrome DevTools on `http://localhost:5173` (Vite dev server)                          |
| Visual regression  | Manual screenshot comparison     | Side-by-side with existing sampleImages UI and Lightbox modal                         |

### Environments

- **Local dev**: `bun run dev` (Vite landing page on :5173) + admin server on :3001
- **Build verification**: `bun run build` must succeed without TypeScript errors

### Pre-conditions

- At least one collection exists in `src/data/collections.json` (e.g., `castlevania`)
- Admin server is running and authenticated (Google OAuth session active)
- Test image files available: 1 JPEG, 1 PNG, 1 WebP, 1 invalid file (e.g., `.txt`)

---

## 3. Unit Tests

### 3.1 Data Model — `src/lib/store-data.ts`

| ID  | Test Case                                                                             | Expected Result                                     |
| --- | ------------------------------------------------------------------------------------- | --------------------------------------------------- |
| U01 | `Token` type exported with fields `image: string`, `name: string`, `quantity: number` | TypeScript compilation succeeds; type is importable |
| U02 | `Collection` type includes `tokens: Token[]`                                          | No type errors when accessing `collection.tokens`   |
| U03 | `getCollection("castlevania")` returns object with `tokens` array                     | Returns array (empty `[]` for existing collections) |

### 3.2 Path Constants — `admin/src/lib/paths.ts`

| ID  | Test Case                                                      | Expected Result                              |
| --- | -------------------------------------------------------------- | -------------------------------------------- |
| U04 | `TOKENS_DIR` resolves to `{PROJECT_ROOT}/public/images/tokens` | Path string ends with `public/images/tokens` |

### 3.3 gitPersist Paths — `admin/src/lib/git-persist.ts`

| ID  | Test Case                                               | Expected Result                                                          |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------------ |
| U05 | `FILES_TO_ADD` array includes `"public/images/tokens/"` | Entry present in the array at `admin/src/lib/git-persist.ts` line ~65-73 |

### 3.4 Image Processing — `admin/src/lib/image-processor.ts`

| ID  | Test Case                                                       | Expected Result                                         |
| --- | --------------------------------------------------------------- | ------------------------------------------------------- |
| U06 | `processImage(jpegBuffer, outputPath)` with a 1200px wide image | Output file is JPEG, max 600px wide, contains watermark |
| U07 | `processImage(pngBuffer, outputPath)` with transparency         | Output is JPEG (no alpha channel), watermark applied    |
| U08 | `processImage(smallBuffer, outputPath)` with a 400px wide image | Output is 400px wide (not upscaled), watermark applied  |

### 3.5 Filename Sanitization (in POST handler)

| ID  | Test Case                                           | Expected Result                                             |
| --- | --------------------------------------------------- | ----------------------------------------------------------- |
| U09 | Filename `"Bat Token (3).png"`                      | Sanitized to `bat-token-3.jpg`                              |
| U10 | Filename `"morcego_vampiro.jpeg"`                   | Sanitized to `morcego-vampiro.jpg`                          |
| U11 | Filename with Unicode accents `"dragao-magico.png"` | Sanitized to `dragao-magico.jpg` (accents stripped via NFD) |
| U12 | Filename `"../../../etc/passwd"`                    | Path traversal characters stripped; safe output name        |

---

## 4. Integration Tests

### 4.1 POST `/api/collections/:slug/tokens`

| ID  | Test Case                       | Request                                                                                     | Expected Status                                           | Expected Response                                                                                                         |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| I01 | Upload 2 valid JPEG tokens      | FormData: `files` (2 JPEGs), `names` (`["Bat Token","Wolf Token"]`), `quantities` (`[3,2]`) | `200`                                                     | `{ processed: [{ image: "/images/tokens/castlevania/bat-token.jpg", name: "Bat Token", quantity: 3 }, ...], failed: [] }` |
| I02 | Upload with invalid file type   | FormData: `files` (1 `.txt` file)                                                           | `400`                                                     | `{ error: "Arquivos invalidos: ..." }`                                                                                    |
| I03 | Upload with quantity = 0        | FormData: `files` (1 JPEG), `quantities` (`[0]`)                                            | `400`                                                     | Error about invalid quantity                                                                                              |
| I04 | Upload to non-existent slug     | POST to `/api/collections/nonexistent/tokens`                                               | `400` or `404`                                            | Error: slug not found                                                                                                     |
| I05 | Upload with invalid slug chars  | POST to `/api/collections/INVALID SLUG!/tokens`                                             | `400`                                                     | `{ error: "Slug invalido." }`                                                                                             |
| I06 | Upload with no files            | FormData: empty `files`                                                                     | `400`                                                     | `{ error: "Nenhuma imagem enviada." }`                                                                                    |
| I07 | Verify physical file created    | After I01, check `public/images/tokens/castlevania/bat-token.jpg`                           | File exists on disk, is valid JPEG                        |
| I08 | Verify collections.json updated | After I01, read `src/data/collections.json`                                                 | `castlevania.tokens` array contains the 2 uploaded tokens |
| I09 | Verify directory auto-creation  | Upload token to slug with no prior tokens dir                                               | `public/images/tokens/{slug}/` directory created          |

### 4.2 DELETE `/api/collections/:slug/tokens/:filename`

| ID  | Test Case                       | Request                                                      | Expected Status                                                   | Expected Response                                   |
| --- | ------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------- |
| I10 | Delete existing token           | DELETE `/api/collections/castlevania/tokens/bat-token.jpg`   | `200`                                                             | Updated collection object without the deleted token |
| I11 | Delete non-existent token       | DELETE `/api/collections/castlevania/tokens/nonexistent.jpg` | `404` or `400`                                                    | Error: token not found                              |
| I12 | Delete from non-existent slug   | DELETE `/api/collections/fake/tokens/bat-token.jpg`          | `400` or `404`                                                    | Error: collection not found                         |
| I13 | Verify physical file removed    | After I10, check disk                                        | `public/images/tokens/castlevania/bat-token.jpg` no longer exists |
| I14 | Verify collections.json updated | After I10, read JSON                                         | Token entry removed from `castlevania.tokens`                     |

### 4.3 PUT `/api/collections/:slug/tokens/reorder`

| ID  | Test Case                            | Request                                                               | Expected Status          | Expected Response                        |
| --- | ------------------------------------ | --------------------------------------------------------------------- | ------------------------ | ---------------------------------------- |
| I15 | Reorder 3 tokens (reverse order)     | `{ tokens: [token3, token2, token1] }`                                | `200`                    | Updated collection with reordered tokens |
| I16 | Reorder with token not in collection | `{ tokens: [{ image: "/images/tokens/castlevania/fake.jpg", ... }] }` | `400`                    | Error: image not found in collection     |
| I17 | Reorder empty array                  | `{ tokens: [] }`                                                      | `200`                    | Collection tokens set to `[]`            |
| I18 | Verify collections.json order        | After I15, read JSON                                                  | Tokens in reversed order |

### 4.4 gitPersist Verification

| ID  | Test Case                          | Trigger      | Expected Result                                                            |
| --- | ---------------------------------- | ------------ | -------------------------------------------------------------------------- |
| I19 | gitPersist after token upload      | POST upload  | Git log shows commit `Auto-save: Upload tokens: castlevania`               |
| I20 | gitPersist after token delete      | DELETE token | Git log shows commit `Auto-save: Remover token: castlevania/bat-token.jpg` |
| I21 | gitPersist after reorder           | PUT reorder  | Git log shows commit `Auto-save: Reordenar tokens: castlevania`            |
| I22 | gitPersist stages token images dir | After upload | `git diff --cached --name-only` includes `public/images/tokens/` files     |

---

## 5. E2E / UI Tests

### 5.1 Admin Panel — Create Collection Modal

| ID  | Step                 | Action                                               | Expected Result                                                                                                                        |
| --- | -------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| E01 | Open create modal    | Click "Nova Colecao" button                          | Modal opens; "Tokens" section visible below sampleImages section                                                                       |
| E02 | Upload tokens        | Click token upload zone, select 2 images             | Preview cards appear in grid with thumbnail, name input (auto-filled from filename), quantity input (default 1), and remove (X) button |
| E03 | Edit token name      | Change name input from auto-generated to "Bat Token" | Input value updates                                                                                                                    |
| E04 | Edit token quantity  | Change quantity from 1 to 3                          | Input value updates; min=1 enforced                                                                                                    |
| E05 | Remove preview token | Click X on a preview card                            | Card removed from grid                                                                                                                 |
| E06 | Submit collection    | Fill all fields + tokens, click save                 | Collection created; tokens appear in edit modal; toast "Colecao criada" shown                                                          |

### 5.2 Admin Panel — Edit Collection Modal

| ID  | Step                    | Action                                                       | Expected Result                                                                                             |
| --- | ----------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| E07 | Open edit modal         | Click edit on existing collection                            | Modal opens; "Tokens" section shows existing tokens with count label (e.g., "3 tokens")                     |
| E08 | View existing tokens    | Inspect token grid                                           | Each token shows: watermarked thumbnail, editable name, quantity badge, delete button, move up/down buttons |
| E09 | Upload additional token | Click upload zone, select 1 image, provide name and quantity | New token appears in grid; toast "Token adicionado"                                                         |
| E10 | Delete a token          | Click delete button on a token                               | Token removed from grid (optimistic); toast shown; file deleted on server                                   |
| E11 | Reorder tokens          | Click "move up" on second token                              | Token moves to first position; order persisted via PUT reorder                                              |
| E12 | Edit quantity inline    | Change quantity from 2 to 5, blur field                      | PUT collection update fires; quantity persisted                                                             |
| E13 | Upload invalid file     | Select a `.txt` file                                         | Error toast: "Arquivos invalidos..."                                                                        |
| E14 | Responsive layout       | Resize browser to mobile width (<640px)                      | Grid changes to 2 columns                                                                                   |

### 5.3 Landing Page — Token Button & Modal

| ID  | Step                      | Action                                           | Expected Result                                                                                   |
| --- | ------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| E15 | Collection with tokens    | Navigate to `/colecoes/castlevania` (has tokens) | "Ver Tokens (N)" button visible between card grid disclaimer and DeckCheck/Manual section         |
| E16 | Collection without tokens | Navigate to a collection with 0 tokens           | No token button visible                                                                           |
| E17 | Open modal                | Click "Ver Tokens (3)" button                    | Modal opens with fade-in animation (0.2s); overlay is black 90% + backdrop blur                   |
| E18 | Modal content             | Inspect modal                                    | Title "Tokens do Deck" in Cinzel font, gold color; grid of token cards                            |
| E19 | Token card display        | Inspect individual token card                    | Image with Card3DTilt 3D effect; name below in Jost font; gold quantity badge at top-right ("x3") |
| E20 | Right-click protection    | Right-click on token image                       | Context menu prevented (`onContextMenu` handler)                                                  |
| E21 | Close via Escape          | Press Escape key                                 | Modal closes                                                                                      |
| E22 | Close via click outside   | Click on overlay (outside modal content)         | Modal closes                                                                                      |
| E23 | Close via X button        | Click X button in modal                          | Modal closes                                                                                      |
| E24 | Body scroll lock          | Open modal, try scrolling page                   | Page scroll is locked (`document.body.style.overflow = "hidden"`)                                 |
| E25 | Body scroll restored      | Close modal                                      | Page scroll restored                                                                              |
| E26 | Responsive grid (mobile)  | Open modal on <640px viewport                    | 2-column grid                                                                                     |
| E27 | Responsive grid (tablet)  | Open modal on 640-1024px viewport                | 3-column grid                                                                                     |
| E28 | Responsive grid (desktop) | Open modal on >1024px viewport                   | 4-column grid                                                                                     |
| E29 | 3D tilt effect            | Hover/move mouse over token card                 | Card3DTilt perspective tilt applied                                                               |
| E30 | Quantity = 1 display      | Token with quantity 1                            | Badge shows "x1"                                                                                  |

---

## 6. Edge Cases & Error Scenarios

### Boundary Values

| ID   | Scenario                                       | Expected Behavior                                           |
| ---- | ---------------------------------------------- | ----------------------------------------------------------- |
| EC01 | Upload token with quantity = 1 (minimum valid) | Accepted; badge shows "x1"                                  |
| EC02 | Upload token with quantity = 0                 | Rejected with 400 error                                     |
| EC03 | Upload token with quantity = -1                | Rejected with 400 error                                     |
| EC04 | Upload token with quantity = 999 (very large)  | Accepted; badge shows "x999"                                |
| EC05 | Upload token with empty name                   | Auto-generated from filename (sanitized)                    |
| EC06 | Upload token with very long name (200+ chars)  | Name truncated or handled gracefully                        |
| EC07 | Collection with 0 tokens                       | Button hidden on landing page; empty grid in admin          |
| EC08 | Collection with 1 token                        | Button shows "Ver Tokens (1)"; modal opens with single card |
| EC09 | Collection with 10+ tokens                     | Modal scrollable; grid wraps correctly                      |
| EC10 | Token image exactly 600px wide                 | No resize needed; watermark still applied                   |
| EC11 | Token image < 600px wide (e.g., 300px)         | Not upscaled; output is 300px wide                          |
| EC12 | Token image very large (5000px)                | Resized to 600px max width                                  |

### Error Handling

| ID   | Scenario                                                         | Expected Behavior                                                   |
| ---- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| EC13 | Network error during token upload (admin)                        | Error toast displayed; no partial state                             |
| EC14 | Server returns 500 during upload                                 | Error toast; files not added to grid                                |
| EC15 | Delete token while another operation in progress                 | gitPersist serial queue ensures operations don't conflict           |
| EC16 | Upload duplicate filename                                        | Overwrites existing file or appends suffix (verify actual behavior) |
| EC17 | Token image file corrupted / unreadable by sharp                 | `processImage` throws; file added to `failed` array in response     |
| EC18 | Slug with path traversal (`../evil`)                             | `isValidSlug()` rejects — regex `/^[a-z0-9-]+$/` fails              |
| EC19 | Filename with path traversal (`../../etc/passwd`)                | Sanitization strips `..`, `/`, `\` — safe filename produced         |
| EC20 | `collections.json` missing `tokens` field on existing collection | Defaults to `[]`; no crash on read                                  |

### Concurrent Operations

| ID   | Scenario                                       | Expected Behavior                                                 |
| ---- | ---------------------------------------------- | ----------------------------------------------------------------- |
| EC21 | Two token uploads for same slug simultaneously | gitPersist serial queue processes them sequentially; both succeed |
| EC22 | Token upload + sampleImage upload concurrently | No interference; separate directories (`tokens/` vs `decks/`)     |
| EC23 | Token delete during reorder                    | Serial queue ensures consistent state                             |

---

## 7. Acceptance Test Matrix

This matrix maps the global acceptance criteria (from F17-README.md) and per-task criteria to specific test cases.

### Global Acceptance Criteria

| #   | Criterion                                                           | Test Cases                                                 | Pass | Fail |
| --- | ------------------------------------------------------------------- | ---------------------------------------------------------- | ---- | ---- |
| G1  | Tokens can be uploaded with name and quantity via admin             | E01-E06, E09, I01                                          | [ ]  | [ ]  |
| G2  | Uploaded tokens receive watermark (same pattern as cards)           | U06-U08, I07                                               | [ ]  | [ ]  |
| G3  | Tokens appear on landing page with correct quantity                 | E15, E18, E19, E30                                         | [ ]  | [ ]  |
| G4  | Modal follows existing site design (dark, gold accents, Card3DTilt) | E17-E19, E26-E29                                           | [ ]  | [ ]  |
| G5  | gitPersist triggers after token mutations                           | I19-I22                                                    | [ ]  | [ ]  |
| G6  | All existing card functionality unaffected                          | Verify sampleImages CRUD still works; Lightbox still opens | [ ]  | [ ]  |

### T01 — Data Model + Backend Endpoints

| #     | Criterion                                                                  | Test Cases         | Pass | Fail |
| ----- | -------------------------------------------------------------------------- | ------------------ | ---- | ---- |
| T01-1 | Collection type includes `tokens: Token[]`                                 | U01, U02           | [ ]  | [ ]  |
| T01-2 | Existing collections.json has `"tokens": []` for each collection           | U03                | [ ]  | [ ]  |
| T01-3 | POST endpoint creates watermarked token images in `/images/tokens/{slug}/` | I01, I07, I08, I09 | [ ]  | [ ]  |
| T01-4 | DELETE endpoint removes token + physical file                              | I10, I13, I14      | [ ]  | [ ]  |
| T01-5 | PUT reorder endpoint reorders tokens array                                 | I15, I18           | [ ]  | [ ]  |
| T01-6 | gitPersist stages `public/images/tokens/` directory                        | U05, I22           | [ ]  | [ ]  |
| T01-7 | All endpoints call gitPersist after mutation                               | I19, I20, I21      | [ ]  | [ ]  |

### T02 — Token Image Storage + Watermark

| #     | Criterion                                                            | Test Cases                                                  | Pass | Fail |
| ----- | -------------------------------------------------------------------- | ----------------------------------------------------------- | ---- | ---- |
| T02-1 | TOKENS_DIR constant exported from paths.ts                           | U04                                                         | [ ]  | [ ]  |
| T02-2 | Token images stored at `public/images/tokens/{slug}/{name}.jpg`      | I07                                                         | [ ]  | [ ]  |
| T02-3 | Token images have watermark (same as sampleImages)                   | U06-U08                                                     | [ ]  | [ ]  |
| T02-4 | Directory auto-created on first upload per slug                      | I09                                                         | [ ]  | [ ]  |
| T02-5 | Static serving works for token images on both admin and landing page | E08 (admin thumbnails load), E19 (landing page images load) | [ ]  | [ ]  |

### T03 — Admin Panel Token UI

| #     | Criterion                                               | Test Cases         | Pass | Fail |
| ----- | ------------------------------------------------------- | ------------------ | ---- | ---- |
| T03-1 | Token section visible in create collection modal        | E01                | [ ]  | [ ]  |
| T03-2 | Token section visible in edit collection modal          | E07                | [ ]  | [ ]  |
| T03-3 | Can upload multiple token images with name and quantity | E02-E04, E06       | [ ]  | [ ]  |
| T03-4 | Can remove individual tokens                            | E10                | [ ]  | [ ]  |
| T03-5 | Can reorder tokens (move up/down)                       | E11                | [ ]  | [ ]  |
| T03-6 | Can edit token quantity inline                          | E12                | [ ]  | [ ]  |
| T03-7 | Toast feedback on all operations                        | E06, E09, E10, E13 | [ ]  | [ ]  |
| T03-8 | Responsive grid layout matches sampleImages style       | E14                | [ ]  | [ ]  |
| T03-9 | gitPersist triggered after each token mutation          | I19-I21            | [ ]  | [ ]  |

### T04 — Landing Page Token Button + Modal

| #      | Criterion                                                         | Test Cases    | Pass | Fail |
| ------ | ----------------------------------------------------------------- | ------------- | ---- | ---- |
| T04-1  | Token button appears between card grid and DeckCheck/Manual links | E15           | [ ]  | [ ]  |
| T04-2  | Button hidden when collection has no tokens                       | E16, EC07     | [ ]  | [ ]  |
| T04-3  | Button shows token count                                          | E15           | [ ]  | [ ]  |
| T04-4  | Modal opens with fade-in animation                                | E17           | [ ]  | [ ]  |
| T04-5  | Modal displays token image, name, and quantity                    | E18, E19      | [ ]  | [ ]  |
| T04-6  | Token images have Card3DTilt 3D effect                            | E29           | [ ]  | [ ]  |
| T04-7  | Right-click disabled on token images                              | E20           | [ ]  | [ ]  |
| T04-8  | Modal closes via Escape / click outside / X button                | E21, E22, E23 | [ ]  | [ ]  |
| T04-9  | Responsive grid (2->3->4 cols)                                    | E26, E27, E28 | [ ]  | [ ]  |
| T04-10 | Design matches site theme (dark, gold accents, Cinzel/Jost fonts) | E18           | [ ]  | [ ]  |

### Build Verification

| #   | Criterion                                               | Test Cases                         | Pass | Fail |
| --- | ------------------------------------------------------- | ---------------------------------- | ---- | ---- |
| BV1 | `bun run build` succeeds with no TypeScript errors      | Run build                          | [ ]  | [ ]  |
| BV2 | `bun run lint` passes                                   | Run lint                           | [ ]  | [ ]  |
| BV3 | Existing sampleImages upload/delete/reorder still works | Manual regression test             | [ ]  | [ ]  |
| BV4 | Existing Lightbox modal still works                     | Open Lightbox on a collection page | [ ]  | [ ]  |
