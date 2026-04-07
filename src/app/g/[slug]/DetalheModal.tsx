'use client'

import { useState, useEffect } from 'react'

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus-production-afdd.up.railway.app'

const CONTRIBUTOR_TYPES: Record<string, string> = {
  A01: 'autor', A12: 'ilustrador', A38: 'ilustrador', B06: 'tradução',
  B01: 'edição', A36: 'direção de arte', A11: 'fotografias', A09: 'introdução',
}

type Contributor = { type: string; firstName?: string; lastName?: string; groupName?: string }

function formatDate(s: string | Date) {
  if (!s) return ''
  const d = s instanceof Date ? s : new Date(s + 'T12:00:00')
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
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

export type ModalTarget =
  | { type: 'id';    id: number; titulo: string; capa_url: string | null }
  | { type: 'titulo'; titulo: string }

export function DetalheModal({ target, onClose }: { target: ModalTarget; onClose: () => void }) {
  type BookData = {
    id?: number; isbn?: string; titulo?: string; autor?: string
    editora?: string; capa_url?: string | null; data_publicacao?: string
    sinopse?: string; biografia_autor?: string; contributors?: Contributor[]
  }
  const [data, setData] = useState<BookData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  useEffect(() => {
    setLoading(true); setData(null)
    const fields = 'id,isbn,titulo,autor,editora,capa_url,data_publicacao,sinopse,biografia_autor,contributors'
    if (target.type === 'id') {
      fetch(`${DIRECTUS_URL}/items/biblioteca/${target.id}?fields=${fields}`)
        .then(r => r.json()).then(j => { setData(j.data || {}); setLoading(false) })
        .catch(() => { setData({}); setLoading(false) })
    } else {
      const filter = encodeURIComponent(JSON.stringify({ titulo: { _icontains: target.titulo } }))
      fetch(`${DIRECTUS_URL}/items/biblioteca?fields=${fields}&filter=${filter}&limit=1`)
        .then(r => r.json()).then(j => { setData(j.data?.[0] || null); setLoading(false) })
        .catch(() => { setData(null); setLoading(false) })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const capaUrl  = data?.isbn ? `/api/cover/${data.isbn}?size=m` : (target.type === 'id' ? target.capa_url : null)
  const titulo   = data?.titulo ?? target.titulo
  const contribs = data?.contributors ? formatContributors(data.contributors) : ''

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '48px 20px 60px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, width: 560, maxWidth: '100%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1, padding: 4 }}>✕</button>

        {capaUrl && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 40px 20px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={capaUrl} alt={titulo} style={{ maxWidth: 140, height: 'auto', display: 'block', borderRadius: 3, boxShadow: '0 6px 24px rgba(0,0,0,0.35)' }} />
          </div>
        )}

        <div style={{ padding: capaUrl ? '0 40px 24px' : '48px 40px 24px', textAlign: 'center' }}>
          {data?.editora && <div style={{ fontSize: '0.68rem', color: 'var(--accent-fg)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>{data.editora}</div>}
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
          {loading && <div style={{ color: 'var(--muted)', fontSize: '0.82rem', opacity: .5, textAlign: 'center', padding: '8px 0' }}>carregando…</div>}
          {!loading && data === null && <div style={{ color: 'var(--muted)', fontSize: '0.82rem', opacity: .5, textAlign: 'center', padding: '8px 0' }}>livro não encontrado</div>}
          {!loading && data !== null && (
            <>
              {contribs && <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 20, lineHeight: 1.7, textAlign: 'center', opacity: .8 }}>{contribs}</div>}
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
