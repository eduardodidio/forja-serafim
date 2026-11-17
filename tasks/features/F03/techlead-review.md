# Tech Lead Review — F03: Evolucao Tecnica: UX, Performance e Polimento

**Reviewer:** Tech Lead
**Date:** 2026-11-16
**Verdict:** APPROVED (with observations)

---

## Summary

6 of 7 tasks implemented (T07 deferred — requires new dependency approval). All implemented tasks are functional, the build passes cleanly, and existing features are preserved.

## Task-by-Task Review

### T01 — SEO (PASS)

- `src/lib/seo.ts`: Well-structured module with meta tag helpers, JSON-LD schemas (Organization/Store, Product, Breadcrumb), and sitemap generator. Constants centralized via `SITE` export.
- `src/routes/__root.tsx`: Root head config includes charset, viewport, theme-color, manifest link, favicon set, and canonical URL. Organization JSON-LD injected via `<script type="application/ld+json">`.
- `src/routes/colecoes.$slug.tsx`: Dynamic OG/Twitter meta tags per collection. Product and Breadcrumb JSON-LD injected correctly.
- `src/routes/index.tsx`: Home page meta tags using `SITE` constants.
- `public/sitemap.xml`: Static file with all 7 URLs (home, colecoes, 3 decks, sobre, contato). Priorities are sensible.
- `public/robots.txt`: Permits all crawlers, includes sitemap reference.

**Observation:** `getHomeMetaTags()`, `getCollectionMetaTags()`, and `generateSitemap()` in `seo.ts` are dead code — the pages inline meta tags directly using `SITE` constants rather than calling these helpers. Tree-shaking removes them at build time, so no runtime impact. Consider removing them or refactoring pages to use them for DRY consistency in a future cleanup.

### T02 — PWA (PASS with caveat)

- `public/manifest.json`: Correct structure — standalone display, theme color matches site, categories appropriate.
- `public/sw.js`: Three-tier caching strategy (cache-first for static assets, network-first for API/JSON, network-first with offline fallback for navigation). Clean install/activate lifecycle with old cache cleanup.
- `src/main.tsx`: SW registration on window load, failure silently caught.

**Caveat:** The manifest declares icons at 192x192 and 512x512, but `favicon.png` is actually 32x32. Chrome will accept this for installability but icons will appear blurry. A proper 512x512 PNG should be generated for production use. Not a blocker.

### T03 — Lightbox (PASS)

- `src/components/lightbox.tsx`: Clean render-prop pattern (`children` receives `open` callback). Keyboard navigation (Escape, arrows), image counter, close button, prev/next buttons with `stopPropagation`. Adjacent image preloading. Anti-copy: `userSelect: none`, `draggable={false}`, `onContextMenu` prevention. `fade-in` animation via inline `<style>` tag.
- Integration in `colecoes.$slug.tsx` is clean — grid of clickable thumbnails triggers lightbox.

**Minor observation:** The lightbox image has `pointerEvents: "none"` which makes the `onClick` and `onContextMenu` handlers on the `<img>` element unreachable. The click passes through to the backdrop, closing the lightbox when the user clicks the image. This is acceptable but slightly surprising UX — ideally clicking on the image should do nothing. Consider wrapping the image in a container div with `onClick={stopPropagation}` while keeping `pointerEvents: none` on the img for anti-copy.

### T04 — Animations (PASS)

- `src/hooks/useReveal.ts`: Clean IntersectionObserver hook with `threshold: 0.2`, configurable direction (up/left/right/none) and delay. Properly respects `prefers-reduced-motion`. Observer disconnects after reveal (no ongoing observation). Inline styles with CSS transitions.
- `src/routes/index.tsx`: `Reveal` wrapper component applied to features (staggered 100ms), collections (staggered 120ms), testimonials (alternating left/right), and CTA section.

### T05 — Admin UX Polish (PASS)

- **Escape key:** Global keydown listener closes modal when visible (lines 1184-1192).
- **withGuard:** Helper disables button during async operation, re-enables in `finally` block (lines 1194-1205). Correct pattern for double-click prevention.
- **Drag-and-drop:** Global dragover/dragleave/drop listeners targeting `.upload-zone` elements. Drops file list into the hidden input and dispatches change event (lines 1207-1232).
- **Error handling with retry:** `init()` wraps each load function in try/catch, renders retry buttons on failure (lines 1234-1254).

### T06 — 404 Page (PASS)

- `NotFoundComponent` in `__root.tsx`: Themed 404 with star icon, "Esta carta nao esta no seu deck" message, and three navigation links (colecoes, home, WhatsApp with contextual message). Properly registered via `notFoundComponent` on the root route.

## Build Verification

```
bun run build — PASS (280ms, no errors, no warnings)
Output: dist/ with 4 assets (index.html, hero.jpg, CSS 28.84KB, JS 370.57KB)
```

## Architecture Quality

- **Separation of concerns:** SEO module cleanly separated. Lightbox is a reusable component. Reveal hook is generic.
- **No new dependencies added** (all implemented with vanilla browser APIs: IntersectionObserver, Service Worker, KeyboardEvent).
- **Accessibility:** `prefers-reduced-motion` respected in animations. Lightbox buttons have `aria-label`. Keyboard navigation supported.
- **Performance:** Lazy loading on images, SW caching strategy, body overflow locked during lightbox.

## Issues to Track (non-blocking)

| #   | Severity | Description                                                                                               |
| --- | -------- | --------------------------------------------------------------------------------------------------------- |
| 1   | Low      | Dead code in `seo.ts`: `getHomeMetaTags`, `getCollectionMetaTags`, `generateSitemap` unused               |
| 2   | Low      | PWA icons declared as 192x192/512x512 but actual `favicon.png` is 32x32                                   |
| 3   | Low      | Lightbox image `pointerEvents: none` makes clicking image close the lightbox (passes through to backdrop) |

## Verdict

**APPROVED** — All 6 implemented tasks are solid, build passes, no regressions detected, and the deferred T07 is appropriately gated on dependency approval. The observations above are minor and can be addressed in a future polish pass.
