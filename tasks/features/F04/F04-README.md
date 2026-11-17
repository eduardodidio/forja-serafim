# Feature F04 — Rebrand & Migration to Forja Serafim

**Status:** done
**Owner:** @eduardodidio

## Goal

Migrar todo o projeto do repo `serafim-arcana-forge` para o novo repo `forja-serafim`,
rebrandando de "A Casa do Serafim" para "Forja Serafim" em todos os arquivos,
trocando favicon/logo pelo novo `logoForjaSerafim.jpeg`, e atualizando nomes de
servicos, packages, SEO, PWA, watermarks, admin, agent prompts, docs e Render config.

## Architecture impact

- **Todos os layers** sao afetados (renaming across the board)
- Nenhuma mudanca funcional — apenas rebrand + migracao de repo
- Layers: src/ (componentes, rotas, SEO, styles), admin/ (server, CLI, UI),
  agents/, docs/, tasks/, config files (package.json, render.yaml, manifest.json, etc.)

## Waves

- **Wave 0**: F04-T01, F04-T02 (setup: copiar codigo para novo repo, gerar favicon do logo)
- **Wave 1**: F04-T03, F04-T04, F04-T05 (rebrand: config files, source code, admin)
- **Wave 2**: F04-T06, F04-T07 (rebrand: agents/docs, SEO/PWA)
- **Wave 3**: F04-T08 (Render config + deploy prep)
- **Wave 4**: F04-T09 (validacao final, build test, cleanup)

## Global acceptance criteria

- [ ] Todo o codigo fonte presente em `C:/Workspace/forja-serafim`
- [ ] Zero referencias a "A Casa do Serafim" ou "serafim-arcana-forge" em arquivos ativos
- [ ] Novo favicon gerado a partir do `logoForjaSerafim.jpeg` (ico, png, svg)
- [ ] `bun run build` passa sem erros no novo repo
- [ ] `bun run dev` funciona no novo repo
- [ ] Render config aponta para novos service names
- [ ] CLAUDE.md e MEMORY.md atualizados para o novo contexto
- [ ] Historico git preservado
- [ ] All diagrams updated
- [ ] Tech Lead approved
- [ ] QA passed

## Diagrams

- `docs/diagrams/F04-architecture.mmd`
- `docs/diagrams/F04-journey.mmd`

## Scope of renaming (reference)

### Brand name mappings

| Old                   | New                 |
| --------------------- | ------------------- |
| A Casa do Serafim     | Forja Serafim       |
| Casa do Serafim       | Forja Serafim       |
| casa-do-serafim       | forja-serafim       |
| casa-do-serafim-admin | forja-serafim-admin |
| serafim-arcana-forge  | forja-serafim       |
| serafim-admin         | forja-serafim-admin |

### Files affected (non-exhaustive, ~70+ occurrences)

- package.json, admin/package.json, bun.lock, package-lock.json
- render.yaml
- public/manifest.json
- index.html
- CLAUDE.md, AGENTS.md, README.md, admin/README.md, docs/README.md
- src/lib/seo.ts, src/routes/index.tsx, src/routes/sobre.tsx, src/routes/colecoes.$slug.tsx
- src/components/site-header.tsx, src/components/site-footer.tsx
- src/styles.css
- admin/src/server.ts, admin/src/cli.ts, admin/src/lib/image-processor.ts
- admin/public/index.html, admin/public/login.html
- scripts/process-images.ts
- agents/prompts/_.md, agents/orchestrator.md, agents/workflows/_.md
- .claude/commands/*.md
- docs/adr/_.md, docs/diagrams/_.md, docs/estrategia-negocio-serafim.html
- tasks/features/ (historical — rename for consistency)
- public/favicon.ico, public/favicon.png, public/favicon.svg
