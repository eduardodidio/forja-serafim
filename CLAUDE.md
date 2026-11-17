# CLAUDE.md

Project: **Forja Serafim**
Stack: **Vite + React 19 + TanStack Router + TypeScript + Tailwind CSS v4**
Framework: [claude-didio-config](https://github.com/eduardodidio/claude-didio-config)

## Mission

Landing page estatica premium para loja de proxies full art de Magic: The Gathering.
Proprietario: Anderson Serafim. WhatsApp: +55 51 8431-5964.
O site exibe colecoes/decks de proxies tematicas e direciona o cliente para contato via WhatsApp.
Area administrativa separada para que o Anderson faca manutencao dos decks sem depender de desenvolvedor.

## Architecture

Vite + React 19 com TanStack Router (file-based routing, client-side SPA).
Layout:

- src/routes/ — paginas (file-based routing via TanStack Router)
- src/components/ — componentes reutilizaveis (page-shell, card-tile, header, footer)
- src/lib/ — dados, store (zustand-like), utils
- src/assets/ — imagens das colecoes e hero
- decks/ — ZIPs com os decks reais do Anderson (Castlevania, Cavaleiros do Zodiaco, Final Fantasy VII)
- public/ — favicon, robots.txt

A landing page eh estatica. Os dados dos decks/colecoes vem de arquivos JSON/TS locais.
A area admin sera uma aplicacao separada (local) que gera/atualiza os dados do site.

## Commands

- **Build:** `bun run build`
- **Dev:** `bun run dev`
- **Preview:** `bun run preview`
- **Lint:** `bun run lint`
- **Format:** `bun run format`

## Agent Workflow

This project uses the **4-agent Waves workflow** from claude-didio-config:

1. **Architect** — plans minimal tasks grouped in parallel Waves.
   Wave 0 front-loads permissions/setup.
2. **Developer** — implements each task in a clean bash context.
3. **Tech Lead** — reviews architecture, tests, diagrams.
4. **QA** — validates end-to-end and fills test gaps.

All agents run via `didio spawn-agent <role>` in isolated bash processes.
Logs: `logs/agents/*.jsonl`. Dashboard: `didio dashboard`.

### Trigger a feature

```
/create-feature F01 <short description of the feature>
```

See `agents/orchestrator.md` for the full pipeline and
`agents/workflows/feature-workflow.md` for the quality gates.

## Project Layout

```
.
├── CLAUDE.md                    (this file)
├── docs/
│   ├── adr/                     Architecture Decision Records
│   ├── prd/                     Product Requirements Documents
│   ├── diagrams/                Mermaid flowcharts (live docs)
│   └── README.md                Docs index
├── tasks/
│   └── features/                Per-feature task manifests + task files
├── agents/
│   ├── orchestrator.md
│   ├── workflows/feature-workflow.md
│   └── prompts/                 Role prompts (architect, developer, techlead, qa)
├── logs/agents/                 Agent run logs (gitignored)
├── memory/agent-learnings/      Retrospective learnings per role
├── decks/                       ZIPs com decks reais do Anderson
├── src/                         Codigo fonte da landing page
└── .claude/
    ├── settings.json            Claude Code settings
    ├── commands/                Slash commands (/create-feature, /dashboard, ...)
    └── agents/                  Subagent definitions
```

## Documentation Maintenance Rules

- **ADRs**: every significant architecture decision creates a new ADR under
  `docs/adr/`. Number them sequentially (`0001-*.md`, `0002-*.md`).
- **PRDs**: every feature has a PRD under `docs/prd/` before Architect runs.
- **Diagrams**: every feature MUST produce (or update) at least two Mermaid
  diagrams under `docs/diagrams/`:
  1. **Architecture** (`<FXX>-architecture.mmd`) — component / data-flow
  2. **User Journey** (`<FXX>-journey.mmd`) — BPMN-style user flow
- **README.md auto-update**: every feature that ships MUST update the
  project `README.md` with a short note of what was delivered.

## Agent Learnings (Retrospective)

At the end of every feature, QA runs a retrospective ceremony and appends
lessons per role to `memory/agent-learnings/<role>.md`. Each agent reads
its own learnings file at the start of every run.

## Guardrails de Seguranca

**Git**

- NUNCA rodar `git rebase` em branches compartilhadas (`main`, `master`, `develop`)
- NUNCA rodar `git push --force` ou `--force-with-lease` sem pedir
- NUNCA rodar `git reset --hard` sobre trabalho nao commitado
- NUNCA usar `--no-verify` para pular hooks (pre-commit, pre-push)
- NUNCA usar `git add -A` ou `git add .` — stage arquivo por arquivo
- NUNCA commitar arquivos com segredos (`.env`, `credentials.*`, chaves privadas, tokens, `*.pem`, `*.key`)

**Codigo**

- NUNCA desabilitar validacao, auth ou testes "so pra fazer funcionar"
- NUNCA hardcodear secrets — sempre variaveis de ambiente
- Validar input nas fronteiras do sistema (user input, APIs externas)
- Nao introduzir dependencias novas sem confirmacao

**Infra / operacoes destrutivas**

- NUNCA modificar CI/CD sem confirmacao explicita
- NUNCA rodar `rm -rf`, `DROP TABLE`, `kill -9` sem confirmar

**Quando em duvida: pare e pergunte ao usuario.**
