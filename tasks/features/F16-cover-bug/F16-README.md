# F16 — Bug: Troca de capa da colecao no admin nao reflete no site

**Status:** planned
**Type:** bugfix
**Priority:** P1

## Problema Reportado

Ao trocar a capa da colecao Castlevania via painel admin, o site continua
exibindo a imagem padrao. Ao inspecionar o elemento no site, o `src` da imagem
aponta para `/images/covers/cavaleiros-do-zodiaco.jpg` — o que indica um
mapeamento incorreto entre colecao e imagem de capa.

A capa alterada aparece corretamente na area administrativa.

## Hipoteses de Causa-Raiz

1. **Dados baked no bundle Vite**: `collections.json` e importado via
   `import ... from "@/data/collections.json"` em `store-data.ts`. Isso
   significa que os dados sao embutidos no JS em build time. Mesmo que o admin
   atualize o JSON no disco, o bundle em `dist/` contem dados velhos ate um
   rebuild.

2. **Mapeamento slug-imagem corrompido**: O JSON pode estar com o campo
   `image` apontando para o slug errado apos edicao concorrente ou bug no
   endpoint de update.

3. **Cache do browser/CDN**: O path da imagem nao muda (`/images/covers/castlevania.jpg`),
   e o site estatico nao adiciona cache-bust. O admin adiciona `?v=mtime` no
   response mas o bundle front-end nao.

4. **git-persist falhou silenciosamente**: Se o push nao completou, o Render
   deploy rebuilda com dados antigos.

5. **Render serve de `dist/` em vez de `public/`**: Para assets mutaveis, o
   admin server prioriza `public/` — mas se houver fallback para `dist/`,
   a imagem velha de build pode prevalecer.

6. **CollectionCard nao mostra a capa**: O componente `card-tile.tsx` exibe
   `sampleImages` em flip, usando `collection.image` apenas como fallback.
   O usuario pode estar confundindo a sample image com a capa.

## Arquivos Relevantes

| Arquivo | Papel |
|---------|-------|
| `src/data/collections.json` | Fonte de dados das colecoes |
| `src/lib/store-data.ts` | Import estatico do JSON (baked at build) |
| `src/components/card-tile.tsx` | Card na listagem (mostra sampleImages, nao cover) |
| `src/routes/colecoes.$slug.tsx:74` | Pagina detalhe: exibe `collection.image` como cover |
| `admin/src/server.ts:374-406` | Endpoint POST `/api/collections/:slug/cover` |
| `admin/src/server.ts:260-277` | GET `/api/collections` (adiciona cache-bust `?v=mtime`) |
| `admin/src/server.ts:768-772` | Static file serving: prioridade `public/` > `dist/` para mutaveis |
| `admin/public/index.html:1928-1980` | Funcao `uploadCover()` no frontend admin |
| `admin/src/lib/git-persist.ts` | Pipeline de commit+push automatico |

## Tasks

| Task | Titulo | Wave |
|------|--------|------|
| F16-T01 | Diagnosticar mapeamento slug-imagem no JSON e no bundle | W1 |
| F16-T02 | Verificar pipeline de upload de capa e git-persist end-to-end | W1 |
| F16-T03 | Corrigir causa-raiz identificada e adicionar cache-bust no front-end | W2 |
| F16-T04 | Validar fix em ambiente local (dev + preview) | W3 |

**Waves:** 3
**Total tasks:** 4
