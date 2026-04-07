'use client'

import { useState, useMemo } from 'react'
import { SELO_IG_STATS } from '@/lib/selos-data'
import { DetalheModal, type ModalTarget } from './DetalheModal'

export type Capa = {
  id: number
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

// ─── IG fallback handles ──────────────────────────────────────────────────────
const IG_NAMED_FALLBACK: Record<string, string> = {
  'Galera':        'galerarecord',
  'Galerinha':     'galerarecord',
  'Galera Junior': 'galerarecord',
  'Paz & Terra':   'civilizacaobrasileira',
}
const IG_GROUP_DEFAULT = 'editorarecord'

function resolveIgHandle(selo: SeloEnriquecido): string {
  if (selo.igHandle) return selo.igHandle
  return IG_NAMED_FALLBACK[selo.nome_display] || IG_GROUP_DEFAULT
}

// ─── BookCard ─────────────────────────────────────────────────────────────────
function BookCard({ capa, onClick }: { capa: Capa; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={capa.titulo}
      style={{ cursor: 'pointer', transform: hovered ? 'translateY(-4px)' : 'none', transition: 'transform 0.15s' }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
        {capa.capa_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/cover/${capa.isbn}?size=m`}
            alt={capa.titulo}
            style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 'auto', display: 'block' }}
            loading="lazy"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '1.2rem' }}>◻</div>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SelosGrid({ selos }: { selos: SeloEnriquecido[] }) {
  const [sort, setSort] = useState<SortKey>('default')
  const [modal, setModal] = useState<ModalTarget | null>(null)
  const [modalKey, setModalKey] = useState(0)

  function openModal(target: ModalTarget) {
    setModal(target)
    setModalKey(k => k + 1)
  }

  const sorted = useMemo(() => {
    return [...selos].sort((a, b) => {
      if (a.ativo !== b.ativo) return a.ativo ? -1 : 1
      if (a.ativo && b.ativo) {
        if (sort === 'catalogo')    return b.count - a.count
        if (sort === 'lancamentos') return b.nLanc - a.nLanc
        if (sort === 'prevenda')    return b.nPrev - a.nPrev
      }
      return 0
    })
  }, [selos, sort])

  const btnStyle = (key: SortKey): React.CSSProperties => ({
    fontFamily: 'inherit',
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
    <>
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
                {key === 'default'       ? 'padrão'
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
            const igHandle = isInativo ? null : resolveIgHandle(selo)
            const igStats = igHandle ? (SELO_IG_STATS[igHandle] || null) : null
            const isFallbackHandle = igHandle && !selo.igHandle

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
                {/* Badge inativo */}
                {isInativo && (
                  <div style={{ position: 'absolute', top: '14px', right: '14px', fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c0392b', border: '1px solid #c0392b', background: 'rgba(192,57,43,0.08)', padding: '2px 7px', borderRadius: '3px' }}>
                    sem atividade
                  </div>
                )}

                {/* Logo */}
                {selo.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selo.logoUrl} alt={selo.nome_display} style={{ maxHeight: '28px', maxWidth: '110px', width: 'auto', height: 'auto', display: 'block', marginBottom: '10px', opacity: 0.85 }} />
                )}

                {/* Header: nome + stats */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: selo.tag ? '8px' : '16px', gap: '12px' }}>
                  <div style={{ fontSize: '1.1rem', letterSpacing: '0.03em', color: 'var(--text)' }}>{selo.nome_display}</div>
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

                {/* Instagram card — uniform height */}
                {!isInativo && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', marginBottom: '16px', background: 'rgba(0,0,0,0.03)', border: '1px solid var(--border)', borderRadius: '4px', height: '72px', overflow: 'hidden', boxSizing: 'border-box' }}>
                    {/* IG icon */}
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px', color: 'var(--muted)' }}>
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <circle cx="12" cy="12" r="4"/>
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      {isFallbackHandle ? (
                        <>
                          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontStyle: 'italic', marginBottom: '4px' }}>
                            sem instagram próprio
                          </div>
                          <a
                            href={`https://instagram.com/${igHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.65rem', color: 'var(--muted)', textDecoration: 'none', opacity: 0.6 }}
                          >
                            ver @{igHandle} →
                          </a>
                        </>
                      ) : igHandle ? (
                        <>
                          <a
                            href={`https://instagram.com/${igHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text)', textDecoration: 'none', display: 'block', marginBottom: igStats ? '3px' : '2px' }}
                          >
                            @{igHandle}
                          </a>
                          {igStats && (
                            <>
                              <div style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>
                                <strong style={{ color: 'var(--text)', fontWeight: 'normal' }}>{igStats.seg}</strong> seguidores
                                {' · '}
                                <strong style={{ color: 'var(--text)', fontWeight: 'normal' }}>{igStats.posts}</strong> posts
                              </div>
                              {igStats.bio && (
                                <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontStyle: 'italic', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  &ldquo;{igStats.bio}&rdquo;
                                </div>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontStyle: 'italic' }}>sem instagram próprio</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Descrição */}
                {selo.descricao && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '20px', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {selo.descricao}
                  </div>
                )}

                {/* Capas — grid proporcional 2/3 */}
                {selo.covers.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))', gap: '6px', maxHeight: '176px', overflow: 'hidden', marginBottom: selo.hits.length > 0 ? '20px' : 0 }}>
                    {selo.covers.map(capa => (
                      <BookCard
                        key={capa.isbn}
                        capa={capa}
                        onClick={() => openModal({ type: 'id', id: capa.id, titulo: capa.titulo, capa_url: capa.capa_url })}
                      />
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
                        <HitItem
                          key={i}
                          hit={hit}
                          onClick={() => openModal({ type: 'titulo', titulo: hit.split(' — ')[0].trim() })}
                        />
                      ))}
                    </ol>
                  </div>
                )}

                {!isInativo && selo.covers.length === 0 && selo.hits.length === 0 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontStyle: 'italic' }}>sem títulos catalogados</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <DetalheModal
          key={modalKey}
          target={modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}

// ─── HitItem ──────────────────────────────────────────────────────────────────
function HitItem({ hit, onClick }: { hit: string; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <li
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: '0.75rem',
        color: hovered ? 'var(--text)' : 'var(--muted)',
        lineHeight: 1.5,
        marginBottom: '2px',
        cursor: 'pointer',
        transition: 'color 0.12s',
      }}
    >
      {hit}
    </li>
  )
}
