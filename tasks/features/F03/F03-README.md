# Feature F03 — Evolucao Tecnica: UX, Performance e Polimento

**Status:** planned
**Owner:** @eduardodidio

## Goal

Implementar melhorias tecnicas no site e admin que elevam a experiencia do usuario,
performance, acessibilidade e robustez da plataforma. Baseado em auditoria completa
de padroes de mercado para lojas de nicho de trading cards.

## Scope

### Landing Page (site publico)
- Lightbox/galeria com zoom nas amostras de cartas
- Lazy loading otimizado com blur placeholder (LQIP)
- SEO tecnico: meta tags OG/Twitter, structured data (JSON-LD), sitemap.xml
- PWA: manifest.json, service worker, installable no mobile
- Animacoes de entrada (intersection observer) nos cards/secoes
- Favicon e apple-touch-icon profissionais
- Pagina 404 customizada com identidade visual

### Admin Panel
- Tecla Escape fecha modais
- Protecao contra double-click em botoes de acao (save, publish, delete)
- Error handling no carregamento inicial (loadCollections, loadTestimonials, loadSettings)
- Drag-and-drop real nas zonas de upload (alem do click)
- Preview de imagens no upload de deck images (grid antes de confirmar)
- Ordenacao de colecoes via drag (nice-to-have)

### Infra / DX
- Compressao de imagens automatica no build (sharp/vite plugin)
- Cache headers otimizados no server do admin
- Validacao de URLs nos campos DeckCheck/Moxfield (formato basico)

## Architecture impact

- `src/routes/` — SEO meta tags, lightbox, animacoes, 404 page
- `src/components/` — novo componente Lightbox, animacao wrapper
- `public/` — manifest.json, service worker, favicon set, sitemap.xml, robots.txt
- `admin/public/index.html` — melhorias UX (escape, double-click, drag-drop, error handling)
- `admin/src/server.ts` — cache headers (opcional)

## Waves

- **Wave 0**: F03-T01 (SEO tecnico + meta tags + structured data)
- **Wave 1**: F03-T02 (PWA manifest + service worker + favicon), F03-T03 (Lightbox galeria)
- **Wave 2**: F03-T04 (Animacoes de entrada), F03-T05 (Admin UX polish)
- **Wave 3**: F03-T06 (Pagina 404), F03-T07 (Image optimization pipeline)

## Global acceptance criteria

- [ ] Todas as funcionalidades existentes preservadas
- [ ] Lighthouse score >= 90 em Performance, SEO e Accessibility
- [ ] Site installavel como PWA no Chrome/mobile
- [ ] Galeria de amostras com lightbox funcional
- [ ] Admin robusto com feedback em todos os edge cases
- [ ] Nenhuma regressao visual no site ou admin
- [ ] Build sem erros (`bun run build`)
