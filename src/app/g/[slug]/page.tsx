import { DIRECTUS_URL } from '@/lib/directus'
import { SELO_INFO, HITS, SELO_LOGOS_FALLBACK } from '@/lib/selos-data'
import { notFound } from 'next/navigation'

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
    `${DIRECTUS_URL}/items/selos?filter[grupo][_eq]=${grupo.id}&fields=id,nome_display,total_livros_mb,ativo,logo_url,descricao&limit=200&sort=nome_display`
  )
  const selos: Selo[] = ((await selosRes.json()).data || []).filter((s: Selo) => s.nome_display)

  const selosAtivos = selos.filter(s => s.ativo)
  const selosInativos = selos.filter(s => !s.ativo)

  // Datas para classificação de atividade
  const hoje = new Date().toISOString().slice(0, 10)
  const seisAtras = new Date()
  seisAtras.setMonth(seisAtras.getMonth() - 6)
  const seisAtrasStr = seisAtras.toISOString().slice(0, 10)

  // Fetch covers + real catalog count + lançamentos + pré-vendas per active selo in parallel
  const livrosPorSelo: Record<string, Livro[]> = {}
  const contagemPorSelo: Record<string, number> = {}
  const lancPorSelo: Record<string, number> = {}
  const prevPorSelo: Record<string, number> = {}

  await Promise.all(
    selosAtivos.map(async (selo) => {
      const filterCovers = encodeURIComponent(JSON.stringify({
        _and: [{ editora: { _eq: selo.nome_display } }, { capa_url: { _nnull: true } }]
      }))
      const filterCount = encodeURIComponent(JSON.stringify({ editora: { _eq: selo.nome_display } }))
      const filterLanc = encodeURIComponent(JSON.stringify({
        _and: [
          { editora: { _eq: selo.nome_display } },
          { data_publicacao: { _gte: seisAtrasStr, _lte: hoje } },
        ]
      }))
      const filterPrev = encodeURIComponent(JSON.stringify({
        _and: [
          { editora: { _eq: selo.nome_display } },
          { data_publicacao: { _gt: hoje } },
        ]
      }))

      const [coversRes, countRes, lancRes, prevRes] = await Promise.all([
        fetch(`${DIRECTUS_URL}/items/biblioteca?fields=isbn,titulo,editora,capa_url,data_publicacao&sort=-data_publicacao&limit=16&filter=${filterCovers}`),
        fetch(`${DIRECTUS_URL}/items/biblioteca?limit=0&meta=filter_count&filter=${filterCount}`),
        fetch(`${DIRECTUS_URL}/items/biblioteca?limit=0&meta=filter_count&filter=${filterLanc}`),
        fetch(`${DIRECTUS_URL}/items/biblioteca?limit=0&meta=filter_count&filter=${filterPrev}`),
      ])

      livrosPorSelo[selo.nome_display] = (await coversRes.json()).data || []
      contagemPorSelo[selo.nome_display] = (await countRes.json()).meta?.filter_count || 0
      lancPorSelo[selo.nome_display] = (await lancRes.json()).meta?.filter_count || 0
      prevPorSelo[selo.nome_display] = (await prevRes.json()).meta?.filter_count || 0
    })
  )

  // For inactive selos, use stored total or fetch count
  await Promise.all(
    selosInativos.map(async (selo) => {
      if (selo.total_livros_mb && selo.total_livros_mb > 0) {
        contagemPorSelo[selo.nome_display] = selo.total_livros_mb
      } else {
        const filterCount = encodeURIComponent(JSON.stringify({ editora: { _eq: selo.nome_display } }))
        const countRes = await fetch(`${DIRECTUS_URL}/items/biblioteca?limit=0&meta=filter_count&filter=${filterCount}`)
        contagemPorSelo[selo.nome_display] = (await countRes.json()).meta?.filter_count || 0
      }
    })
  )

  const totalLivros = Object.values(contagemPorSelo).reduce((sum, n) => sum + n, 0)

  // Mosaico: 20 livros mais recentes do grupo
  const nomesSelos = selos.map(s => s.nome_display)
  let mosaico: Livro[] = []
  if (nomesSelos.length > 0) {
    const filter = encodeURIComponent(JSON.stringify({ editora: { _in: nomesSelos }, capa_url: { _nnull: true } }))
    const res = await fetch(
      `${DIRECTUS_URL}/items/biblioteca?fields=isbn,titulo,editora,capa_url&sort=-data_publicacao&limit=24&filter=${filter}`
    )
    mosaico = (await res.json()).data || []
  }

  const sortedSelos = [...selosAtivos, ...selosInativos]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Georgia, serif' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{
        padding: '64px 64px 48px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '32px',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c0392b', marginBottom: '12px' }}>
            grupo editorial
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 'normal', letterSpacing: '0.04em', color: 'var(--text)', lineHeight: 1, marginBottom: '10px' }}>
            {grupo.nome}
          </h1>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>
            {selosAtivos.length} selos ativos · {totalLivros.toLocaleString('pt-BR')} títulos catalogados
          </div>
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────────── */}
      <div style={{ display: 'flex', padding: '36px 64px', borderBottom: '1px solid var(--border)' }}>
        {[
          { num: selosAtivos.length, label: 'selos ativos' },
          { num: selosInativos.length, label: 'selos inativos' },
          { num: totalLivros.toLocaleString('pt-BR'), label: 'títulos catalogados' },
          { num: selos.length, label: 'total de selos' },
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
            lançamentos recentes
          </div>
          <div style={{ display: 'flex', gap: '6px', height: '200px', overflow: 'hidden' }}>
            {mosaico.map(livro => (
              <div key={livro.isbn} style={{ height: '100%', flexShrink: 0, borderRadius: '3px', overflow: 'hidden', background: 'var(--surface)' }}>
                {livro.capa_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={livro.capa_url}
                    alt={livro.titulo}
                    title={livro.titulo}
                    style={{ height: '100%', width: 'auto', display: 'block', objectFit: 'cover' }}
                    loading="lazy"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SELOS ────────────────────────────────────────── */}
      <div style={{ padding: '48px 64px 80px' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '24px' }}>
          selos do grupo
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2px' }}>
          {sortedSelos.map(selo => {
            const covers = livrosPorSelo[selo.nome_display] || []
            const count = contagemPorSelo[selo.nome_display] || 0
            const nLanc = lancPorSelo[selo.nome_display] || 0
            const nPrev = prevPorSelo[selo.nome_display] || 0
            const isInativo = !selo.ativo
            // Selos marcados como ativos mas sem atividade recente
            const semLancamentos = !isInativo && nLanc === 0 && nPrev === 0
            const info = SELO_INFO[selo.nome_display]
            const hits = HITS[selo.nome_display] || []
            const logoUrl = selo.logo_url || SELO_LOGOS_FALLBACK[selo.nome_display] || null
            const descricao = selo.descricao || info?.desc || null

            return (
              <div
                key={selo.id}
                style={{
                  background: isInativo ? 'rgba(192,57,43,0.04)' : 'var(--surface)',
                  padding: '32px',
                  border: isInativo ? '1px solid rgba(192,57,43,0.25)' : '1px solid var(--border)',
                  position: 'relative',
                  opacity: isInativo ? 0.7 : 1,
                }}
              >
                {isInativo && (
                  <div style={{
                    position: 'absolute', top: '14px', right: '14px',
                    fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: '#c0392b', border: '1px solid #c0392b', background: 'rgba(192,57,43,0.08)',
                    padding: '2px 7px', borderRadius: '3px',
                  }}>
                    inativo
                  </div>
                )}
                {semLancamentos && (
                  <div style={{
                    position: 'absolute', top: '14px', right: '14px',
                    fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: '#888', border: '1px solid #444', background: 'rgba(100,100,100,0.08)',
                    padding: '2px 7px', borderRadius: '3px',
                  }}>
                    sem lançamentos
                  </div>
                )}

                {/* Logo */}
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt={selo.nome_display}
                    style={{ maxHeight: '28px', maxWidth: '110px', width: 'auto', height: 'auto', display: 'block', marginBottom: '10px', opacity: 0.85 }}
                  />
                )}

                {/* Header: nome + stats */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: info?.tag ? '8px' : '16px', gap: '12px' }}>
                  <div style={{ fontSize: '1.1rem', letterSpacing: '0.03em', color: 'var(--text)' }}>
                    {selo.nome_display}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: 'var(--text)', fontWeight: 'normal' }}>{count.toLocaleString('pt-BR')}</strong>{' '}em catálogo
                    </span>
                    {!isInativo && (
                      <>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: nLanc > 0 ? 'var(--text)' : 'var(--muted)', fontWeight: 'normal' }}>{nLanc}</strong>{' '}últimos 6 meses
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: nPrev > 0 ? '#c0392b' : 'var(--muted)', fontWeight: 'normal' }}>{nPrev}</strong>{' '}em pré-venda
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Tag */}
                {info?.tag && (
                  <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c0392b', marginBottom: '12px', opacity: 0.85 }}>
                    {info.tag}
                  </div>
                )}

                {/* Descrição */}
                {descricao && (
                  <div style={{
                    fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '20px',
                    fontStyle: 'italic',
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {descricao}
                  </div>
                )}

                {/* Capas recentes — 2 linhas */}
                {covers.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', overflow: 'hidden', maxHeight: '172px', marginBottom: hits.length > 0 ? '20px' : 0 }}>
                    {covers.map(livro => (
                      <div
                        key={livro.isbn}
                        title={livro.titulo}
                        style={{
                          width: '56px', height: '80px', background: 'var(--border)',
                          borderRadius: '3px', overflow: 'hidden', flexShrink: 0,
                          border: '1px solid var(--border)',
                        }}
                      >
                        {livro.capa_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={livro.capa_url}
                            alt={livro.titulo}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            loading="lazy"
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '1.2rem' }}>
                            ◻
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Títulos de referência (HITS) */}
                {hits.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                      títulos de referência
                    </div>
                    <ol style={{ margin: 0, padding: '0 0 0 16px', listStyle: 'decimal' }}>
                      {hits.slice(0, 5).map((hit, i) => (
                        <li key={i} style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '2px' }}>
                          {hit}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {!isInativo && covers.length === 0 && hits.length === 0 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                    sem títulos catalogados
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
