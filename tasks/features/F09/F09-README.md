# Feature F09 — Light/Dark theme toggle

**Status:** planned
**Owner:** @eduardodidio

## Goal

Adicionar toggle de tema claro/escuro no site principal e no admin panel.
Padrao: dark. Preferencia salva em localStorage.

## Architecture impact

- `src/styles.css` — adicionar variaveis de tema light
- `src/routes/__root.tsx` — theme provider/context
- `src/components/site-header.tsx` — toggle button
- `admin/public/index.html` — toggle + variaveis light no admin

## Waves

- **Wave 0**: F09-T01 (CSS: variaveis de tema light no site)
- **Wave 1**: F09-T02, F09-T03 (toggle no site header + toggle no admin — paralelo)
- **Wave 2**: F09-T04 (testes visuais e ajustes de contraste)

## Global acceptance criteria

- [ ] Site abre em dark mode por padrao
- [ ] Toggle alterna entre dark e light
- [ ] Preferencia salva em localStorage e persiste entre paginas
- [ ] Admin tem toggle independente
- [ ] Sem flash de tema errado ao carregar (FOUC prevention)
- [ ] Contraste acessivel em ambos os temas
- [ ] `bun run build` passa sem erros
