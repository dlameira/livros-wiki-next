# Memória do projeto livros.wiki

Aprendizados e decisões acumuladas ao longo das sessões de trabalho.

---

## Cores e tema

- **`--accent` (#fbf236)** — amarelo vivo. Usar APENAS como cor de **fundo** (botão selecionado, badge). NUNCA como cor de texto em light mode — contraste zero sobre fundo claro.
- **`--accent-fg`** — variável dedicada para texto com destaque:
  - Dark mode: `#fbf236` (amarelo legível sobre fundo escuro)
  - Light mode: `#8a6f00` (âmbar escuro, legível sobre fundo claro)
- **Regra**: sempre que usar a cor de destaque em `color:`, usar `var(--accent-fg)`. Para `background:`, usar `var(--accent)`.
- `--muted` no light mode: `#5a5f66` (não mais `#72777d` — era leve demais)

---

## Tipografia

- **Interface / UI**: Montserrat (sans-serif) — pesos usados: 300, 400, 500, 600, 700
- **Textos editoriais**: Merriweather (serif) — títulos de livros, sinopse, bio de autor — pesos: 300, 400, 700
- **Variáveis CSS**: `--font-sans` (Montserrat), `--font-serif` (Merriweather)
- **Classe utilitária**: `.font-serif` em `globals.css` para aplicar Merriweather inline
- Nos cards: título em `.font-serif` (Merriweather), autor em sans (Montserrat)
- No modal: título em `.font-serif`, autor/editora em sans
- **Pesos mínimos**: não usar weight < 400 na UI — fica "delicado demais". Botões não selecionados em 500, selecionados em 700.
- Filtros preset: uppercase + `letterSpacing: '0.1em'`

---

## Infraestrutura

- **Deploy**: Vercel (Hobby) + Railway PostgreSQL + Directus CMS
- **Banco**: `postgresql://postgres:PASSWORD@interchange.proxy.rlwy.net:50369/railway`
- **`DATABASE_URL`** configurada como env var na Vercel
- **`pg` no Vercel/Turbopack**: precisa de `serverExternalPackages: ['pg']` no `next.config.ts` — sem isso, Turbopack não resolve o módulo e o build falha em ~11 segundos
- **Cache de imagens**: proxy `/api/cover/[isbn]` com `s-maxage=2592000` (30 dias). Primeiro acesso lento (Metabooks), subsequentes rápidos via CDN Vercel
- **Imagens**: usar `size=m` (não `s` — qualidade ruim, não `l` — desnecessário)
- **`next/font`**: font loaders precisam ser `const` no module scope — não podem estar dentro de arrays ou objetos

---

## Busca

- Busca textual via PostgreSQL direto (não Directus API — não suporta `unaccent`)
- Extensão `unaccent` + `pg_trgm` instaladas no Railway
- Função `immutable_unaccent(text)` criada no banco (wrapper IMMUTABLE sobre `public.unaccent`)
- Índices GIN trigram nas colunas `titulo`, `autor`, `editora`
- Endpoint: `/api/search?q=...&from=...&to=...&editoras=...`
- Multi-word AND: cada palavra vira uma cláusula separada
- Até 6 palavras, máx 500 resultados
- Busca desativa scroll infinito (`setHasMore(false)`)

---

## Catálogo / Filtros

- **Todo o catálogo visível**: removido filtro `editora _in editorasAtivas` do fetch de livros
- **Seletor de editoras**: ainda filtra por `ativo=true` no Directus — decisão pendente de revisão
- Quando nenhuma editora selecionada: sem filtro de editora (mostra tudo)
- Quando editoras selecionadas: filtra por `editora _in selectedEditoras`
- Preset "catálogo" (antes "tudo"): mostra seletor de datas. Pré-venda e lançamentos não mostram.
- Botão editoras: "selecionar" (Set.size === 0) vs "adicionar" (Set.size > 0) — usar `.size`, não `.length`

---

## Componentes

- **`SiteHeader`**: componente client compartilhado. Gerencia tema dark/light via localStorage. Aceita prop `subtitle`.
- **Linha divisória**: `<div style={{ borderBottom: '1px solid var(--border)', margin: '0 48px' }} />` abaixo do header
- **Logo liki**: `public/liki.png` — 19×33px, proporção retrato. No header com `height: 81px`, `width: auto`, `imageRendering: 'pixelated'`
- **Favicon**: configurado via `icons` no metadata do `layout.tsx`

---

## Segurança / Changelog

- Não mencionar `/admin` publicamente no changelog
- Não expor URLs internas de painel de administração

---

## Página de teste de fontes

- `/fontes` — página temporária para comparar serifadas lado a lado
- 10 fontes: Lora, Playfair Display, EB Garamond, Merriweather, Source Serif 4, Libre Baskerville, Crimson Text, Cormorant Garamond, Spectral, PT Serif
- Referência de tamanho: Merriweather como baseline
