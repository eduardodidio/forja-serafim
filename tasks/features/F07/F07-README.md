# Feature F07 — Admin: Gestao completa de sample cards

**Status:** done
**Owner:** @eduardodidio

## Goal

Permitir gerenciamento completo das 6 imagens de amostra por colecao no admin:
upload durante criacao, remocao individual, reordenacao, e aviso de marca d'agua.

## Architecture impact

- `admin/public/index.html` — UI: grid de samples com remove/reorder, upload na criacao, banner watermark
- `admin/src/server.ts` — API: DELETE image individual, PUT reorder
- `src/data/collections.json` — sampleImages array (sem mudanca estrutural)

## Waves

- **Wave 0**: F07-T01 (API: endpoint DELETE image + endpoint reorder)
- **Wave 1**: F07-T02, F07-T03 (UI: grid gerenciavel no edit + upload na criacao — paralelo)
- **Wave 2**: F07-T04 (banner de aviso de watermark + limite de 6 com validacao)

## Global acceptance criteria

- [ ] Sample images podem ser removidas individualmente via admin
- [ ] Sample images podem ser reordenadas via admin
- [ ] Upload de samples disponivel durante criacao de colecao
- [ ] Limite de 6 images validado no frontend e backend
- [ ] Banner de aviso sobre marca d'agua visivel ao fazer upload
- [ ] `bun run build` passa sem erros
