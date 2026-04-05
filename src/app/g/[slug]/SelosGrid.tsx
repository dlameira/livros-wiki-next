'use client'

import { useState, useMemo } from 'react'
import { SELO_IG_STATS } from '@/lib/selos-data'

export type Capa = {
  isbn: string
  titulo: string
  capa_url: string | null
}

export type SeloEnriquecido = {
  id: number
  nome_display: string
  ativo: boolean
  logoUrl: string | null
  descricao: string | null
  tag: string | null
  covers: Capa[]
  count: number
  nLanc: number
  nPrev: number
  hits: string[]
  igHandle: string | null
}

type SortKey = 'default' | 'catalogo' | 'lancamentos' | 'prevenda'

export default function SelosGrid({ selos }: { selos: SeloEnriquecido[] }) {
  const [sort, setSort] = useState<SortKey>('default')

  const sorted = useMemo(() => {
    // 3 níveis: 0 = ativo com atividade, 1 = sem lançamentos, 2 = inativo formal
    const tier = (s: SeloEnriquecido) => {
      if (s.ativo !== true) return 2
      if (s.nLanc === 0 && s.nPrev === 0) return 1
      return 0
    }

    return [...selos].sort((a, b) => {
      const ta = tier(a)
      const tb = tier(b)
      if (ta !== tb) return ta - tb

      // Dentro do mesmo tier: critério selecionado (só faz sentido no tier 0)
      if (ta === 0) {
        if (sort === 'catalogo')    return b.count - a.count
        if (sort === 'lancamentos') return b.nLanc - a.nLanc
        if (sort === 'prevenda')    return b.nPrev - a.nPrev
      }
      return 0
    })
  }, [selos, sort])

  const btnStyle = (key: SortKey): React.CSSProperties => ({
    fontFamily: 'Georgia, serif',
    fontSize: '0.68rem',
    letterSpacing: '0.06em',
    color: sort === key ? '#c0392b' : 'var(--muted)',
    background: 'none',
    border: `1px solid ${sort === key ? '#c0392b' : 'var(--border)'}`,
    borderRadius: '3px',
    padding: '3px 12px',
    cursor: 'pointer',
    transition: 'color 0.15s, border-color 0.15s',
  })

  return (
    <div style={{ padding: '48px 64px 80px' }}>
      {/* ── Título + sort bar ─────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          selos do grupo
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.6rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginRight: '4px' }}>
            ordenar por
          </span>
          {(['default', 'catalogo', 'lancamentos', 'prevenda'] as SortKey[]).map(key => (
            <button key={key} style={btnStyle(key)} onClick={() => setSort(key)}>
              {key === 'default'    ? 'padrão'
               : key === 'catalogo'    ? 'catálogo'
               : key === 'lancamentos' ? 'lançamentos'
               : 'pré-vendas'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2px' }}>
        {sorted.map(selo => {
          const isInativo = !selo.ativo
          const semLancamentos = !isInativo && selo.nLanc === 0 && selo.nPrev === 0
          const igStats = selo.igHandle ? (SELO_IG_STATS[selo.igHandle] || null) : null

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
              {/* Badge inativo / sem lançamentos */}
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
                  color: '#888', border: '1px solid #555', background: 'rgba(100,100,100,0.08)',
                  padding: '2px 7px', borderRadius: '3px',
                }}>
                  sem lançamentos
                </div>
              )}

              {/* Logo */}
              {selo.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selo.logoUrl}
                  alt={selo.nome_display}
                  style={{ maxHeight: '28px', maxWidth: '110px', width: 'auto', height: 'auto', display: 'block', marginBottom: '10px', opacity: 0.85 }}
                />
              )}

              {/* Header: nome + stats */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: selo.tag ? '8px' : '16px', gap: '12px' }}>
                <div style={{ fontSize: '1.1rem', letterSpacing: '0.03em', color: 'var(--text)' }}>
                  {selo.nome_display}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    <strong style={{ color: 'var(--text)', fontWeight: 'normal' }}>{selo.count.toLocaleString('pt-BR')}</strong>{' '}em catálogo
                  </span>
                  {!isInativo && (
                    <>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        <strong style={{ color: selo.nLanc > 0 ? 'var(--text)' : 'var(--muted)', fontWeight: 'normal' }}>{selo.nLanc}</strong>{' '}últimos 6 meses
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                        <strong style={{ color: selo.nPrev > 0 ? '#c0392b' : 'var(--muted)', fontWeight: 'normal' }}>{selo.nPrev}</strong>{' '}em pré-venda
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Tag editorial */}
              {selo.tag && (
                <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c0392b', marginBottom: '12px', opacity: 0.85 }}>
                  {selo.tag}
                </div>
              )}

              {/* Instagram */}
              {!isInativo && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                  padding: '10px 12px', marginBottom: '16px',
                  background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border)',
                  borderRadius: '4px',
                }}>
                  {/* IG icon */}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px', color: 'var(--muted)' }}>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                  </svg>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {selo.igHandle ? (
                      <>
                        <a
                          href={`https://instagram.com/${selo.igHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text)', textDecoration: 'none', display: 'block', marginBottom: igStats ? '3px' : 0 }}
                        >
                          @{selo.igHandle}
                        </a>
                        {igStats && (
                          <>
                            <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
                              <strong style={{ color: 'var(--text)', fontWeight: 'normal' }}>{igStats.seg}</strong> seguidores
                              {' · '}
                              <strong style={{ color: 'var(--text)', fontWeight: 'normal' }}>{igStats.posts}</strong> posts
                            </div>
                            {igStats.bio && (
                              <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontStyle: 'italic', marginTop: '2px' }}>
                                &ldquo;{igStats.bio}&rdquo;
                              </div>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                        sem instagram próprio
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Descrição */}
              {selo.descricao && (
                <div style={{
                  fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '20px',
                  fontStyle: 'italic',
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {selo.descricao}
                </div>
              )}

              {/* Capas recentes — 2 linhas */}
              {selo.covers.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', overflow: 'hidden', maxHeight: '172px', marginBottom: selo.hits.length > 0 ? '20px' : 0 }}>
                  {selo.covers.map(livro => (
                    <div
                      key={livro.isbn}
                      title={livro.titulo}
                      style={{
                        width: '56px', height: '80px',
                        background: 'var(--border)', borderRadius: '3px',
                        overflow: 'hidden', flexShrink: 0,
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

              {/* Títulos de referência */}
              {selo.hits.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '8px' }}>
                    títulos de referência
                  </div>
                  <ol style={{ margin: 0, padding: '0 0 0 16px', listStyle: 'decimal' }}>
                    {selo.hits.slice(0, 5).map((hit, i) => (
                      <li key={i} style={{ fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '2px' }}>
                        {hit}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {!isInativo && selo.covers.length === 0 && selo.hits.length === 0 && (
                <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                  sem títulos catalogados
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
