# Feature F12 — Project Review: Bug Fixes & Flow Hardening

**Status:** done
**Owner:** @eduardodidio
**PRD:** (inline — review/bugfix feature)

## Objetivo

Revisao completa do projeto Forja Serafim focando em bugs confirmados, falhas de fluxo,
race conditions, validacao insuficiente e inconsistencias de configuracao.

## Achados da Auditoria

### Critico / Alto

| #   | Area         | Descricao                                                                 |
| --- | ------------ | ------------------------------------------------------------------------- |
| 1   | Admin Server | `Bun.write()` nao eh awaited em 3 locais — race condition em uploads      |
| 2   | PWA          | `index.html` sem `<link rel="manifest">` — PWA nao detectavel pre-hydrate |
| 3   | PWA          | `manifest.json` declara mesmo arquivo com sizes diferentes (192/512)      |

### Medio

| #   | Area          | Descricao                                                              |
| --- | ------------- | ---------------------------------------------------------------------- |
| 4   | Admin Server  | Upload de PDF so valida extensao, nao MIME type                        |
| 5   | Admin data-io | `writeJson` renameSync pode falhar e deixar tmp orphan                 |
| 6   | Admin Server  | Slugs de URL nao validados (defense-in-depth contra path traversal)    |
| 7   | Admin Server  | Campo text de testimonial sem limite de tamanho                        |
| 8   | Admin Server  | Erros de processamento de imagem silenciados — user ve sucesso parcial |
| 9   | Admin Server  | Cleanup de tmp silenciosamente ignorado em caso de falha               |
| 10  | Docs          | CLAUDE.md diz "TanStack Start" mas projeto usa apenas TanStack Router  |

### Baixo

| #   | Area | Descricao                                                              |
| --- | ---- | ---------------------------------------------------------------------- |
| 11  | Lint | eslint `no-unused-vars` desabilitado — esconde dead code               |
| 12  | Data | Moxfield URLs vazias em collections.json (UI trata, mas inconsistente) |

## Waves

### Wave 0 — Server Hardening (sequencial — tudo toca server.ts/data-io.ts)

- **F12-T01**: Await `Bun.write()` + PDF MIME validation + slug sanitization + writeJson safety + error reporting

### Wave 1 — PWA & Manifest Fixes

- **F12-T02**: Adicionar `<link rel="manifest">` em index.html + corrigir icons no manifest.json

### Wave 2 — Validacao & Docs (paralelo)

- **F12-T03**: Limite de tamanho em testimonial + input validation hardening
- **F12-T04**: Atualizar CLAUDE.md (stack real) + eslint no-unused-vars para warn

## Criterios de Aceite Globais

- Zero race conditions em upload de arquivos
- PWA passa no Lighthouse manifest check
- Nenhum input de usuario chega sem validacao
- Erros de processamento reportados ao frontend
- Docs refletem a stack real
