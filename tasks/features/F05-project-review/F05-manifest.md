# F05 — Revisao Completa do Projeto

**Status**: PLANNED
**Criado**: 2026-11-17
**Objetivo**: Corrigir bugs, falhas de seguranca, gaps de SEO, problemas de acessibilidade e melhorar qualidade geral do codigo.

---

## Resumo da Auditoria

| Categoria           | Critico | Alto | Medio | Baixo | Total |
|---------------------|---------|------|-------|-------|-------|
| Seguranca (Admin)   | 4       | 5    | 4     | 3     | 16    |
| SEO / Dados         | 2       | 3    | 2     | 1     | 8     |
| Bugs / UX           | 0       | 3    | 2     | 2     | 7     |
| Config / Infra      | 2       | 0    | 3     | 5     | 10    |
| Code Quality        | 0       | 0    | 3     | 4     | 7     |
| **Total**           | **8**   | **11**| **14**| **15**| **48** |

---

## Wave 0 — Bugs Criticos e SEO Quebrado (5 tasks)

Correcoes urgentes que afetam SEO, dados incorretos e funcionalidade quebrada.

### T01 — Corrigir dominio no sitemap.xml
- **Severidade**: CRITICO
- **Arquivo**: `public/sitemap.xml`
- **Problema**: Todas as 7 URLs usam `casadoserafim.com.br` em vez de `forjaserafim.com.br`
- **Impacto**: SEO danificado, Google indexando dominio errado
- **Acao**: Regenerar sitemap com dominio correto usando `generateSitemap()` de `src/lib/seo.ts`

### T02 — Corrigir URL do WhatsApp hardcoded no JSON-LD
- **Severidade**: CRITICO
- **Arquivo**: `src/lib/seo.ts`, linha 67
- **Problema**: WhatsApp URL hardcoded como `https://wa.me/5551984315964` em vez de usar `WHATSAPP_URL` do settings
- **Acao**: Substituir por referencia a `WHATSAPP_URL`

### T03 — Corrigir URL duplicada do Deckcheck (Final Fantasy VII)
- **Severidade**: ALTO
- **Arquivo**: `src/data/collections.json`, linhas 36 e 55
- **Problema**: Cavaleiros do Zodiaco e Final Fantasy VII apontam para o MESMO Deckcheck URL
- **Acao**: Verificar com Anderson e corrigir a URL do Final Fantasy VII

### T04 — Corrigir links do Instagram (placeholder #)
- **Severidade**: ALTO
- **Arquivos**: `src/routes/contato.tsx` linha 42, `src/components/site-footer.tsx` linha 30
- **Problema**: Links do Instagram usam `href="#"` — links mortos
- **Acao**: Substituir por URL real do Instagram OU remover link se nao existir perfil

### T05 — Remover referencia ao favicon.svg inexistente
- **Severidade**: MEDIO
- **Arquivo**: `src/routes/__root.tsx`, linha 78
- **Problema**: Head referencia `/favicon.svg` que nao existe (so tem .ico e .png)
- **Acao**: Remover linha do favicon.svg

---

## Wave 1 — Seguranca do Admin Panel (6 tasks)

Correcoes de seguranca criticas e altas no painel administrativo.

### T06 — Restringir CORS para origem especifica
- **Severidade**: CRITICO
- **Arquivo**: `admin/src/server.ts`, linhas 89, 97
- **Problema**: `Access-Control-Allow-Origin: *` permite qualquer dominio acessar a API
- **Acao**: Substituir `*` pela origem especifica do admin (`https://forja-serafim-admin.onrender.com` ou origin do request validada)

### T07 — Implementar protecao CSRF
- **Severidade**: CRITICO
- **Arquivo**: `admin/src/server.ts`
- **Problema**: Nenhum token CSRF em endpoints POST/PUT/DELETE
- **Acao**: Gerar CSRF token na sessao, validar em cada request state-changing

### T08 — Corrigir path traversal na delecao de imagens
- **Severidade**: CRITICO
- **Arquivo**: `admin/src/server.ts`, linhas 312-337
- **Problema**: `filename` da URL usado direto em `join(DECKS_DIR, slug, filename)` sem sanitizacao
- **Acao**: Validar filename para conter apenas caracteres alfanumericos, hifens e extensoes seguras. Rejeitar `..` e `/`

### T09 — Remover token do GitHub da URL do git remote
- **Severidade**: CRITICO
- **Arquivo**: `admin/src/server.ts`, linhas 572-584
- **Problema**: `GITHUB_TOKEN` embutido em plain text na URL do remote
- **Acao**: Usar git credential helper ou variavel de ambiente via header

### T10 — Validar URLs de input (moxfieldUrl, deckcheckUrl)
- **Severidade**: ALTO
- **Arquivo**: `admin/src/server.ts`, linhas 206-207, 231-232
- **Problema**: URLs armazenadas sem validacao — risco de `javascript:` URLs / XSS
- **Acao**: Validar com `new URL()` e aceitar apenas protocolos `http://` e `https://`

### T11 — Adicionar headers de seguranca nas respostas
- **Severidade**: MEDIO
- **Arquivo**: `admin/src/server.ts`, linhas 86-91
- **Problema**: Faltam `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`
- **Acao**: Adicionar headers de seguranca na funcao `json()` e nos responses de HTML

---

## Wave 2 — SEO e Meta Tags (5 tasks)

Completar SEO em todas as paginas e corrigir structured data.

### T12 — Adicionar head() nas rotas sem meta tags
- **Severidade**: ALTO (SEO)
- **Arquivos**: `src/routes/colecoes.index.tsx`, `src/routes/contato.tsx`, `src/routes/sobre.tsx`
- **Problema**: 3 paginas sem `head()` — sem Open Graph, Twitter cards, canonical URLs
- **Acao**: Adicionar config de head com meta tags, OG, Twitter, canonical (usar index.tsx como referencia)

### T13 — Adicionar preco no Product JSON-LD
- **Severidade**: MEDIO (SEO)
- **Arquivo**: `src/lib/seo.ts`, linhas 74-91
- **Problema**: Product structured data sem campo `price` — Google nao exibe preco nos resultados
- **Acao**: Adicionar campo de preco em collections.json e usar no JSON-LD (ou marcar como "Consultar")

### T14 — Adicionar breadcrumb JSON-LD em todas as paginas
- **Severidade**: BAIXO (SEO)
- **Problema**: Breadcrumb so existe em `colecoes.$slug.tsx`
- **Acao**: Adicionar breadcrumb JSON-LD em colecoes.index, sobre e contato

### T15 — Adicionar regras no robots.txt para admin
- **Severidade**: BAIXO
- **Arquivo**: `public/robots.txt`
- **Problema**: Nao bloqueia crawling de `/admin/` e `/api/`
- **Acao**: Adicionar `Disallow: /admin/` e `Disallow: /api/`

### T16 — Atualizar cache do Service Worker
- **Severidade**: BAIXO
- **Arquivo**: `public/sw.js`
- **Problema**: Cache name hardcoded `"serafim-v1"` — deploys novos nao limpam cache antigo
- **Acao**: Implementar versionamento automatico ou cache busting

---

## Wave 3 — Seguranca Admin (Continuacao) + Robustez (5 tasks)

Itens de seguranca de severidade alta/media e robustez geral.

### T17 — Validar tipo de arquivo em uploads
- **Severidade**: ALTO
- **Arquivo**: `admin/src/server.ts`, linhas 251-258
- **Problema**: Upload de cover nao valida MIME type ou magic bytes
- **Acao**: Validar content-type e magic bytes dos arquivos enviados

### T18 — Substituir inline onclick por event delegation no admin
- **Severidade**: MEDIO (XSS)
- **Arquivo**: `admin/public/index.html`, linhas 965, 1084, 1091, 1119-1127
- **Problema**: Slugs/filenames injetados em onclick handlers — risco de XSS se contiverem aspas
- **Acao**: Usar `data-*` attributes + event delegation

### T19 — Adicionar verificacao res.ok em todos os fetch do admin
- **Severidade**: MEDIO
- **Arquivo**: `admin/public/index.html`, linhas 1011, 1017, 1182, 1394, 1413
- **Problema**: Varias operacoes async nao verificam `res.ok` antes de prosseguir
- **Acao**: Adicionar verificacao de status em todos os fetch calls

### T20 — Adicionar loading states e desabilitar botoes durante operacoes
- **Severidade**: MEDIO
- **Arquivo**: `admin/public/index.html`, linhas 1182, 1248, 1394, 1413
- **Problema**: Botoes nao desabilitados durante uploads — usuario pode clicar multiplas vezes
- **Acao**: Desabilitar botoes e mostrar indicador de loading durante operacoes async

### T21 — Wrap localStorage em try-catch
- **Severidade**: MEDIO
- **Arquivo**: `src/components/site-header.tsx`, linhas 20-34
- **Problema**: localStorage sem try-catch — falha em private browsing em alguns browsers
- **Acao**: Envolver em try-catch com fallback gracioso

---

## Wave 4 — Qualidade de Codigo e Config (6 tasks)

Limpeza, consistencia e melhorias de configuracao.

### T22 — Atualizar versao do @tanstack/router-plugin
- **Severidade**: MEDIO
- **Arquivo**: `package.json`
- **Problema**: router-plugin em `^1.168.23` vs react-router em `^1.170.18`
- **Acao**: Atualizar para `^1.170.18` para consistencia

### T23 — Corrigir render.yaml (separar servicos)
- **Severidade**: ALTO
- **Arquivo**: `render.yaml`
- **Problema**: Config incompleta, sharp instalado via buildCommand, servicos nao separados
- **Acao**: Revisar blueprint para 2 servicos separados (static + admin)

### T24 — Remover componente WingsIcon nao usado
- **Severidade**: BAIXO
- **Arquivo**: `src/components/wings-icon.tsx`
- **Problema**: 36 linhas de codigo nunca importado
- **Acao**: Deletar arquivo

### T25 — Extrair cores hardcoded para CSS variables
- **Severidade**: BAIXO
- **Arquivo**: `src/components/card-tile.tsx`, linhas 85-86
- **Problema**: Cor gold hardcoded como `oklch(0.75 0.09 82)` em inline style
- **Acao**: Usar `var(--gold)` do CSS

### T26 — Adicionar log no catch do Service Worker
- **Severidade**: BAIXO
- **Arquivo**: `src/main.tsx`, linha 18
- **Problema**: `.catch(() => {})` vazio — impossivel debugar falhas
- **Acao**: Adicionar `console.warn`

### T27 — Criar .env.example com variaveis documentadas
- **Severidade**: BAIXO
- **Problema**: Nenhuma documentacao de env vars necessarias
- **Acao**: Criar `.env.example` com todas as variaveis e descricoes

---

## Wave 5 — Polish e Acessibilidade (4 tasks)

Melhorias finais de UX, acessibilidade e conteudo.

### T28 — Revisar contraste de cores (WCAG AA)
- **Severidade**: MEDIO
- **Problema**: Elementos com `text-muted-foreground` e opacity baixa podem nao atingir 4.5:1
- **Acao**: Testar com ferramentas de contraste e ajustar cores

### T29 — Melhorar React keys nos indicadores de card
- **Severidade**: BAIXO
- **Arquivo**: `src/components/card-tile.tsx`, linha 81
- **Problema**: Usando index como key — pode causar bugs se array mudar
- **Acao**: Usar `${collection.slug}-indicator-${i}` como key

### T30 — Limpar sessoes expiradas no admin (memory leak)
- **Severidade**: BAIXO
- **Arquivo**: `admin/src/server.ts`, linha 25
- **Problema**: Sessions em Map sem cleanup periodico — acumula em memoria
- **Acao**: Implementar cleanup a cada 1h para sessoes expiradas

### T31 — Remover dead code (withGuard) no admin
- **Severidade**: BAIXO
- **Arquivo**: `admin/public/index.html`, linhas 1753-1759
- **Problema**: Funcao `withGuard()` definida mas nunca usada
- **Acao**: Remover funcao

---

## Resumo de Waves

| Wave | Foco                          | Tasks | Dependencias |
|------|-------------------------------|-------|--------------|
| 0    | Bugs criticos + SEO quebrado  | 5     | Nenhuma      |
| 1    | Seguranca admin (critico)     | 6     | Nenhuma      |
| 2    | SEO e meta tags               | 5     | Wave 0       |
| 3    | Seguranca admin + robustez    | 5     | Wave 1       |
| 4    | Qualidade de codigo + config  | 6     | Nenhuma      |
| 5    | Polish e acessibilidade       | 4     | Waves 0-4    |

**Total: 31 tasks em 6 Waves**

Waves 0, 1 e 4 podem rodar em paralelo (sem dependencias entre si).
Wave 2 depende de Wave 0 (sitemap corrigido).
Wave 3 depende de Wave 1 (base de seguranca).
Wave 5 depende de todas as anteriores (polish final).

---

## Notas

- T03 (Deckcheck URL) requer confirmacao do Anderson antes de corrigir
- T04 (Instagram) requer URL real do perfil — perguntar ao Anderson
- T13 (Preco no JSON-LD) requer definicao de precos — perguntar ao Anderson
- T23 (render.yaml) deve ser validado com deploy de teste
