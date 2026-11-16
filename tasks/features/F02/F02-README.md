# Feature F02 — Redesign Admin Panel (UX & Estética)

**Status:** done
**Owner:** @eduardodidio

## Goal

Redesign completo da interface do painel admin para melhorar estética e usabilidade,
mantendo 100% das funcionalidades existentes (CRUD coleções, depoimentos, settings,
upload de imagens/covers/manuais, publicação com deploy hook).

## Architecture impact

- `admin/public/index.html` — rewrite visual completo (único arquivo afetado)
- `admin/src/server.ts` — sem mudanças funcionais (apenas servir favicon se necessário)
- APIs e dados — intocados

## Waves

- **Wave 0**: F02-T01 (layout e design system)
- **Wave 1**: F02-T02, F02-T03 (coleções e uploads)
- **Wave 2**: F02-T04, F02-T05 (depoimentos e configurações)
- **Wave 3**: F02-T06 (publicação e polish final)

## Global acceptance criteria

- [ ] Todas as funcionalidades existentes preservadas (CRUD, uploads, publish)
- [ ] Visual premium, escuro, coerente com a marca "A Casa do Serafim"
- [ ] Responsivo (funcionar bem em telas de 1024px+)
- [ ] Loading states e feedback visual em todas as ações
- [ ] Nenhuma mudança no server.ts ou nas APIs
- [ ] Testado no Chrome (ambiente local do Anderson)
