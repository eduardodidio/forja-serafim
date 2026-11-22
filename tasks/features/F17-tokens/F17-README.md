# F17 — Tokens: upload, marca d'agua e exibicao com modal

**Status:** planned
**Created:** 2026-11-19
**Decision:** D-20261119-001 (Gandalf: executed)

## Problem

Colecoes de MTG proxy incluem tokens (cartas especiais) que acompanham o deck. Atualmente nao ha como o Anderson cadastrar tokens nem exibi-los na landing page. O cliente nao sabe quais tokens acompanham cada deck.

## Solution

1. **Data model**: Adicionar array `tokens` em cada Collection, onde cada token tem `image` (path), `name` (string) e `quantity` (number).
2. **Backend**: Novos endpoints para upload, remocao e reordenacao de tokens — mesma logica de sampleImages, com watermark via sharp.
3. **Admin UI**: Nova secao "Tokens" nos modais de criar/editar colecao, com upload de imagem + campo de quantidade.
4. **Landing page**: Icone/botao de tokens abaixo do grid de cards e antes dos links DeckCheck/Manual. Ao clicar, abre modal no estilo do site mostrando tokens com nome e quantidade.

## Architecture

### Data model (collections.json)

```json
{
  "tokens": [
    { "image": "/images/tokens/castlevania/token-name.jpg", "name": "Bat Token", "quantity": 3 }
  ]
}
```

### Endpoints (admin/src/server.ts)

- `POST /api/collections/:slug/tokens` — upload token images (multipart, with quantity in FormData)
- `DELETE /api/collections/:slug/tokens/:filename` — remove a token
- `PUT /api/collections/:slug/tokens/reorder` — reorder tokens
- `PUT /api/collections/:slug` — already handles full collection update (tokens included)

### Storage

- Token images: `public/images/tokens/{slug}/{safeName}.jpg`
- Watermarked at 600px max width (same as sampleImages)

### Frontend (landing page)

- New `TokensModal` component in `src/components/tokens-modal.tsx`
- Token trigger button in collection detail page (`src/routes/colecoes.$slug.tsx`)
- Positioned between card grid and DeckCheck/Manual links section

## Tasks

| Task    | Wave | Description                                      |
| ------- | ---- | ------------------------------------------------ |
| F17-T01 | 0    | Extend data model + backend endpoints for tokens |
| F17-T02 | 0    | Token image storage + watermark processing       |
| F17-T03 | 1    | Admin panel: token upload/manage UI              |
| F17-T04 | 1    | Landing page: token button + modal               |

## Waves

- **Wave 0** (2 tasks, parallel): Backend — data model + endpoints + image processing
- **Wave 1** (2 tasks, parallel): Frontend — admin UI + landing page modal

## Global acceptance criteria

- [ ] Tokens can be uploaded with name and quantity via admin
- [ ] Uploaded tokens receive watermark (same pattern as cards)
- [ ] Tokens appear on landing page with correct quantity
- [ ] Modal follows existing site design (dark, gold accents, Card3DTilt)
- [ ] gitPersist triggers after token mutations
- [ ] All existing card functionality unaffected

## Diagrams

- `docs/diagrams/F17-architecture.mmd`
- `docs/diagrams/F17-journey.mmd`
