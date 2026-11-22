# Diagramas Tecnicos — Forja Serafim

Todos os diagramas estao no formato [Mermaid](https://mermaid.js.org/) e podem ser visualizados diretamente no GitHub ou em qualquer viewer Mermaid.

## Indice — Diagramas Globais

| Diagrama              | Arquivo                                                    | Descricao                                                                               |
| --------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Arquitetura Geral     | [`architecture-overview.mmd`](./architecture-overview.mmd) | Visao macro de todos os modulos: frontend, admin, data layer, assets, servicos externos |
| Fluxo de Dados        | [`data-flow.mmd`](./data-flow.mmd)                         | Como os dados fluem dos JSONs ate as paginas e pelo pipeline admin                      |
| Jornada do Usuario    | [`user-journey.mmd`](./user-journey.mmd)                   | Todos os caminhos que um visitante pode percorrer no site                               |
| Fluxo Admin           | [`admin-flow.mmd`](./admin-flow.mmd)                       | Operacoes do painel admin: CRUD, upload, pipeline de imagens, git persist               |
| Arvore de Componentes | [`component-tree.mmd`](./component-tree.mmd)               | Hierarquia completa dos componentes React e suas dependencias                           |
| Infraestrutura/Deploy | [`deploy-infrastructure.mmd`](./deploy-infrastructure.mmd) | Ambiente local, GitHub, Render, DNS e roteamento do servidor                            |
| Seguranca/Auth        | [`security-auth.mmd`](./security-auth.mmd)                 | Fluxo de autenticacao Google OAuth, sessoes HMAC e protecao CSRF                        |
| Pipeline Git Persist  | [`git-persist-pipeline.mmd`](./git-persist-pipeline.mmd)   | Maquina de estados do auto-save: dirty → pushing → clean/error                          |

## Indice — Diagramas por Feature

| Feature        | Arquitetura                                      | Jornada                                |
| -------------- | ------------------------------------------------ | -------------------------------------- |
| F15 Video Demo | [`F15-architecture.mmd`](./F15-architecture.mmd) | [`F15-journey.mmd`](./F15-journey.mmd) |

## Obrigatorios (por feature)

1. **`<FXX>-architecture.mmd`** — arquitetura / data flow
   Mostra quais modulos/camadas foram tocados e como dados fluem.
   Template: [`templates/architecture.mmd`](templates/architecture.mmd).

2. **`<FXX>-journey.mmd`** — jornada do usuario (BPMN-style)
   Mostra o fluxo que o usuario percorre, decisoes e erros.
   Template: [`templates/user-journey.mmd`](templates/user-journey.mmd).

## Opcionais (quando ajudarem)

- `<FXX>-sequence.mmd` — diagramas de sequencia (interacoes temporais)
- `<FXX>-state.mmd` — maquina de estados
- `<FXX>-er.mmd` — relacoes de dados

## Convencoes

- Nome do arquivo comeca com o id da feature (`F0X-`) para diagramas de feature
- Diagramas globais usam nomes descritivos (`architecture-overview`, `data-flow`, etc.)
- Tema: `dark` por padrao (alinhado com a identidade visual do projeto)
- Use `flowchart LR` pra arquitetura, `flowchart TD` com swimlanes via `subgraph` pra jornadas
- Diagramas devem bater com a realidade do codigo — se o codigo mudou e o diagrama nao, e bug

## Como visualizar

```bash
# No VS Code, instale a extensao "Mermaid Preview"
# Ou use o CLI:
npx @mermaid-js/mermaid-cli -i docs/diagrams/architecture-overview.mmd -o diagram.svg
```
