# F03 Test Plan — Evolucao Tecnica: UX, Performance e Polimento

**Feature:** F03
**Status:** planned
**Author:** TEA (Test Architect)
**Date:** 2026-11-16

---

## 1. Scope

This test plan covers all deliverables of feature F03, which spans 7 tasks across 4 Waves:

| Task | Area | Description |
|------|------|-------------|
| T01 | SEO | Meta tags OG/Twitter, JSON-LD structured data, sitemap.xml, canonical URLs |
| T02 | PWA | manifest.json, service worker, favicon set, installability |
| T03 | UX | Lightbox/gallery with zoom, keyboard nav, copy protection |
| T04 | UX | Scroll animations via Intersection Observer, reduced motion support |
| T05 | Admin | Escape closes modals, double-click protection, error handling, drag-and-drop upload, image preview grid |
| T06 | UX | Custom 404 page with MTG-themed messaging and navigation |
| T07 | Infra | Image optimization pipeline: WebP, responsive srcset, LQIP blur placeholders |

**Out of scope:** Backend logic, payment flows, new deck content, admin server rewrite.

---

## 2. Test Strategy

Given that F03 is primarily a UX/performance/polish feature with no database or API changes, the testing mix is:

| Method | Purpose | Tasks covered |
|--------|---------|---------------|
| **Lighthouse audits** | Quantitative scores for Performance, SEO, Accessibility, PWA | T01, T02, T04, T07 |
| **Chrome DevTools inspection** | Network tab (WebP, caching), Application tab (manifest, SW, storage), Elements tab (meta tags, JSON-LD) | T01, T02, T07 |
| **Manual visual testing** | Lightbox UX, animations, 404 page design, admin interactions | T03, T04, T05, T06 |
| **Keyboard/accessibility testing** | Lightbox keyboard nav, Escape key, reduced motion, focus management | T03, T04, T05 |
| **Structured data validators** | Google Rich Results Test, og:debugger, sitemap validators | T01 |
| **Network throttling** | Simulate slow 3G to verify LQIP placeholders, offline fallback | T02, T07 |
| **Cross-device testing** | Mobile Chrome (Android), desktop Chrome, desktop Firefox minimum | All |
| **Build verification** | `bun run build` succeeds without errors or warnings | All |

No automated unit tests are planned for this feature since the changes are primarily visual/declarative (meta tags, CSS animations, HTML attributes). Validation is done through tooling and manual inspection.

---

## 3. Functional Tests

### 3.1 SEO Validation (T01)

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| SEO-01 | OG meta tags on homepage | View source of `/`, check `<head>` | `og:title`, `og:description`, `og:image`, `og:url`, `og:type` present with correct values |
| SEO-02 | OG meta tags on collection page | View source of `/colecoes/castlevania` | Dynamic `og:title` = collection name, `og:image` = collection cover |
| SEO-03 | Twitter Card meta tags | View source of any page | `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` present |
| SEO-04 | JSON-LD Organization | View source of `/`, find `<script type="application/ld+json">` | Valid Organization schema with name "A Casa do Serafim", type "Store", contactPoint |
| SEO-05 | JSON-LD Product | View source of `/colecoes/castlevania` | Valid Product schema with name, description, image |
| SEO-06 | JSON-LD BreadcrumbList | View source of internal pages | BreadcrumbList schema present on collection pages |
| SEO-07 | Sitemap accessible | GET `/sitemap.xml` | Valid XML with all routes listed |
| SEO-08 | Robots.txt references sitemap | GET `/robots.txt` | Contains `Sitemap: <full-url>/sitemap.xml` |
| SEO-09 | Canonical URLs | View source of every page | `<link rel="canonical" href="...">` present with correct absolute URL |
| SEO-10 | Google Rich Results Test | Paste URL into Rich Results Test | No errors, structured data detected |
| SEO-11 | Social preview | Share link in WhatsApp/Telegram | og:image renders as preview card |

### 3.2 PWA Install (T02)

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| PWA-01 | Manifest linked | View source, check `<head>` | `<link rel="manifest" href="/manifest.json">` present |
| PWA-02 | Manifest valid | DevTools > Application > Manifest | All fields populated: name, short_name, icons, start_url, display, theme_color, background_color |
| PWA-03 | Icons correct | Check manifest icons array | 192x192 and 512x512 icons exist and load correctly |
| PWA-04 | Service worker registered | DevTools > Application > Service Workers | SW active and running, scope = "/" |
| PWA-05 | Cache-first for assets | DevTools > Network, reload page, check CSS/JS/images | Served from ServiceWorker cache on second load |
| PWA-06 | Install prompt | Open site in Chrome on Android | "Install app" banner or menu option available |
| PWA-07 | Theme color | Open site on mobile Chrome | Browser address bar tinted #d4a853 (gold) |
| PWA-08 | Apple touch icon | Check `<head>` | `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` present, 180x180 image loads |
| PWA-09 | Favicon | Check browser tab | favicon.ico loads, correct visual (dark bg + gold star) |
| PWA-10 | Lighthouse PWA audit | Run Lighthouse | PWA badge achieved or score meets criteria |

### 3.3 Lightbox Navigation (T03)

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| LB-01 | Open lightbox | Click thumbnail in collection gallery | Fullscreen modal opens with image centered, dark blurred backdrop |
| LB-02 | Close via X button | Click X button | Lightbox closes, returns to gallery |
| LB-03 | Close via Escape | Press Escape key | Lightbox closes |
| LB-04 | Close via backdrop | Click outside image on dark area | Lightbox closes |
| LB-05 | Navigate right arrow key | Press right arrow | Next image shown |
| LB-06 | Navigate left arrow key | Press left arrow | Previous image shown |
| LB-07 | Navigate via click buttons | Click right/left arrow buttons | Navigation works |
| LB-08 | Counter display | Open lightbox at 3rd image | Counter shows "3 / N" |
| LB-09 | Wrap around | At last image, press right arrow | Either wraps to first or arrow disabled (verify consistent behavior) |
| LB-10 | Copy protection - right click | Right-click on lightbox image | Context menu blocked |
| LB-11 | Copy protection - drag | Try to drag image | Dragging disabled |
| LB-12 | Animation | Open lightbox | Fade-in animation plays smoothly |
| LB-13 | Mobile usability | Open lightbox on 375px viewport | Image fits viewport, controls accessible via touch |

### 3.4 Scroll Animations (T04)

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| ANIM-01 | Collection cards | Scroll to collection cards on homepage | Cards fade-up with staggered delay |
| ANIM-02 | Features section | Scroll to features section | Elements fade-in sequentially |
| ANIM-03 | Testimonials | Scroll to testimonials | Alternate fade-left / fade-right |
| ANIM-04 | CTA section | Scroll to final CTA | Fade-up animation |
| ANIM-05 | Section titles | Scroll to any section title | Fade-in animation |
| ANIM-06 | Single trigger | Scroll past element, scroll back up, scroll down again | Animation does NOT replay (fires once) |
| ANIM-07 | Reduced motion | Enable `prefers-reduced-motion: reduce` in OS/DevTools | All content visible immediately, no animations |

### 3.5 Admin UX Polish (T05)

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| ADM-01 | Escape closes modal | Open any modal (new collection, edit, etc.), press Escape | Modal closes |
| ADM-02 | Escape with no modal | Press Escape on main admin view | No error, nothing happens |
| ADM-03 | Double-click add collection | Click "Adicionar" twice rapidly | Only one request sent, button disables during submission |
| ADM-04 | Double-click save | Edit a collection, click Save twice rapidly | Only one save executed |
| ADM-05 | Double-click publish | Click Publish twice rapidly | Only one publish operation |
| ADM-06 | Double-click delete | Click delete, confirm, click again rapidly | Only one delete operation |
| ADM-07 | Error on load - collections | Stop admin server, reload admin page | Friendly error message displayed with retry button |
| ADM-08 | Retry after error | Click retry button after load error | Data loads successfully when server is back |
| ADM-09 | Drag-drop cover image | Drag an image file onto the cover upload zone in new collection modal | File accepted, preview shown, highlight visual during drag |
| ADM-10 | Drag-drop highlight | Drag file over upload zone (without dropping) | Zone shows visual highlight (border change, background change) |
| ADM-11 | Drag-drop leave | Drag file over zone then move cursor away | Highlight removed |
| ADM-12 | Click upload still works | Click the upload zone/button to select file via dialog | File picker opens, file accepted normally |
| ADM-13 | Image preview grid | Select 5 images for deck upload | Grid of 5 thumbnails shown with counter "5 imagens selecionadas" |
| ADM-14 | Preview confirm | After seeing preview grid, click "Enviar" | Images uploaded successfully |

### 3.6 404 Routing (T06)

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| 404-01 | Unknown route | Navigate to `/pagina-que-nao-existe` | Custom 404 page displayed |
| 404-02 | Unknown collection | Navigate to `/colecoes/deck-inexistente` | Custom 404 page displayed |
| 404-03 | Deep unknown path | Navigate to `/a/b/c/d` | Custom 404 page displayed |
| 404-04 | Link to collections | Click "Ver colecoes" on 404 page | Navigates to `/colecoes` |
| 404-05 | Link to home | Click "Voltar ao inicio" on 404 page | Navigates to `/` |
| 404-06 | Link to WhatsApp | Click WhatsApp link on 404 page | Opens WhatsApp with correct number |
| 404-07 | Themed text | View 404 page | Text "Esta carta nao esta no seu deck" (or similar MTG-themed) visible |
| 404-08 | Mobile layout | View 404 page on 375px viewport | Layout correct, buttons accessible |

### 3.7 Image Optimization (T07)

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| IMG-01 | WebP served | DevTools > Network, filter images | Images served as WebP (Content-Type: image/webp) |
| IMG-02 | JPEG fallback | Disable WebP in browser (or use Safari < 14) | JPEG version served |
| IMG-03 | Multiple sizes | Inspect `<img>` elements in source | `srcset` attribute with multiple widths (300w, 600w, 1200w) |
| IMG-04 | Sizes attribute | Inspect `<img>` elements | `sizes` attribute present with appropriate breakpoints |
| IMG-05 | LQIP placeholder | Throttle to Slow 3G, load collection page | Blurred placeholder visible before full image loads |
| IMG-06 | Blur-to-sharp transition | Observe image loading on slow connection | Smooth transition from blur placeholder to sharp image |
| IMG-07 | Build succeeds | Run `bun run build` | Build completes without errors |
| IMG-08 | Admin images unbroken | Upload a new image via admin | Image processed correctly, appears in site |

---

## 4. Visual/UX Tests

### 4.1 Animation Smoothness

| ID | Test | Expected |
|----|------|----------|
| VUX-01 | No jank during scroll animations | Chrome DevTools Performance tab shows no long frames (> 16ms) during scroll animations |
| VUX-02 | No layout shift from animations | Elements use `opacity` and `transform` only (no width/height/margin changes). CLS score = 0 for animation elements |
| VUX-03 | Stagger timing feels natural | Collection cards appear sequentially with ~100-150ms delay between each, not too fast, not too slow |

### 4.2 Lightbox Experience

| ID | Test | Expected |
|----|------|----------|
| VUX-04 | Lightbox backdrop blur | Background content blurred/dimmed, focus clearly on the image |
| VUX-05 | Image sizing | Image fills viewport appropriately (max-height 90vh), no overflow, no cropping |
| VUX-06 | Navigation UX on mobile | Arrow buttons large enough for touch targets (min 44x44px) |
| VUX-07 | Transition between images | Smooth fade or slide when navigating between images, no flicker |

### 4.3 404 Page Design

| ID | Test | Expected |
|----|------|----------|
| VUX-08 | Visual identity match | Dark background (#12121f or similar), gold accents (#d4a853), consistent typography with rest of site |
| VUX-09 | Illustration/icon | Large "404" text or card/deck icon present, visually striking |
| VUX-10 | Button styling | Buttons match site design system (gold/dark theme), clear hover states |

### 4.4 Reduced Motion

| ID | Test | Expected |
|----|------|----------|
| VUX-11 | All content visible | With reduced motion enabled, all sections render at full opacity with no transform offset |
| VUX-12 | Lightbox still functional | Lightbox opens/closes instantly (no fade), navigation still works |
| VUX-13 | No transition CSS applied | Inspect elements: no `transition` or `animation` properties active when reduced motion is on |

---

## 5. Regression Tests

All existing functionality must remain intact after F03 changes.

| ID | Area | Test | Expected |
|----|------|------|----------|
| REG-01 | Homepage | Load `/` | Hero, collections grid, features, testimonials, CTA all render correctly |
| REG-02 | Collections listing | Load `/colecoes` | All 3 decks (Castlevania, Cavaleiros do Zodiaco, Final Fantasy VII) displayed with covers |
| REG-03 | Collection detail | Load `/colecoes/castlevania` | Deck info, sample images, DeckCheck/Moxfield links, WhatsApp CTA all present |
| REG-04 | WhatsApp links | Click WhatsApp CTA on any page | Opens WhatsApp with correct number (+55 51 8431-5964) and contextual message |
| REG-05 | Anti-copy protection | Right-click on card image (outside lightbox) | Context menu blocked, watermark visible |
| REG-06 | Admin - CRUD collections | Create, edit, delete a collection via admin | All operations succeed |
| REG-07 | Admin - CRUD testimonials | Create, edit, delete a testimonial via admin | All operations succeed |
| REG-08 | Admin - Settings | Edit and save settings | Settings persist |
| REG-09 | Admin - Publish | Click publish | Site updated via git commit + push |
| REG-10 | Responsive layout | View site at 375px, 768px, 1440px | Layout adapts correctly at all breakpoints |
| REG-11 | Build clean | Run `bun run build` | Zero errors, zero warnings |

---

## 6. Edge Cases

### 6.1 PWA / Offline

| ID | Test | Expected |
|----|------|----------|
| EDGE-01 | Offline after install | Install PWA, go offline (airplane mode), open app | Offline fallback page shown ("Voce esta offline") |
| EDGE-02 | Offline cached pages | Visit homepage online, go offline, reload | Cached version loads from service worker |
| EDGE-03 | SW update | Deploy new version, revisit site | Service worker updates, new content available on next visit |

### 6.2 Missing/Broken Content

| ID | Test | Expected |
|----|------|----------|
| EDGE-04 | Missing cover image | Delete a collection's cover file, load page | Graceful fallback (placeholder or hidden), no broken image icon |
| EDGE-05 | Missing sample images | Collection with 0 sample images | Gallery section hidden or shows "Nenhuma amostra disponivel" |
| EDGE-06 | Lightbox with 1 image | Open lightbox on collection with single sample | No navigation arrows shown, counter shows "1 / 1" |
| EDGE-07 | Lightbox with 0 images | Collection with no samples, attempt to open lightbox | Lightbox does not open, no crash |

### 6.3 Slow Network

| ID | Test | Expected |
|----|------|----------|
| EDGE-08 | Slow 3G homepage | Throttle to Slow 3G, load homepage | LQIP placeholders appear, page is usable before all images load |
| EDGE-09 | Slow 3G lightbox | Open lightbox on slow connection | Loading indicator or blur placeholder while full image loads |
| EDGE-10 | Large image upload in admin | Upload a 10MB image via admin | Image processed and compressed without timeout |

### 6.4 Broken URLs

| ID | Test | Expected |
|----|------|----------|
| EDGE-11 | Invalid collection slug | Navigate to `/colecoes/!!!invalid!!!` | 404 page shown, no crash |
| EDGE-12 | URL with query params | Navigate to `/colecoes?foo=bar` | Page loads normally, no error |
| EDGE-13 | URL with hash | Navigate to `/#section` | Page loads, scrolls to section if exists |
| EDGE-14 | Admin invalid DeckCheck URL | Enter "not-a-url" in DeckCheck field | Validation error shown, save blocked |

### 6.5 Admin Error States

| ID | Test | Expected |
|----|------|----------|
| EDGE-15 | Drop non-image file | Drag a .txt file onto cover upload zone | File rejected, error message shown |
| EDGE-16 | Drop multiple files on cover | Drag 3 images onto single-file cover zone | Only first accepted, or error message |
| EDGE-17 | Escape with unsaved changes | Edit a field, press Escape | Modal closes (or prompts to discard — verify intended behavior) |

---

## 7. Acceptance Matrix

Maps each Global Acceptance Criterion (from F03-README.md) to test scenarios.

| Global AC | Test IDs | Pass Criteria |
|-----------|----------|---------------|
| **Todas as funcionalidades existentes preservadas** | REG-01 through REG-11 | All regression tests pass with no visual or functional differences |
| **Lighthouse score >= 90 em Performance, SEO e Accessibility** | SEO-10, PWA-10, IMG-01 through IMG-07, ANIM-07 | Lighthouse audit: Performance >= 90, SEO >= 90, Accessibility >= 90 |
| **Site installavel como PWA no Chrome/mobile** | PWA-01 through PWA-10 | Manifest valid, SW registered, install prompt available, Lighthouse PWA badge |
| **Galeria de amostras com lightbox funcional** | LB-01 through LB-13, VUX-04 through VUX-07, EDGE-06, EDGE-07 | Lightbox opens, navigates, closes via all methods, copy protection intact, works on mobile |
| **Admin robusto com feedback em todos os edge cases** | ADM-01 through ADM-14, EDGE-10, EDGE-15 through EDGE-17 | Escape works, no double-submits, errors handled gracefully, drag-drop functional, preview grid shown |
| **Nenhuma regressao visual no site ou admin** | REG-01 through REG-11, VUX-08 through VUX-10 | Side-by-side comparison shows no unintended visual changes |
| **Build sem erros (`bun run build`)** | REG-11, IMG-07 | Build completes with exit code 0, no errors in output |

---

## Execution Notes

- **Priority order:** Regression tests first (REG-*), then functional tests per wave, then edge cases.
- **Browsers:** Chrome (primary), Firefox (secondary). Mobile Chrome on Android for PWA tests.
- **Tools needed:** Chrome DevTools, Lighthouse, Google Rich Results Test, network throttling.
- **Blockers:** PWA install testing requires HTTPS or localhost. Lighthouse PWA audit requires served context (not file://).
