# Feature F08 — Admin: UX premium nos formularios

**Status:** done
**Owner:** @eduardodidio

## Goal

Redesenhar os modais de criar e editar colecao no admin para ter o mesmo nivel
visual premium do site principal: tipografia Cinzel/Jost, gradientes dourados,
transicoes suaves, e layout mais sofisticado.

## Architecture impact

- `admin/public/index.html` — CSS: redesign dos modais, forms, botoes, tabs
- Nenhuma mudanca de API necessaria

## Waves

- **Wave 0**: F08-T01 (design system: fontes, cores, variaveis CSS alinhadas ao site)
- **Wave 1**: F08-T02, F08-T03 (modal de criacao premium + modal de edicao premium — paralelo)
- **Wave 2**: F08-T04 (polish: transicoes, hover states, responsividade)

## Global acceptance criteria

- [ ] Modais de criacao/edicao usam tipografia Cinzel para titulos
- [ ] Cores e gradientes consistentes com o site principal
- [ ] Inputs, botoes e tabs com estilo premium (bordas douradas, hover states)
- [ ] Transicoes suaves em abertura/fechamento de modais
- [ ] Responsivo em mobile
- [ ] `bun run build` passa sem erros
