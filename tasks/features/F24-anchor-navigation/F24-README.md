# F24 — Convert all navigation to anchor-based single-page scrolling

**Status:** complete
**Created:** 2026-11-25
**Description:** Replace route-based navigation with anchor links that scroll to sections on the homepage. Merge /sobre and /contato content into the homepage. Keep /colecoes/$slug for individual collection pages.

## Summary

The site currently has separate pages for Sobre and Contato. The user wants a true single-page experience where all nav links scroll to sections on the homepage. The /colecoes/$slug route stays for individual deck pages, but the top-level nav becomes fully anchor-based.

## Desired Nav Order

1. Home -> `/#home` (top)
2. Colecoes -> `/#colecoes`
3. Sobre -> `/#sobre`
4. Valores -> `/#valores`
5. Contato -> `/#contato` (last)

## Homepage Section Order (after change)

1. Hero (`#home`)
2. Features
3. Collections (`#colecoes`)
4. DeckList
5. ThemeBuilder
6. Pricing (`#valores`)
7. Shipping (`#frete`)
8. Sobre (`#sobre`) — merged from /sobre route
9. Testimonials
10. Contato (`#contato`) — merged from /contato route
11. CTA Final

## Tasks

| Task | Title | Wave | Depends |
|------|-------|------|---------|
| T01 | Add id anchors to existing homepage sections + smooth scroll CSS | W1 | — |
| T02 | Create SobreSection component from /sobre route content | W1 | — |
| T03 | Create ContatoSection component from /contato route content | W1 | — |
| T04 | Convert header to all-anchor navigation | W1 | — |
| T05 | Convert footer to all-anchor navigation | W1 | — |
| T06 | Wire new sections into index.tsx + remove old routes + build check | W2 | T01-T05 |

## Waves

- **Wave 1 (5 tasks, parallel):** All independent — anchors, new components, header/footer conversion
- **Wave 2 (1 task):** Integration wiring, route cleanup, final build/lint
