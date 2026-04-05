'use client'

import { useState, useMemo, useEffect } from 'react'
import { SELO_IG_STATS } from '@/lib/selos-data'

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus-production-afdd.up.railway.app'

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

// ─── Contributor helpers ──────────────────────────────────────────────────────
const CONTRIBUTOR_TYPES: Record<string, string> = {
  A01: 'autor', A12: 'ilustrador', A38: 'ilustrador', B06: 'tradução',
  B01: 'edição', A36: 'direção de arte', A11: 'fotografias', A09: 'introdução',
}

type Contributor = { type: string; firstName?: string; lastName?: string; groupName?: string }

function formatDate(s: string) {
  if (!s) return ''
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(s + 'T12:00:00'))
}

function formatContributors(contributors: Contributor[]) {
  if (!contributors?.length) return ''
  const groups: Record<string, string[]> = {}
  for (const c of contributors) {
    const role = CONTRIBUTOR_TYPES[c.type]
    if (!role) continue
    const name = c.groupName || [c.firstName, c.lastName].filter(Boolean).join(' ')
    if (!name) continue
    if (!groups[role]) groups[role] = []
    groups[role].push(name)
  }
  return Object.entries(groups)
    .map(([role, names]) => `${role}: ${names.join(', ')}`)
    .join('  ·  ')
}

// ─── Modal target type ────────────────────────────────────────────────────────
type ModalTarget =
  | { type: 'id'; id: number; titulo: string; capa_url: string | null }
  | { type: 'titulo'; titulo: string }

// ─── DetalheModal ─────────────────────────────────────────────────────────────
function DetalheModal({ target, onClose }: { target: ModalTarget; onClose: () => void }) {
  type BookData = {
    id?: number
    isbn?: string
    titulo?: string
    autor?: string
    editora?: string
    capa_url?: string | null
    data_publicacao?: string
    sinopse?: string
    biografia_autor?: string
    contributors?: Contributor[]
  }
  const [data, setData] = useState<BookData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  useEffect(() => {
    setLoading(true)
    setData(null)
    const fields = 'id,isbn,titulo,autor,editora,capa_url,data_publicacao,sinopse,biografia_autor,contributors'
    if (target.type === 'id') {
      fetch(`${DIRECTUS_URL}/items/biblioteca/${target.id}?fields=${fields}`)
        .then(r => r.json())
        .then(j => { setData(j.data || {}); setLoading(false) })
        .catch(() => { setData({}); setLoading(false) })
    } else {
      const filter = encodeURIComponent(JSON.stringify({ titulo: { _icontains: target.titulo } }))
      fetch(`${DIRECTUS_URL}/items/biblioteca?fields=${fields}&filter=${filter}&limit=1`)
        .then(r => r.json())
        .then(j => { setData(j.data?.[0] || null); setLoading(false) })
        .catch(() => { setData(null); setLoading(false) })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const capaUrl = data?.capa_url ?? (target.type === 'id' ? target.capa_url : null)
  const titulo  = data?.titulo ?? target.titulo
  const contribs = data?.contributors ? formatContributors(data.contributors) : ''

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '48px 20px 60px' }}
    >
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, width: 560, maxWidth: '100%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1, padding: 4 }}>✕</button>

        {capaUrl && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 40px 20px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={capaUrl} alt={titulo} style={{ maxWidth: 140, height: 'auto', display: 'block', borderRadius: 3, boxShadow: '0 6px 24px rgba(0,0,0,0.35)' }} />
          </div>
        )}

        <div style={{ padding: capaUrl ? '0 40px 24px' : '48px 40px 24px', textAlign: 'center' }}>
          {data?.editora && (
            <div style={{ fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{data.editora}</div>
          )}
          <h2 style={{ fontSize: '1.35rem', fontWeight: 'normal', lineHeight: 1.35, color: 'var(--text)', marginBottom: 8 }}>{titulo}</h2>
          {data?.autor && <div style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: 14 }}>{data.autor}</div>}
          {(data?.data_publicacao || data?.isbn) && (
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', opacity: .7 }}>
              {data.data_publicacao ? formatDate(data.data_publicacao) : ''}
              {data.isbn && <span style={{ marginLeft: 10, paddingLeft: 10, borderLeft: '1px solid var(--border)' }}>ISBN {data.isbn}</span>}
            </div>
          )}
        </div>

        <div style={{ padding: '20px 40px 36px', borderTop: '1px solid var(--border)' }}>
          {loading && (
            <div style={{ color: 'var(--muted)', fontSize: '0.82rem', opacity: .5, textAlign: 'center', padding: '8px 0' }}>carregando…</div>
          )}
          {!loading && data === null && (
            <div style={{ color: 'var(--muted)', fontSize: '0.82rem', opacity: .5, textAlign: 'center', padding: '8px 0' }}>livro não encontrado</div>
          )}
          {!loading && data !== null && (
            <>
              {contribs && (
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 20, lineHeight: 1.7, textAlign: 'center', opacity: .8 }}>{contribs}</div>
              )}
              {data.sinopse
                ? <div style={{ fontSize: '0.88rem', lineHeight: 1.8, color: 'var(--text)', opacity: .85 }}>
                    {data.sinopse.split('\n').filter(Boolean).map((p, i) => <p key={i} style={{ marginBottom: 14 }}>{p}</p>)}
                  </div>
                : <div style={{ color: 'var(--muted)', fontSize: '0.82rem', opacity: .5, textAlign: 'center', padding: '8px 0' }}>sinopse não disponível</div>
              }
              {data.biografia_autor && (
                <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', opacity: .6, marginBottom: 12, textAlign: 'center' }}>sobre o autor</div>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.75, color: 'var(--text)', opacity: .7 }}>{data.biografia_autor}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
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
      <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        {capa.capa_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capa.capa_url}
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
                      {igHandle ? (
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
                          {isFallbackHandle && (
                            <div style={{ fontSize: '0.63rem', color: 'var(--muted)', opacity: 0.6, fontStyle: 'italic' }}>
                              perfil do grupo
                            </div>
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
