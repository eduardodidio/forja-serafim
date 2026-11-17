# Feature F05 — Site Visual Polish

**Status:** done
**Owner:** @eduardodidio
**PRD:** (inline — small feature)

## Goal

Substituir o icone SVG de asas/espada pelo logo real da Forja Serafim, exibir 6 amostras por colecao (grid 3x2), e tornar a watermark mais evidente.

## Architecture impact

- `src/components/site-header.tsx` — logo image replaces WingsIcon
- `src/routes/index.tsx` — logo image in ThemeBuilderSection
- `src/data/collections.json` — 6th sample image per collection
- `admin/src/lib/image-processor.ts` — watermark visibility increase
- `public/images/` — logo file placement

## Waves

- **Wave 0**: F05-T01 (logo file setup)
- **Wave 1**: F05-T02, F05-T03, F05-T04 (header, theme section, watermark — parallel)
- **Wave 2**: F05-T05 (6th sample image per collection)
- **Wave 3**: F05-T06 (build validation + cleanup)

## Global acceptance criteria

- [ ] Logo real aparece no header e secao "tema personalizado"
- [ ] WingsIcon nao e mais usado em nenhuma pagina
- [ ] 6 sample images por colecao no JSON
- [ ] Watermark mais visivel nas imagens processadas
- [ ] `bun run build` passa sem erros

## Diagrams

- N/A (visual polish, no architecture changes)
