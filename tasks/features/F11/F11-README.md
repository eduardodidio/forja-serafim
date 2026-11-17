# Feature F11 — Animacao 3D holografica nas cartas de amostra

**Status:** done
**Owner:** @eduardodidio

## Goal

Adicionar efeito 3D tilt + shimmer holografico nas cartas de amostra exibidas
na pagina de colecao, inspirado no projeto TCG-market-intelligence. Ao clicar ou
passar o mouse, a carta brilha, inclina em 3D e tem reflexo rainbow.

## Architecture impact

- `package.json` — nova dependencia: react-parallax-tilt
- `src/components/card-3d-tilt.tsx` — novo componente wrapper
- `src/styles/foil-shimmer.css` — novo CSS para efeitos holograficos
- `src/routes/colecoes.$slug.tsx` — wrap das sample images com Card3DTilt

## Waves

- **Wave 0**: F11-T01 (dependencia + componente Card3DTilt + CSS foil)
- **Wave 1**: F11-T02 (integrar nas sample images da pagina de colecao)
- **Wave 2**: F11-T03 (integrar no lightbox + polish)

## Global acceptance criteria

- [ ] Cartas de amostra tem efeito 3D tilt ao hover
- [ ] Shimmer holografico (rainbow) segue posicao do mouse
- [ ] Brilho especular (shine) acompanha o mouse
- [ ] Glow dourado opcional na borda
- [ ] Respeita prefers-reduced-motion
- [ ] Funciona em mobile (touch)
- [ ] `bun run build` passa sem erros
