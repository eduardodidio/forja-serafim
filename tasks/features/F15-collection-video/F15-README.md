# Feature F15 — Video demonstrativo por colecao

**Status:** planned
**Owner:** @eduardodidio
**PRD:** N/A (feature request)

## Goal

Cada colecao tera um video curto demonstrativo exibido ao fim da pagina de detalhes.
O Anderson podera importar/remover videos pela area administrativa, seguindo o mesmo
padrao de upload de capas e manuais.

## Architecture impact

- **src/data/collections.json** — novo campo `videoUrl` (string, default `""`)
- **src/lib/store-data.ts** — tipo `Collection` ganha `videoUrl: string`
- **admin/src/lib/paths.ts** — novo export `VIDEOS_DIR` apontando para `public/videos/decks`
- **admin/src/server.ts** — dois novos endpoints:
  - `POST /api/collections/:slug/video` — upload de video (MP4, max 50 MB)
  - `DELETE /api/collections/:slug/video` — remove video e limpa `videoUrl`
- **admin/public/index.html** — secao de upload/preview/remocao de video no editor de colecao
- **src/routes/colecoes.$slug.tsx** — secao de video player ao fim da pagina (antes do CTA WhatsApp)

## Constraints

- Apenas MP4 aceito (formato universal, funciona em todos os browsers)
- Limite de 50 MB por video (videos curtos demonstrativos)
- Video armazenado em `public/videos/decks/<slug>.mp4`
- Player HTML5 nativo com `controls`, sem autoplay, com `preload="metadata"`
- Video protegido com `controlsList="nodownload"` e `onContextMenu` preventDefault
- gitPersist chamado apos upload/delete para auto-commit

## Waves

- **Wave 0**: F15-T01 (data model: tipo Collection + collections.json + paths.ts)
- **Wave 1**: F15-T02 (backend: endpoints de upload e delete de video no server.ts)
- **Wave 2**: F15-T03, F15-T04 (paralelo — admin UI + frontend player)

## Global acceptance criteria

- [ ] Campo `videoUrl` existe em todas as colecoes no collections.json (default `""`)
- [ ] Upload de video MP4 via admin funciona e persiste no git
- [ ] Remocao de video via admin funciona e limpa o campo
- [ ] Pagina de colecao exibe player de video quando `videoUrl` nao vazio
- [ ] Player nao faz autoplay, mostra controls nativos
- [ ] Video protegido contra download facil (controlsList + contextmenu)
- [ ] Videos maiores que 50 MB sao rejeitados com mensagem clara
- [ ] Formatos nao-MP4 sao rejeitados
- [ ] `bun run build` sucesso
- [ ] Todas as tasks implementadas e testadas

## Diagrams

- Architecture: `docs/diagrams/F15-architecture.mmd`
- User Journey: `docs/diagrams/F15-journey.mmd`
