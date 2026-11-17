# Admin — Forja Serafim

Painel administrativo para gerenciar as colecoes, imagens e depoimentos do site.

## Primeira vez (instalar)

1. Clique duas vezes no arquivo **`instalar.bat`** na raiz do projeto
2. Aguarde a instalacao terminar (apenas uma vez)

## Usar o painel

1. Clique duas vezes no arquivo **`admin.bat`** na raiz do projeto
2. O navegador abre automaticamente em `http://localhost:3001/admin/`
3. Para parar: feche a janela preta do terminal

## O que da pra fazer no painel

### Colecoes

- **Listar** todas as colecoes com status de URLs e manual
- **Adicionar** nova colecao (nome, descricao, quantidade de cartas)
- **Editar** nome, descricao, quantidade, URLs do DeckCheck e Moxfield
- **Remover** uma colecao
- **Upload de capa** — botao "Capa" na colecao, selecione uma imagem
- **Upload de imagens** — botao "Imagens", selecione varias imagens de cartas (sao processadas com marca d'agua automaticamente)
- **Upload de manual** — botao "Manual PDF", selecione o PDF do deck

### Depoimentos

- **Adicionar** depoimento com nome do cliente, texto e deck associado
- **Editar** qualquer campo
- **Remover** depoimento

## Fluxo para adicionar um deck novo

1. Abra o painel (`admin.bat`)
2. Clique em **"+ Nova colecao"** e preencha os dados
3. Na colecao criada, clique em **"Capa"** e selecione a imagem de capa
4. Clique em **"Imagens"** e selecione as cartas do deck (serao processadas com marca d'agua)
5. Clique em **"Editar"** para adicionar as URLs do DeckCheck e Moxfield
6. Se tiver manual, clique em **"Manual PDF"** e selecione o arquivo
7. Na aba **"Depoimentos"**, adicione reviews de clientes se tiver

## Onde ficam os dados

| Pasta/Arquivo | Conteudo |
|---------|----------|
| `src/data/collections.json` | Lista de colecoes |
| `src/data/testimonials.json` | Lista de depoimentos |
| `public/images/covers/` | Capas das colecoes |
| `public/images/decks/{slug}/` | Imagens com marca d'agua |
| `public/manuals/` | Manuais em PDF |
