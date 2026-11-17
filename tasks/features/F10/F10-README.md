# Feature F10 — Re-watermark imagens com "Forja Serafim"

**Status:** done
**Owner:** @eduardodidio

## Goal

Reprocessar todas as 18 imagens de amostra existentes para substituir a marca
d'agua antiga ("A casa do Serafim") pela nova ("Forja Serafim"). Usar as imagens
originais dos ZIPs em `decks/` como fonte.

## Architecture impact

- `admin/src/lib/image-processor.ts` — ja usa "Forja Serafim" (correto)
- `public/images/decks/` — imagens reprocessadas sobrescrevem as atuais
- `decks/` — ZIPs com imagens originais (fonte sem watermark)

## Waves

- **Wave 0**: F10-T01 (script de reprocessamento batch)
- **Wave 1**: F10-T02 (executar e validar resultado)

## Global acceptance criteria

- [ ] Todas as 18 sample images tem watermark "Forja Serafim"
- [ ] Nenhuma imagem tem watermark "A casa do Serafim"
- [ ] Qualidade visual mantida (600px max width, JPEG 80)
- [ ] collections.json nao alterado (paths iguais)
