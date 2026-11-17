# F01: Reestruturar Landing Page da Casa do Serafim

**Status:** in_progress
**Created:** 2026-11-16
**Owner:** Eduardo Didio (dev) / Anderson Serafim (product owner)

## Summary

Strip Lovable boilerplate, keep only 3 real MTG proxy decks (Castlevania,
Cavaleiros do Zodiaco, Final Fantasy VII), add WhatsApp contact, art protection,
Moxfield/Deckcheck links, and a local admin CLI for Anderson to manage content.

## Waves

### Wave 0 — Cleanup (sequential)

| Task | Title                                                           | Status    |
| ---- | --------------------------------------------------------------- | --------- |
| T01  | Replace Lovable vite config with standard TanStack Start config | completed |
| T02  | Remove Lovable boilerplate files and references                 | completed |
| T03  | Remove unused routes, cart store, and e-commerce logic          | completed |
| T04  | Remove unused shadcn/ui components and slim dependencies        | completed |

### Wave 1 — Data restructuring (sequential)

| Task | Title                                                               | Status    |
| ---- | ------------------------------------------------------------------- | --------- |
| T05  | Restructure store-data.ts for 3 real decks with new schema          | completed |
| T06  | Extract sample images from deck ZIPs and prepare watermarked assets | completed |

### Wave 2 — UI implementation (parallel after Wave 1)

| Task | Title                                                                      | Status    |
| ---- | -------------------------------------------------------------------------- | --------- |
| T07  | Rewrite landing page (index.tsx) for 3-deck showcase                       | completed |
| T08  | Rewrite collection detail page with art protection and external deck links | completed |
| T09  | Update header, footer, and navigation for new site structure               | completed |

### Wave 3 — Admin tool (parallel with Wave 2)

| Task | Title                                                   | Status  |
| ---- | ------------------------------------------------------- | ------- |
| T10  | Scaffold admin tool as a separate local CLI application | planned |

### Wave 4 — Documentation

| Task | Title                                         | Status  |
| ---- | --------------------------------------------- | ------- |
| T11  | Update documentation (ADRs, diagrams, README) | planned |

## Dependency Graph

```
T01 → T02 → T03 → T04 → T05 → T06 → T07, T08 (parallel)
                    └→ T09 (parallel with T05+)
                         T06 → T10 (parallel with Wave 2)
                         All → T11
```

## Risks

| Risk                                                       | Impact | Mitigation                                        |
| ---------------------------------------------------------- | ------ | ------------------------------------------------- |
| Replacing `@lovable.dev/vite-tanstack-config` breaks build | High   | Do first, inspect package source, test thoroughly |
| sharp fails on Windows                                     | Medium | Fallback to Jimp (pure JS)                        |
| TanStack route generation breaks after deleting routes     | Medium | Run dev to trigger auto-gen                       |
