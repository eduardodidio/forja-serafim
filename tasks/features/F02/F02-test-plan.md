# F02 Test Plan — Redesign Admin Panel (UX & Estetica)

**Feature:** F02 — Redesign Admin Panel (UX & Estetica)
**Author:** TEA Agent
**Date:** 2026-11-16
**File under test:** `admin/public/index.html`

---

## 1. Scope

This test plan covers the complete visual redesign of the admin panel for "A Casa do Serafim". The redesign affects a single file (`admin/public/index.html`) and is purely a UI/UX overhaul — no backend changes, no API changes, no changes to `admin/src/server.ts`.

**In scope:**

- Design system (colors, typography, spacing, transitions)
- Header and navigation (tabs, counters, icons)
- Collections CRUD (cards, modals, uploads with feedback)
- Testimonials CRUD (cards, modals, custom confirm dialog)
- Settings panel (layout, input styling, save feedback)
- Publish flow (confirm modal, progress steps, deploy hook)
- Responsive layout (1024px+)
- Loading states, toasts, and feedback for all actions

**Out of scope:**

- Backend / server.ts changes
- API endpoint behavior
- Site frontend (src/ directory)
- Mobile layout below 1024px

---

## 2. Test Strategy

**Approach:** Manual visual testing in Chrome (Anderson's local environment).

**Rationale:** The admin panel is a single vanilla HTML+JS file with no build step, no component framework, and no test runner. Automated UI tests would require setting up a browser automation stack (Playwright/Puppeteer) that is disproportionate to the scope of a single-file redesign. Manual testing is the pragmatic choice.

**Browser:** Google Chrome (latest stable)
**Resolution:** 1024px minimum width, also test at 1280px and 1920px
**Server:** Local admin server (`bun run dev` in `admin/`)
**Preconditions:** At least 3 collections loaded (Castlevania, Cavaleiros do Zodiaco, Final Fantasy VII), at least 1 testimonial, settings.json with WhatsApp configured.

---

## 3. Functional Tests

### 3.1 Navigation (Tabs)

| ID     | Test                       | Steps                                                 | Expected                                                                          |
| ------ | -------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| NAV-01 | Tab switching              | Click each tab (Colecoes, Depoimentos, Configuracoes) | Correct panel shows, others hide. Active tab has gold underline + icon highlight. |
| NAV-02 | Tab counters               | Load page with 3 collections, N testimonials          | Tab badges show correct counts: "Colecoes (3)", "Depoimentos (N)".                |
| NAV-03 | Counter updates after CRUD | Add a collection, then check tab counter              | Counter increments by 1. Same for delete (decrements).                            |
| NAV-04 | Default tab on load        | Reload page                                           | Collections tab is active by default.                                             |
| NAV-05 | Tab icons                  | Visual inspection                                     | Each tab has an appropriate icon (cards, chat, gear).                             |

### 3.2 Collections CRUD

| ID     | Test                          | Steps                                                       | Expected                                                                                                                                      |
| ------ | ----------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| COL-01 | View collections              | Load page with 3 collections                                | 3 cards rendered with cover banner, name, description, stats, status badges.                                                                  |
| COL-02 | Create collection             | Click "Nova colecao", fill all fields, upload cover, submit | Modal opens with sections (Informacoes, Links, Capa). After submit: toast success, card appears in list, counter updates.                     |
| COL-03 | Edit collection               | Click "Editar" on a card                                    | Modal opens with all fields pre-filled. Change name, save. Card updates.                                                                      |
| COL-04 | Delete collection             | Click "Remover" on a card                                   | Confirm dialog appears. Confirm: collection removed, toast, counter updates. Cancel: nothing happens.                                         |
| COL-05 | Status badges                 | Collection with DeckCheck URL filled, Moxfield empty        | DeckCheck badge green with check. Moxfield badge grey/dashed.                                                                                 |
| COL-06 | Sample images gallery         | Collection with sample images                               | Thumbnails displayed in grid/carousel, hover zoom effect works.                                                                               |
| COL-07 | Cover upload (inline)         | Click upload cover on existing card                         | Drag-and-drop zone or file picker appears. Select image: preview shown. Confirm: spinner during upload, success feedback, card cover updates. |
| COL-08 | Deck images upload            | Click upload images on collection                           | Multi-file selector. Select 5 images: counter shows "5 imagens selecionadas". Upload: progress "Processando X de Y...", completion feedback.  |
| COL-09 | Manual PDF upload             | Click upload manual on collection                           | File picker (PDF). Select file: filename shown. Upload: feedback spinner then success.                                                        |
| COL-10 | Cover preview in create modal | Select cover image in creation modal                        | Image preview renders before submission.                                                                                                      |

### 3.3 Testimonials CRUD

| ID     | Test                                | Steps                                        | Expected                                                                                                                                    |
| ------ | ----------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| TST-01 | View testimonials                   | Switch to Depoimentos tab                    | Cards with decorative quotes, avatar initials in gold circle, name, deck badge, italic text.                                                |
| TST-02 | Create testimonial                  | Click "Novo depoimento", fill fields, submit | Modal with clean layout. After submit: toast, card appears, counter updates.                                                                |
| TST-03 | Edit testimonial                    | Click "Editar" on testimonial card           | Modal opens with fields pre-filled. Change text, save. Card updates.                                                                        |
| TST-04 | Delete testimonial (custom confirm) | Click "Remover" on testimonial card          | Custom modal appears (NOT native confirm()) with warning icon, "Cancelar" and "Remover" buttons. Confirm: removed + toast. Cancel: nothing. |
| TST-05 | Deck select in modal                | Open add/edit testimonial modal              | Deck dropdown shows available collections with improved styling.                                                                            |

### 3.4 Settings

| ID     | Test              | Steps                                   | Expected                                                                            |
| ------ | ----------------- | --------------------------------------- | ----------------------------------------------------------------------------------- |
| SET-01 | Load settings     | Switch to Configuracoes tab             | WhatsApp input loads with current value from settings.json. Card has WhatsApp icon. |
| SET-02 | Save settings     | Change WhatsApp value, click "Salvar"   | Toast success, value persists. Reload page: value still there.                      |
| SET-03 | Input decoration  | Visual inspection                       | Input has phone icon on left side (input group). Help text visible below.           |
| SET-04 | Save button state | Open settings without changing anything | Button disabled (if implemented). After changing value: button enabled.             |

### 3.5 Publish

| ID     | Test                   | Steps                                                | Expected                                                                                                                                         |
| ------ | ---------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| PUB-01 | Publish confirm modal  | Click "Publicar" button in header                    | Custom modal (NOT native confirm()) with warning/info icon, description text, "Cancelar" and "Publicar" buttons.                                 |
| PUB-02 | Cancel publish         | Click "Cancelar" in confirm modal                    | Modal closes, nothing happens, no API calls made.                                                                                                |
| PUB-03 | Publish progress steps | Click "Publicar" in confirm modal                    | Progress modal shows 4 steps with spinners. Each step transitions from spinner to green check as it completes.                                   |
| PUB-04 | Publish success        | Full publish cycle completes                         | All 4 steps show green checks. "Fechar" button appears only after all steps complete. Toast success.                                             |
| PUB-05 | Publish error          | Simulate network failure (disconnect or stop server) | Failed step shows red X with error message. Other steps don't proceed.                                                                           |
| PUB-06 | Publish button states  | During publish                                       | Button shows spinner + "Publicando..." with pulse animation. Button is disabled (not-allowed cursor). After completion: returns to normal state. |

---

## 4. Visual/UX Tests

| ID     | Test                            | Expected                                                                                                                        |
| ------ | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| VIS-01 | Design system - colors          | Dark gradient background (deeper to surface). Gold (#d4a853) accent consistently used for active elements, borders, highlights. |
| VIS-02 | Design system - typography      | Inter or system-ui font. Clear hierarchy: headings bold, body regular, labels small/muted.                                      |
| VIS-03 | Design system - borders/shadows | Cards use rounded-2xl. Subtle gold-tinted shadows. Border-gradient on hover.                                                    |
| VIS-04 | Transitions                     | All interactive elements have smooth transitions (200-300ms). No jarring state changes.                                         |
| VIS-05 | Responsive 1024px               | Resize to 1024px width. Layout does not break, no horizontal scroll, cards stack appropriately.                                 |
| VIS-06 | Responsive 1280px               | Resize to 1280px. Layout uses space well.                                                                                       |
| VIS-07 | Responsive 1920px               | Resize to 1920px. Content centered within max-width, no awkward stretching.                                                     |
| VIS-08 | Hover states - buttons          | Hover over every button type (gold, outline, danger, publish)                                                                   | Visual feedback on all.                                                                                                                         |
| VIS-09 | Focus states - inputs           | Tab through all inputs                                                                                                          | Gold border on focus for every input field.                                                                                                     |
| VIS-10 | Toast design                    | Trigger a success and error action                                                                                              | Toast has icon (check/x), slide-in animation, auto-dismiss with progress bar.                                                                   |
| VIS-11 | Modal design                    | Open any modal                                                                                                                  | Backdrop blur, scale-in animation, X button in corner. Click backdrop to close.                                                                 |
| VIS-12 | Loading states                  | Reload page / trigger fetch                                                                                                     | Loading skeleton or spinner visible during data fetches. No flash of empty content.                                                             |
| VIS-13 | Fade-in on lists                | Load collections/testimonials                                                                                                   | Lists fade in subtly, no jarring pop-in.                                                                                                        |
| VIS-14 | Header visual                   | Inspect header                                                                                                                  | Logo larger with decorative icon. "Painel Administrativo" badge. Publish button prominent with rocket icon. "Ver site" link with external icon. |
| VIS-15 | Empty state - collections       | Delete all collections (or test with empty data)                                                                                | Large icon + inviting text + "Criar primeira colecao" button.                                                                                   |
| VIS-16 | Empty state - testimonials      | Delete all testimonials (or test with empty data)                                                                               | Quotes/chat icon + "Nenhum depoimento ainda" + "Adicionar primeiro depoimento" button.                                                          |

---

## 5. Regression Tests

All existing functionality must work identically after the redesign. These tests confirm no behavioral regressions.

| ID     | Test                        | Verification                                                                                    |
| ------ | --------------------------- | ----------------------------------------------------------------------------------------------- |
| REG-01 | Collections data integrity  | All 3 decks display same data as before: name, description, card count, URLs, sample images.    |
| REG-02 | Testimonials data integrity | All testimonials display same data: name, text, associated deck.                                |
| REG-03 | Settings data integrity     | WhatsApp value loads and saves to same settings.json path.                                      |
| REG-04 | API calls unchanged         | Network tab: same endpoints called, same payloads, same methods (GET/POST/PUT/DELETE).          |
| REG-05 | Upload endpoints unchanged  | Cover, deck images, and manual PDF uploads hit same API endpoints with same FormData structure. |
| REG-06 | Publish flow unchanged      | Publish still runs: build, git commit, git push, deploy hook. Same API endpoint.                |
| REG-07 | No server.ts changes        | `admin/src/server.ts` has zero modifications.                                                   |
| REG-08 | Tab state preserved         | Switching tabs and coming back preserves loaded data (no re-fetch needed).                      |
| REG-09 | File structure unchanged    | No new files created besides modified `index.html`. No files deleted.                           |

---

## 6. Edge Cases

| ID      | Test                        | Steps                                                     | Expected                                                                        |
| ------- | --------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------- |
| EDGE-01 | Empty collections list      | Start with 0 collections                                  | Empty state renders. "Nova colecao" button still works.                         |
| EDGE-02 | Empty testimonials list     | Start with 0 testimonials                                 | Empty state renders. "Novo depoimento" button still works.                      |
| EDGE-03 | Long collection name        | Create collection with 100+ character name                | Text truncates or wraps gracefully. Card layout does not break.                 |
| EDGE-04 | Long testimonial text       | Create testimonial with 500+ characters                   | Text displays with appropriate line-clamp or scroll. Layout intact.             |
| EDGE-05 | Long description            | Collection with very long description                     | line-clamp-2 truncation with ellipsis.                                          |
| EDGE-06 | Missing cover image         | Collection without cover uploaded                         | Placeholder or default state shown (no broken image icon).                      |
| EDGE-07 | Missing sample images       | Collection with 0 sample images                           | Gallery section hidden or shows "Nenhuma amostra" state.                        |
| EDGE-08 | Network error on save       | Disconnect network, try to save collection                | Error toast with clear message. No data corruption. UI returns to usable state. |
| EDGE-09 | Network error on upload     | Disconnect network, try to upload cover                   | Upload feedback shows error. File picker can be retried.                        |
| EDGE-10 | Network error on publish    | Disconnect network, click publish                         | Progress step shows red X with error message. User can close modal and retry.   |
| EDGE-11 | Double-click protection     | Rapidly click "Salvar" in a modal                         | Only one API call made. Button disables during request.                         |
| EDGE-12 | Modal escape key            | Open any modal, press Escape                              | Modal closes cleanly.                                                           |
| EDGE-13 | Concurrent tab switching    | Rapidly click between tabs                                | No rendering glitches. Correct panel always shows.                              |
| EDGE-14 | Large image upload          | Upload a 10MB+ image as cover                             | Upload completes (server handles resize). Progress indicator shows during wait. |
| EDGE-15 | Special characters in names | Collection name with accents: "Colecao Especial & Magica" | Renders correctly, no XSS, no encoding issues.                                  |

---

## 7. Acceptance Matrix

Maps each Global AC from F02-README.md to specific test scenarios.

| Global Acceptance Criteria                                               | Test IDs                                                                                                            | Pass Condition                                                                        |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Todas as funcionalidades existentes preservadas (CRUD, uploads, publish) | REG-01 through REG-09, COL-01 through COL-10, TST-01 through TST-05, SET-01 through SET-04, PUB-01 through PUB-06   | Every CRUD operation, upload, and publish works identically to pre-redesign behavior. |
| Visual premium, escuro, coerente com a marca "A Casa do Serafim"         | VIS-01 through VIS-04, VIS-14                                                                                       | Dark theme with gold accent. Consistent design system. Header with brand identity.    |
| Responsivo (funcionar bem em telas de 1024px+)                           | VIS-05, VIS-06, VIS-07                                                                                              | No layout breakage at 1024px, 1280px, and 1920px.                                     |
| Loading states e feedback visual em todas as acoes                       | VIS-10, VIS-11, VIS-12, VIS-13, COL-07 (upload feedback), COL-08 (progress), PUB-03 (steps), PUB-06 (button states) | Every action has visible loading/progress feedback. Toasts confirm success/error.     |
| Nenhuma mudanca no server.ts ou nas APIs                                 | REG-04, REG-07                                                                                                      | server.ts untouched. Network calls identical.                                         |
| Testado no Chrome (ambiente local do Anderson)                           | All tests                                                                                                           | All tests executed in Chrome on local admin server.                                   |

---

## Execution Notes

- **Pre-test setup:** Start admin server (`cd admin && bun run dev`). Ensure at least 3 collections and 1 testimonial exist.
- **Test order:** Run sections 3-4-5-6 sequentially. Section 5 (regression) can be validated alongside section 3 (functional).
- **Defect reporting:** Any failure should reference the test ID and include a screenshot.
- **Sign-off:** Feature passes when all items in the Acceptance Matrix show green.
