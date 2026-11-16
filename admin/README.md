# Admin CLI — A Casa do Serafim

Ferramenta de linha de comando para o Anderson gerenciar as colecoes, imagens e depoimentos do site sem precisar editar codigo.

## Requisitos

- [Bun](https://bun.sh/) instalado
- Dependencias instaladas: `cd admin && bun install`

## Como usar

Na raiz do projeto:

```bash
bun run admin
```

O menu interativo aparece com as opcoes abaixo.

## Comandos

### Listar colecoes

Exibe uma tabela com todas as colecoes cadastradas, incluindo slug, nome, quantidade de cartas e status de URLs/manual.

### Adicionar colecao

Cria uma nova colecao. Voce informa:
- **Nome** (ex: "Naruto Shippuden")
- **Descricao curta** (ex: "Ninjas, jutsus e a vontade do fogo.")
- **Quantidade de cartas**

O slug e gerado automaticamente a partir do nome (ex: "naruto-shippuden").

### Editar colecao

Selecione uma colecao e escolha qual campo editar: nome, descricao ou quantidade de cartas.

### Remover colecao

Selecione uma colecao para remover. Pede confirmacao antes de deletar. As imagens e manuais nao sao removidos automaticamente.

### Processar imagens

1. Selecione a colecao
2. Informe o caminho da pasta com as imagens originais (alta resolucao)
3. As imagens sao redimensionadas (max 600px) e recebem marca d'agua
4. Resultado salvo em `public/images/decks/{slug}/`
5. Selecione quais imagens serao exibidas como amostra no site

### Definir capa

Selecione a colecao e informe o caminho da imagem de capa. A imagem e copiada para `public/images/covers/{slug}.jpg`.

### Definir URL (DeckCheck/Moxfield)

Selecione a colecao e escolha entre DeckCheck ou Moxfield. Informe a URL completa (deve comecar com http:// ou https://). Envie vazio para limpar.

### Upload manual (PDF)

Selecione a colecao e informe o caminho do arquivo PDF. O arquivo e copiado para `public/manuals/{slug}.pdf` e a URL e salva na colecao automaticamente.

### Gerenciar depoimentos

Sub-menu com opcoes:
- **Listar**: mostra todos os depoimentos cadastrados
- **Adicionar**: pede nome do cliente, texto do depoimento e deck associado
- **Editar**: selecione um depoimento e edite nome, texto ou deck
- **Remover**: selecione e remova um depoimento

## Fluxo completo

Quando o Anderson receber um novo deck para adicionar ao site:

```
1. bun run admin
2. "Adicionar colecao" → preencher nome, descricao, qtd cartas
3. "Definir capa" → apontar para a imagem de capa do deck
4. "Processar imagens" → apontar para a pasta com as cartas originais
   → selecionar quais serao amostras no site
5. "Definir URL" → colar link do DeckCheck e/ou Moxfield
6. "Upload manual" → apontar para o PDF do manual (se houver)
7. "Gerenciar depoimentos" → adicionar depoimentos de clientes
8. Sair do admin
9. bun run build  → gerar o site atualizado
10. git add -p && git commit -m "Adicionar colecao X"
11. git push origin main
```

## Onde ficam os dados

| Arquivo | Conteudo |
|---------|----------|
| `src/data/collections.json` | Lista de colecoes |
| `src/data/testimonials.json` | Lista de depoimentos |
| `public/images/covers/` | Capas das colecoes |
| `public/images/decks/{slug}/` | Imagens processadas (com watermark) |
| `public/manuals/` | Manuais em PDF |
