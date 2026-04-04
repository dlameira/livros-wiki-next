import { fetchDirectus } from '@/lib/directus'
import CatalogoClient from '@/components/CatalogoClient'

async function getInitialData() {
  const hoje = new Date()
  const anoAtual = hoje.getFullYear()

  // Livros de lançamentos (padrão inicial: últimos 6 meses até +2 meses)
  const dataFrom = new Date(anoAtual, hoje.getMonth() - 6, 1).toISOString().split('T')[0]
  const dataTo   = new Date(anoAtual, hoje.getMonth() + 2, 1).toISOString().split('T')[0]

  const [livrosRes, selosRes, gruposRes] = await Promise.all([
    fetchDirectus('/items/livros', {
      'filter[data_publicacao][_gte]': dataFrom,
      'filter[data_publicacao][_lte]': dataTo,
      'filter[editora][selos_id][ativo][_eq]': 'true',
      'sort': '-data_publicacao',
      'limit': '500',
      'page': '1',
      'fields': 'id,titulo,autor,editora,capa_url,data_publicacao,isbn',
      'meta': 'total_count',
    }),
    fetchDirectus('/items/selos', {
      'filter[ativo][_eq]': 'true',
      'sort': 'nome_display',
      'limit': '-1',
      'fields': 'id,nome_display,grupo',
    }),
    fetchDirectus('/items/grupos_editoriais', {
      'sort': 'nome',
      'limit': '-1',
      'fields': 'id,nome,cor',
    }),
  ])

  return {
    livros: livrosRes.data ?? [],
    totalCount: livrosRes.meta?.total_count ?? 0,
    selos: selosRes.data ?? [],
    grupos: gruposRes.data ?? [],
    dataFrom,
    dataTo,
  }
}

export default async function HomePage() {
  const data = await getInitialData()
  return <CatalogoClient {...data} />
}
