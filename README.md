# Forja Serafim

Loja de proxies full art premium para Magic: The Gathering.
Landing page estatica com painel admin web para gestao de conteudo.

> **Proprietario:** Anderson Serafim — [WhatsApp](https://wa.me/5551984315964)
> **Site:** [forjaserafim.com.br](https://forjaserafim.com.br)

---

## Stack

| Camada           | Tecnologia                                               |
| ---------------- | -------------------------------------------------------- |
| Frontend         | React 19 + TanStack Router (file-based) + TypeScript     |
| Styling          | Tailwind CSS v4 + design system custom (gold/dark theme) |
| Icons            | Lucide React                                             |
| Build            | Vite 8 + Bun                                             |
| Admin Server     | Bun.serve (REST API)                                     |
| Auth             | Google OAuth2 (email whitelist)                          |
| Image Processing | sharp (resize + watermark SVG)                           |
| Hosting          | Render.com (single web service)                          |
| Repo             | GitHub (auto-persist from admin)                         |

## Arquitetura

```
Browser (SPA)
  └── Vite + React 19 + TanStack Router
        ├── Pages: /, /colecoes, /colecoes/$slug, /sobre, /contato
        ├── Components: PageShell, SiteHeader, SiteFooter, CollectionCard, Lightbox, Card3DTilt
        └── Data: collections.json, testimonials.json, settings.json

Admin Server (Bun.serve)
  ├── /login         → Google OAuth2
  ├── /admin/        → Painel web (SPA HTML)
  ├── /api/*         → REST API (CRUD colecoes, depoimentos, settings)
  │     ├── Upload de imagens → sharp resize + watermark → public/images/
  │     ├── Upload de videos → public/videos/decks/
  │     └── Upload de PDFs → public/manuals/
  └── git-persist    → auto commit + push para GitHub (fila serial)
```

Diagramas completos em [`docs/diagrams/`](./docs/diagrams/).

## Colecoes

| Colecao               | Cartas | Deck Reference                                             |
| --------------------- | ------ | ---------------------------------------------------------- |
| Castlevania           | 119    | [DeckCheck](https://deckcheck.co/app/builder/9g2_y6GTfdaf) |
| Cavaleiros do Zodiaco | 147    | [DeckCheck](https://deckcheck.co/app/builder/T7W3nZ6zFfUJ) |
| Final Fantasy VII     | 112    | [DeckCheck](https://deckcheck.co/app/builder/T7W3nZ6zFfUJ) |

## Desenvolvimento

### Pre-requisitos

- [Bun](https://bun.sh/) >= 1.0
- Node.js >= 18 (para sharp no admin)

### Setup

```bash
bun install
cd admin && bun install && cd ..
```

### Comandos

| Comando             | Descricao                                    |
| ------------------- | -------------------------------------------- |
| `bun run dev`       | Dev server em http://localhost:8080          |
| `bun run build`     | Build de producao (dist/)                    |
| `bun run preview`   | Preview do build                             |
| `bun run lint`      | ESLint                                       |
| `bun run format`    | Prettier                                     |
| `bun run admin`     | Admin server em http://localhost:3001/admin/ |
| `bun run admin:cli` | Admin CLI interativo                         |

### Variaveis de ambiente (admin)

| Variavel             | Descricao                                                 |
| -------------------- | --------------------------------------------------------- |
| `GOOGLE_CLIENT_ID`   | Client ID do Google OAuth (`.apps.googleusercontent.com`) |
| `ALLOWED_EMAILS`     | Emails autorizados (separados por virgula)                |
| `GITHUB_TOKEN`       | PAT com scope `repo` (para auto-persist)                  |
| `RENDER_DEPLOY_HOOK` | URL do deploy hook do Render                              |

Sem essas variaveis, o admin roda em modo local (sem auth).

## Deploy (Render)

Servico unico definido em [`render.yaml`](./render.yaml):

1. **Build**: instala Bun, `bun install` (root + admin), `bun run build`
2. **Start**: `bun admin/src/server.ts` (serve SPA + admin + API)
3. O server serve:
   - `dist/` — site estatico buildado
   - `public/` — assets mutaveis (covers, decks, manuals, videos)
   - `/admin/` — painel admin
   - `/api/*` — REST API
   - SPA fallback para `dist/index.html`

## Funcionalidades

### Landing Page

- Hero com imagem full-width
- Grid de features (arte autoral, impressao premium, opcao foil, decks tematicos)
- Catalogo de colecoes com card flip animation
- Secao "Cole sua lista" (textarea → WhatsApp)
- Secao "Escolha o tema" (formulario → WhatsApp)
- Depoimentos de clientes
- CTA final
- Lightbox com 3D tilt e navegacao por teclado
- Dark/light theme toggle
- PWA (service worker + manifest)
- SEO (meta tags, Open Graph, JSON-LD, sitemap)
- 404 tematico

### Admin Panel

- Google OAuth2 (email whitelist)
- CRUD de colecoes (nome, descricao, cardCount, URLs)
- Upload de capa (resize automatico 1200px)
- Upload de amostras (resize 600px + watermark "Forja Serafim")
- Reordenacao de imagens
- Upload de manual PDF
- Upload/remocao de video demo (MP4, max 50MB)
- CRUD de depoimentos
- Configuracao de URL do WhatsApp
- Publicacao (build + git commit + push)
- Status de persistencia (clean/dirty/pushing/error)
- Auto-persist: cada mutacao faz commit+push automatico para GitHub

### Protecao de arte

- Watermark "Forja Serafim" em 5 linhas diagonais (SVG compositing)
- Resolucao reduzida (600px largura)
- CSS: `user-select: none`, `pointer-events: none`, `draggable: false`
- Context menu bloqueado (`onContextMenu preventDefault`)

## Estrutura do Projeto

```
forja-serafim/
├── src/
│   ├── routes/           # Paginas (file-based routing)
│   │   ├── __root.tsx    # Layout + 404
│   │   ├── index.tsx     # Home
│   │   ├── colecoes.index.tsx
│   │   ├── colecoes.$slug.tsx
│   │   ├── sobre.tsx
│   │   └── contato.tsx
│   ├── components/       # Componentes reutilizaveis
│   ├── hooks/            # Custom hooks (useReveal)
│   ├── lib/              # Utils, store, SEO, cache-bust
│   ├── data/             # JSONs de dados (collections, testimonials, settings)
│   ├── assets/           # Hero image
│   └── styles.css        # Design system (Tailwind v4 + custom utilities)
├── admin/
│   ├── src/
│   │   ├── server.ts     # Bun HTTP server (API + static + SPA)
│   │   ├── cli.ts        # CLI interativo (inquirer)
│   │   ├── lib/          # git-persist, image-processor, data-io, paths, slug
│   │   ├── commands/     # CLI commands
│   │   └── scripts/      # Utilities (rewatermark)
│   └── public/           # Admin HTML (login + panel)
├── public/               # Static assets
│   ├── images/covers/    # Capas das colecoes
│   ├── images/decks/     # Amostras com watermark
│   ├── images/tokens/    # Tokens com watermark
│   ├── manuals/          # PDFs dos manuais
│   ├── videos/decks/     # Videos demo
│   ├── sw.js             # Service worker
│   └── manifest.json     # PWA manifest
├── docs/
│   ├── diagrams/         # Diagramas Mermaid
│   ├── adr/              # Architecture Decision Records
│   └── prd/              # Product Requirements
├── tasks/features/       # Task manifests (F01-F18)
├── CLAUDE.md             # Agent instructions
├── render.yaml           # Render blueprint
└── package.json
```

## Changelog

| Feature     | Descricao                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| **F18**     | Git-persist hardening: retry com backoff, structured logging, historico de operacoes no admin                   |
| **F17**     | Tokens: upload com watermark, gestao no admin (CRUD + reorder), modal na landing page (Card3DTilt + qty badge) |
| **F15**     | Video demonstrativo por colecao (upload, player, admin UI)                                                     |
| **F14**     | -                                                                                                              |
| **F13**     | Auto-persist admin changes to git (serial queue + dirty-state banner)                                          |
| **F05-F12** | Fixes diversos (cover upload, cache-bust, auth, health endpoint)                                               |
| **F04**     | Rebrand para "Forja Serafim" (novo logo, favicon, migracao de repo)                                            |
| **F03**     | SEO, PWA, lightbox, animacoes, admin UX polish, 404 tematico                                                   |
| **F02**     | Redesign do painel admin (tema escuro premium, acentos dourados)                                               |
| **F01**     | Build inicial (dados, UI, admin CLI, componentes base)                                                         |

## Documentacao

- [Diagramas tecnicos](./docs/diagrams/) — arquitetura, fluxos, componentes, deploy, seguranca
- [ADRs](./docs/adr/) — decisoes de arquitetura
- [PRDs](./docs/prd/) — requisitos de produto

---

Este projeto nao e afiliado a Wizards of the Coast. Magic: The Gathering e seus
respectivos nomes sao marcas registradas de seus proprietarios. As proxies
produzidas destinam-se exclusivamente ao uso casual, colecionismo e
personalizacao artistica, nao sendo validas para torneios oficiais.

&copy; Forja Serafim. Todos os direitos reservados.
