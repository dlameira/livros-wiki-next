import { DIRECTUS_URL } from '@/lib/directus'
import { SELO_INFO, HITS, SELO_LOGOS_FALLBACK, SELO_INSTAGRAM, SELO_IG_STATS, GRUPO_DESCRICAO } from '@/lib/selos-data'
import { notFound } from 'next/navigation'
import SelosGrid, { type SeloEnriquecido, type Capa } from './SelosGrid'
import MosaicoScroll from './MosaicoScroll'
import GroupCharts from './GroupCharts'
import SiteHeader from '@/components/SiteHeader'
import { getMonthlyBookCounts } from '@/lib/queries/group-monthly'

export const dynamic = 'force-dynamic'

function slugify(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type Grupo = { id: number; nome: string; cor?: string }

type Selo = {
  id: number
  nome_display: string
  total_livros_mb: number | null
  ativo: boolean
  logo_url?: string | null
  descricao?: string | null
}

type Livro = {
  id: number
  isbn: string
  titulo: string
  editora: string
  capa_url: string | null
  data_publicacao: string
}

export default async function GrupoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const gruposRes = await fetch(`${DIRECTUS_URL}/items/grupos_editoriais?fields=id,nome,cor&limit=100`)
  const grupos: Grupo[] = (await gruposRes.json()).data || []
  const grupo = grupos.find(g => slugify(g.nome) === slug)
  if (!grupo) notFound()

  const selosRes = await fetch(
    `${DIRECTUS_URL}/items/selos?filter[grupo][_eq]=${grupo.id}&fields=id,nome_display,total_livros_mb,curada,logo_url,descricao&limit=200&sort=nome_display`
  )
  const selos: Selo[] = ((await selosRes.json()).data || []).filter((s: Selo) => s.nome_display)

  // Datas para classificação de atividade (alinhadas com a home)
  const hojeDate = new Date()
  const hoje = hojeDate.toISOString().slice(0, 10)
  const anoAtual = hojeDate.getFullYear()
  const mes = hojeDate.getMonth()
  const dia = hojeDate.getDate()
  const anoInicioStr = `${anoAtual}-01-01`
  const quatroAtras = new Date(anoAtual, mes - 4, 1)
  const quatroAtrasStr = quatroAtras.toISOString().slice(0, 10)
  const amanha = new Date(anoAtual, mes, dia + 1)
  const amanhaStr = amanha.toISOString().slice(0, 10)
  const prevLimite = new Date(anoAtual, mes + 3, 1)
  const prevLimiteStr = prevLimite.toISOString().slice(0, 10)

  // Fetch covers + contagens para TODOS os selos em paralelo
  // Ativo/inativo é definido dinamicamente: nLanc > 0 || nPrev > 0
  const livrosPorSelo: Record<string, Capa[]> = {}
  const contagemPorSelo: Record<string, number> = {}
  const lancPorSelo: Record<string, number> = {}
  const prevPorSelo: Record<string, number> = {}
  const lancAnoPorSelo: Record<string, number> = {}

  await Promise.all(
    selos.map(async (selo) => {
      const filterCovers = encodeURIComponent(JSON.stringify({
        _and: [{ editora: { _eq: selo.nome_display } }, { capa_url: { _nnull: true } }]
      }))
      const filterCount = encodeURIComponent(JSON.stringify({ editora: { _eq: selo.nome_display } }))
      const filterLanc = encodeURIComponent(JSON.stringify({
        _and: [
          { editora: { _eq: selo.nome_display } },
          { data_publicacao: { _gte: quatroAtrasStr, _lte: hoje } },
        ]
      }))
      const filterPrev = encodeURIComponent(JSON.stringify({
        _and: [
          { editora: { _eq: selo.nome_display } },
          { data_publicacao: { _gte: amanhaStr, _lte: prevLimiteStr } },
        ]
      }))
      const filterLancAno = encodeURIComponent(JSON.stringify({
        _and: [
          { editora: { _eq: selo.nome_display } },
          { data_publicacao: { _gte: anoInicioStr, _lte: hoje } },
        ]
      }))

      const [coversRes, countRes, lancRes, prevRes, lancAnoRes] = await Promise.all([
        fetch(`${DIRECTUS_URL}/items/biblioteca?fields=id,isbn,titulo,capa_url&sort=-data_publicacao&limit=16&filter=${filterCovers}`),
        fetch(`${DIRECTUS_URL}/items/biblioteca?limit=0&meta=filter_count&filter=${filterCount}`),
        fetch(`${DIRECTUS_URL}/items/biblioteca?limit=0&meta=filter_count&filter=${filterLanc}`),
        fetch(`${DIRECTUS_URL}/items/biblioteca?limit=0&meta=filter_count&filter=${filterPrev}`),
        fetch(`${DIRECTUS_URL}/items/biblioteca?limit=0&meta=filter_count&filter=${filterLancAno}`),
      ])

      livrosPorSelo[selo.nome_display]    = (await coversRes.json()).data || []
      contagemPorSelo[selo.nome_display]  = (await countRes.json()).meta?.filter_count || 0
      lancPorSelo[selo.nome_display]      = (await lancRes.json()).meta?.filter_count || 0
      prevPorSelo[selo.nome_display]      = (await prevRes.json()).meta?.filter_count || 0
      lancAnoPorSelo[selo.nome_display]   = (await lancAnoRes.json()).meta?.filter_count || 0
    })
  )

  // Ativo = tem lançamento nos últimos 4 meses OU livro em pré-venda
  const selosAtivos = selos.filter(s => (lancPorSelo[s.nome_display] || 0) > 0 || (prevPorSelo[s.nome_display] || 0) > 0)

  const totalLivros  = Object.values(contagemPorSelo).reduce((sum, n) => sum + n, 0)
  const totalLancAno = Object.values(lancAnoPorSelo).reduce((sum, n) => sum + n, 0)
  const totalPrev    = Object.values(prevPorSelo).reduce((sum, n) => sum + n, 0)

  // Mosaico de capas recentes
  const nomesSelos = selos.map(s => s.nome_display)
  let mosaico: Livro[] = []
  if (nomesSelos.length > 0) {
    const filter = encodeURIComponent(JSON.stringify({ editora: { _in: nomesSelos }, capa_url: { _nnull: true } }))
    const res = await fetch(
      `${DIRECTUS_URL}/items/biblioteca?fields=id,isbn,titulo,editora,capa_url&sort=-data_publicacao&limit=100&filter=${filter}`
    )
    mosaico = (await res.json()).data || []
  }

  // ── Dados para gráficos ────────────────────────────────────────────────────
  const monthlyData = await getMonthlyBookCounts(nomesSelos).catch(() => [])

  function parseFollowers(s: string): number {
    if (s.endsWith('K')) return parseFloat(s) * 1000
    if (s.endsWith('M')) return parseFloat(s) * 1_000_000
    return parseInt(s.replace(/\./g, ''), 10)
  }

  const scatterData = selos.map(selo => {
    const handle = SELO_INSTAGRAM[selo.nome_display]
    const igStats = handle ? SELO_IG_STATS[handle] : null
    return {
      name: selo.nome_display,
      catalogSize: contagemPorSelo[selo.nome_display] || 0,
      followers: igStats ? parseFollowers(igStats.seg) : 0,
    }
  }).filter(d => d.followers > 0 && d.catalogSize > 0)

  const particleData = mosaico.map(l => ({ id: l.id, editora: l.editora }))

  // Monta array enriquecido para o componente client
  // ativo = calculado dinamicamente (nLanc > 0 || nPrev > 0), não o campo do Directus
  const selosEnriquecidos: SeloEnriquecido[] = selos.map(selo => {
    const nLanc = lancPorSelo[selo.nome_display] || 0
    const nPrev = prevPorSelo[selo.nome_display] || 0
    const info = SELO_INFO[selo.nome_display]
    return {
      id: selo.id,
      nome_display: selo.nome_display,
      ativo: nLanc > 0 || nPrev > 0,
      logoUrl: selo.logo_url || SELO_LOGOS_FALLBACK[selo.nome_display] || null,
      descricao: selo.descricao || info?.desc || null,
      tag: info?.tag || null,
      covers: livrosPorSelo[selo.nome_display] || [],
      count: contagemPorSelo[selo.nome_display] || 0,
      nLanc: lancPorSelo[selo.nome_display] || 0,
      nPrev: prevPorSelo[selo.nome_display] || 0,
      hits: HITS[selo.nome_display] || [],
      igHandle: SELO_INSTAGRAM[selo.nome_display] ?? null,
    }
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      <SiteHeader />

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{
        padding: '64px 64px 48px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '48px',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c0392b', marginBottom: '12px' }}>
            grupo editorial
          </div>
          <h1 className="font-serif" style={{ fontSize: '3rem', fontWeight: 'normal', letterSpacing: '0.04em', color: 'var(--text)', lineHeight: 1, marginBottom: '10px' }}>
            {grupo.nome}
          </h1>
          {GRUPO_DESCRICAO[grupo.nome] && (
            <div className="font-serif" style={{ marginTop: '16px', maxWidth: '580px', fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.75, borderLeft: '2px solid var(--border)', paddingLeft: '16px' }}>
              {GRUPO_DESCRICAO[grupo.nome]}
            </div>
          )}
        </div>
        <GroupCharts
          monthlyData={monthlyData}
          scatterData={scatterData}
          particles={particleData}
          groupColor={grupo.cor || '#c0392b'}
        />
      </div>

      {/* ── STATS ────────────────────────────────────────── */}
      <div style={{ display: 'flex', padding: '36px 64px', borderBottom: '1px solid var(--border)' }}>
        {[
          { num: selosAtivos.length, label: 'selos ativos' },
          { num: totalLivros.toLocaleString('pt-BR'), label: 'títulos catalogados' },
          { num: totalLancAno.toLocaleString('pt-BR'), label: `lançamentos em ${anoAtual}` },
          { num: totalPrev.toLocaleString('pt-BR'), label: 'em pré-venda' },
        ].map((stat, i, arr) => (
          <div key={i} style={{
            flex: 1,
            paddingRight: i < arr.length - 1 ? '32px' : 0,
            marginRight: i < arr.length - 1 ? '32px' : 0,
            borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 'normal', color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '6px' }}>
              {stat.num}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── MOSAICO ──────────────────────────────────────── */}
      {mosaico.length > 0 && (
        <div style={{ padding: '48px 64px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '24px' }}>
            novos livros
          </div>
          <MosaicoScroll livros={mosaico} />
        </div>
      )}

      {/* ── SELOS (componente client com sort interativo) ── */}
      <SelosGrid selos={selosEnriquecidos} />

    </div>
  )
}
