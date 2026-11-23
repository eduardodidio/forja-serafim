# F22 — Card Flip Verso (Lightbox)

**Status:** done
**Created:** 2026-11-23

## Summary

No lightbox de inspecao de cards, adicionar interacao de flip: ao clicar no card
ja aberto no lightbox, ele faz uma animacao de flip horizontal organica (~600ms)
revelando o verso da carta (imagem JPEG unica, compartilhada por todos os cards).
Clicar novamente volta para a frente. O primeiro clique na grid continua abrindo
o lightbox normalmente com 3D tilt.

## Tasks

| Task    | Description                                           | Wave |
| ------- | ----------------------------------------------------- | ---- |
| F22-T01 | Mover verso.jpeg para public/ e preload da imagem     | W1   |
| F22-T02 | Adicionar flip state e animacao CSS ao Lightbox        | W1   |

## Waves

- **Wave 1**: T01 + T02 (parallelizable — asset setup + component logic)
