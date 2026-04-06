export const dynamic = 'force-dynamic'

import { DIRECTUS_URL } from '@/lib/directus'
import CatalogoClient from '@/components/CatalogoClient'

export type Livro = {
  id: number
  titulo: string
  autor: string
  editora: string
  capa_url: string | null
  data_publicacao: string
  isbn: string
}

export type Selo = {
  nome_display: string
  grupo: { nome: string; cor: string } | null
}

async function getInitialData() {
  const hoje = new Date()
  const anoAtual = hoje.getFullYear()
  const dataFrom = new Date(anoAtual, hoje.getMonth() - 6, 1).toISOString().split('T')[0]
  const dataTo   = new Date(anoAtual, hoje.getMonth() + 2, 1).toISOString().split('T')[0]

  // Busca selos ativos com grupo aninhado
  const selosRes = await fetch(
    `${DIRECTUS_URL}/items/selos?fields=nome_display,grupo.nome,grupo.cor&limit=500&filter[ativo][_eq]=true`,
    { cache: 'no-store' }
  )
  const selosJson = await selosRes.json()
  const selos: Selo[] = selosJson.data ?? []

  // Nomes das editoras ativas para filtrar o catálogo
  const editorasAtivas = selos.map(s => s.nome_display).filter(Boolean)

  // Busca livros — sem filtro de editora ativa, mostra todo o catálogo
  const filtroInicial = {
    data_publicacao: { _gte: dataFrom, _lte: dataTo }
  }

  const livrosUrl = `${DIRECTUS_URL}/items/biblioteca`
    + `?fields=id,isbn,titulo,autor,editora,capa_url,data_publicacao`
    + `&sort=-data_publicacao`
    + `&limit=500&page=1&meta=filter_count`
    + `&filter=${encodeURIComponent(JSON.stringify(filtroInicial))}`

  const livrosRes  = await fetch(livrosUrl, { cache: 'no-store' })
  const livrosJson = await livrosRes.json()

  return {
    livros: (livrosJson.data ?? []) as Livro[],
    totalCount: livrosJson.meta?.filter_count ?? 0,
    selos,
    editorasAtivas,
    dataFrom,
    dataTo,
  }
}

export default async function HomePage() {
  const data = await getInitialData()
  return <CatalogoClient {...data} />
}
