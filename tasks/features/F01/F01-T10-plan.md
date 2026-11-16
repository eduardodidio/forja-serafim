# F01-T10: Admin CLI — Implementation Plan

## Architecture Decisions

1. **Data format**: Two JSON files — `src/data/collections.json` + `src/data/testimonials.json`
2. **CLI framework**: `@inquirer/prompts` (interactive, ESM-native)
3. **How Anderson runs**: `bun run admin` from project root (menu interativo)
4. **Images**: Anderson extrai manualmente e aponta a pasta para o CLI

## Data Schema

### src/data/collections.json
```json
[
  {
    "slug": "castlevania",
    "name": "Castlevania",
    "image": "/images/covers/castlevania.jpg",
    "description": "Castelo eterno, cacadores e a noite sem fim sob a lua de sangue.",
    "cardCount": 119,
    "sampleImages": ["/images/decks/castlevania/a-dracula-senhor-das-trevas-comandante.jpg"],
    "moxfieldUrl": "",
    "deckcheckUrl": "",
    "manualUrl": ""
  }
]
```

### src/data/testimonials.json
```json
[]
```

## CLI Commands

| Command | Descricao |
|---------|-----------|
| `list-collections` | Lista colecoes (tabela) |
| `add-collection` | Adiciona colecao interativamente |
| `edit-collection` | Edita campos de uma colecao |
| `remove-collection` | Remove colecao |
| `process-images` | Watermark+resize imagens, seleciona amostras |
| `set-cover` | Define imagem de capa de colecao |
| `set-deckcheck-url` | Define URL do DeckCheck |
| `set-moxfield-url` | Define URL do Moxfield |
| `upload-manual` | Copia PDF para public/manuals/{slug}.pdf |
| `manage-testimonials` | CRUD de depoimentos (add/edit/remove/list) |

## Subtasks

### T10.1: Migrar dados para JSON + refatorar store-data.ts
- Criar `src/data/collections.json` com as 3 colecoes existentes
- Criar `src/data/testimonials.json` como `[]`
- Mover cover images de `src/assets/col-*.jpg` para `public/images/covers/{slug}.jpg`
- Refatorar `store-data.ts`: importar de JSON, exportar tipos
- Adicionar tipo `Testimonial` e export `testimonials`
- Atualizar `index.tsx` para importar testimonials do store-data
- Verificar build

### T10.2: Scaffold admin project
- Criar `admin/package.json` (deps: `@inquirer/prompts`, `sharp`)
- Criar `admin/tsconfig.json`
- Criar `admin/src/cli.ts` com menu principal e roteamento
- Criar libs: `paths.ts`, `data-io.ts`, `slug.ts`
- Adicionar scripts no root `package.json`

### T10.3: CRUD de colecoes
- add-collection, edit-collection, remove-collection, list-collections

### T10.4: Processamento de imagens
- Extrair logica de watermark de `scripts/process-images.ts`
- process-images command (interativo, seleciona amostras)
- set-cover command

### T10.5: URLs e manual PDF
- set-url command (deckcheck + moxfield)
- upload-manual command
- Criar `public/manuals/` com `.gitkeep`

### T10.6: Depoimentos
- manage-testimonials com sub-menu add/edit/remove/list

### T10.7: README do Anderson + teste end-to-end
- README.md em portugues com exemplos de cada comando
- Teste completo do fluxo

## File Structure

```
admin/
  package.json
  tsconfig.json
  src/
    cli.ts
    commands/
      add-collection.ts
      edit-collection.ts
      remove-collection.ts
      list-collections.ts
      process-images.ts
      set-cover.ts
      set-url.ts
      upload-manual.ts
      manage-testimonials.ts
    lib/
      data-io.ts
      image-processor.ts
      slug.ts
      paths.ts
  README.md
src/data/
  collections.json
  testimonials.json
public/images/covers/
  castlevania.jpg
  cavaleiros-do-zodiaco.jpg
  final-fantasy-vii.jpg
public/manuals/
  .gitkeep
```
