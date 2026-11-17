# Feature F06 — Admin UX Enhancements

**Status:** done
**Owner:** @eduardodidio

## Goal

Melhorar a area administrativa: alerta mais claro ao excluir colecao (irreversivel), opcao de ocultar colecao (reversivel), logo Forja Serafim na tela de login, e revisao dos BATs para o novo projeto.

## Architecture impact

- `admin/public/index.html` — UI: botao ocultar, alerta excluir melhorado
- `admin/public/login.html` — logo na tela de login
- `admin/src/server.ts` — API: campo `hidden` no PUT, filtro no GET publico
- `src/lib/store-data.ts` — filtrar colecoes ocultas no site publico
- `src/data/collections.json` — novo campo `hidden: boolean` (default false)
- `admin.bat` / `instalar.bat` — revisao de caminhos

## Waves

- **Wave 0**: F06-T01 (campo hidden no modelo de dados + API)
- **Wave 1**: F06-T02, F06-T03, F06-T04 (UI ocultar, alerta excluir, logo login — paralelo)
- **Wave 2**: F06-T05 (filtrar colecoes ocultas no site publico)
- **Wave 3**: F06-T06 (revisao BATs + build validation)

## Global acceptance criteria

- [ ] Colecao pode ser ocultada/reexibida via admin
- [ ] Colecao oculta nao aparece no site publico
- [ ] Excluir colecao mostra alerta explicito de irreversibilidade
- [ ] Logo Forja Serafim na tela de login
- [ ] BATs funcionam corretamente no novo projeto
- [ ] `bun run build` passa sem erros
