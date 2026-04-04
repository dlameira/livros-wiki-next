'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus-production-afdd.up.railway.app'
const PAGE_LIMIT = 500
const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

type Livro = {
  id: number
  titulo: string
  autor: string
  editora: string
  capa_url: string | null
  data_publicacao: string
  isbn: string
}

type Selo = {
  id: number
  nome_display: string
  grupo: number | null
}

type Grupo = {
  id: number
  nome: string
  cor: string | null
}

type Props = {
  livros: Livro[]
  totalCount: number
  selos: Selo[]
  grupos: Grupo[]
  dataFrom: string
  dataTo: string
}

type Preset = 'prevenda' | 'lancamentos' | 'tudo'

function buildDates(preset: Preset): { from: Date | null; to: Date | null } {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = hoje.getMonth()
  if (preset === 'prevenda') {
    return { from: new Date(ano, mes, 1), to: new Date(ano, mes + 3, 1) }
  }
  if (preset === 'lancamentos') {
    return { from: new Date(ano, mes - 6, 1), to: new Date(ano, mes + 2, 1) }
  }
  return { from: null, to: null }
}

function toISO(d: Date) { return d.toISOString().split('T')[0] }

export default function CatalogoClient({ livros: initialLivros, totalCount: initialTotal, selos, grupos, dataFrom: initialFrom, dataTo: initialTo }: Props) {
  const hoje = new Date()

  const [preset, setPreset] = useState<Preset>('lancamentos')
  const [dateFrom, setDateFrom] = useState<Date | null>(new Date(initialFrom))
  const [dateTo, setDateTo]     = useState<Date | null>(new Date(initialTo))
  const [fromMonth, setFromMonth] = useState(new Date(initialFrom).getMonth())
  const [fromYear, setFromYear]   = useState(new Date(initialFrom).getFullYear())
  const [toMonth, setToMonth]     = useState(new Date(initialTo).getMonth())
  const [toYear, setToYear]       = useState(new Date(initialTo).getFullYear())

  const [livros, setLivros] = useState<Livro[]>(initialLivros)
  const [total, setTotal]   = useState(initialTotal)
  const [page, setPage]     = useState(1)
  const [hasMore, setHasMore] = useState(initialLivros.length < initialTotal)
  const [isFetching, setIsFetching] = useState(false)

  const [selectedSelos, setSelectedSelos] = useState<Set<number>>(new Set())
  const [autorInput, setAutorInput] = useState('')

  const [detalhe, setDetalhe] = useState<Livro | null>(null)
  const [epOpen, setEpOpen]   = useState(false)
  const [epSearch, setEpSearch] = useState('')

  const sentinelRef = useRef<HTMLDivElement>(null)
  const seenIds = useRef(new Set(initialLivros.map(l => l.id)))

  // ── Fetch livros ────────────────────────────────────────────────────────────
  const fetchLivros = useCallback(async (reset = false) => {
    if (isFetching) return
    setIsFetching(true)

    const params = new URLSearchParams({
      sort: preset === 'prevenda' ? 'data_publicacao' : '-data_publicacao',
      limit: String(PAGE_LIMIT),
      page: String(reset ? 1 : page + 1),
      fields: 'id,titulo,autor,editora,capa_url,data_publicacao,isbn',
      'meta': 'total_count',
    })

    if (dateFrom) params.set('filter[data_publicacao][_gte]', toISO(dateFrom))
    if (dateTo)   params.set('filter[data_publicacao][_lte]', toISO(dateTo))

    if (selectedSelos.size > 0) {
      params.set('filter[editora][selos_id][_in]', Array.from(selectedSelos).join(','))
    } else {
      params.set('filter[editora][selos_id][ativo][_eq]', 'true')
    }

    if (autorInput.trim()) {
      params.set('filter[autor][_icontains]', autorInput.trim())
    }

    try {
      const res = await fetch(`${DIRECTUS_URL}/items/livros?${params}`)
      const json = await res.json()
      const novos: Livro[] = (json.data ?? []).filter((l: Livro) => {
        if (seenIds.current.has(l.id)) return false
        seenIds.current.add(l.id)
        return true
      })

      if (reset) {
        seenIds.current = new Set(novos.map(l => l.id))
        setLivros(novos)
        setPage(1)
      } else {
        setLivros(prev => [...prev, ...novos])
        setPage(p => p + 1)
      }

      const tc = json.meta?.total_count ?? 0
      setTotal(tc)
      setHasMore(reset ? novos.length < tc : (seenIds.current.size) < tc)
    } catch (e) {
      console.error(e)
    } finally {
      setIsFetching(false)
    }
  }, [isFetching, page, preset, dateFrom, dateTo, selectedSelos, autorInput])

  // ── Infinite scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isFetching) {
        fetchLivros(false)
      }
    }, { rootMargin: '500px' })
    if (sentinelRef.current) obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [fetchLivros, hasMore, isFetching])

  // ── Preset ──────────────────────────────────────────────────────────────────
  function handlePreset(p: Preset) {
    const { from, to } = buildDates(p)
    setPreset(p)
    setDateFrom(from)
    setDateTo(to)
    if (from) { setFromMonth(from.getMonth()); setFromYear(from.getFullYear()) }
    if (to)   { setToMonth(to.getMonth()); setToYear(to.getFullYear()) }
  }

  useEffect(() => {
    seenIds.current = new Set()
    setPage(1)
    setHasMore(true)
    setLivros([])
    fetchLivros(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, dateFrom, dateTo, selectedSelos, autorInput])

  // ── Date selects ────────────────────────────────────────────────────────────
  function onDateChange(fM: number, fY: number, tM: number, tY: number) {
    setPreset('lancamentos') // mantém pills coerentes ou deixa livre
    setDateFrom(new Date(fY, fM, 1))
    setDateTo(new Date(tY, tM, 1))
  }

  // ── Anos disponíveis ────────────────────────────────────────────────────────
  const anoAtual = hoje.getFullYear()
  const years = Array.from({ length: anoAtual + 3 - 1980 }, (_, i) => 1980 + i)

  // ── Painel editoras ─────────────────────────────────────────────────────────
  const selosFiltrados = epSearch.trim()
    ? selos.filter(s => s.nome_display.toLowerCase().includes(epSearch.toLowerCase()))
    : selos

  const selosPorGrupo = grupos.map(g => ({
    grupo: g,
    selos: selosFiltrados.filter(s => s.grupo === g.id),
  })).filter(g => g.selos.length > 0)

  const selosSemGrupo = selosFiltrados.filter(s => s.grupo === null)

  function toggleSelo(id: number) {
    setSelectedSelos(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selados = selos.filter(s => selectedSelos.has(s.id))

  return (
    <>
      {/* ── Header ── */}
      <header style={{ padding: '32px 48px 0', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'normal', letterSpacing: '0.06em', color: '#f0e8dc', marginBottom: 6 }}>
            livros<span style={{ color: 'var(--accent)' }}>.</span>wiki
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
            livros sem algoritmos &nbsp;·&nbsp; <span style={{ color: '#444' }}>v 0.01 beta</span>
          </p>
          <p style={{ fontSize: '0.68rem', color: '#333', marginTop: 3 }}>por daniel lameira + metabooks</p>
        </div>
      </header>

      {/* ── Filtros: preset ── */}
      <div style={{ padding: '16px 48px 0', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['prevenda', 'lancamentos', 'tudo'] as Preset[]).map(p => (
          <button
            key={p}
            onClick={() => handlePreset(p)}
            style={{
              padding: '5px 13px',
              borderRadius: 20,
              border: '1px solid',
              borderColor: preset === p ? 'var(--accent)' : 'var(--border)',
              fontSize: '0.78rem',
              cursor: 'pointer',
              background: preset === p ? 'var(--accent)' : 'transparent',
              color: preset === p ? '#0f0f0f' : 'var(--muted)',
              fontFamily: 'inherit',
            }}
          >
            {p === 'prevenda' ? 'pré-venda' : p === 'lancamentos' ? 'lançamentos' : 'tudo'}
          </button>
        ))}
      </div>

      {/* ── Filtros: datas ── */}
      <div style={{ padding: '8px 48px 0', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', fontSize: '0.78rem', color: 'var(--muted)' }}>
        <span>de</span>
        <select value={fromMonth} onChange={e => { const v = Number(e.target.value); setFromMonth(v); onDateChange(v, fromYear, toMonth, toYear) }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.78rem', fontFamily: 'inherit', padding: '4px 6px', borderRadius: 6 }}>
          {MONTHS_PT.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={fromYear} onChange={e => { const v = Number(e.target.value); setFromYear(v); onDateChange(fromMonth, v, toMonth, toYear) }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.78rem', fontFamily: 'inherit', padding: '4px 6px', borderRadius: 6 }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span>até</span>
        <select value={toMonth} onChange={e => { const v = Number(e.target.value); setToMonth(v); onDateChange(fromMonth, fromYear, v, toYear) }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.78rem', fontFamily: 'inherit', padding: '4px 6px', borderRadius: 6 }}>
          {MONTHS_PT.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={toYear} onChange={e => { const v = Number(e.target.value); setToYear(v); onDateChange(fromMonth, fromYear, toMonth, v) }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.78rem', fontFamily: 'inherit', padding: '4px 6px', borderRadius: 6 }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* ── Filtros: editoras ── */}
      <div style={{ padding: '8px 48px 0', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>editoras</span>
        {selados.map(s => (
          <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px 4px 12px', borderRadius: 20, border: '1px solid #3a3a3a', background: '#1e1e1e', fontSize: '0.75rem', color: 'var(--text)' }}>
            {s.nome_display}
            <span onClick={() => toggleSelo(s.id)} style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: '1rem', lineHeight: 1 }}>×</span>
          </span>
        ))}
        <button onClick={() => setEpOpen(true)}
          style={{ background: 'transparent', border: '1px dashed var(--border)', color: 'var(--muted)', fontSize: '0.75rem', fontFamily: 'inherit', padding: '4px 12px', borderRadius: 20, cursor: 'pointer' }}>
          + adicionar
        </button>
      </div>

      {/* ── Filtro: autor ── */}
      <div style={{ padding: '8px 48px 0' }}>
        <input
          type="text"
          value={autorInput}
          onChange={e => setAutorInput(e.target.value)}
          placeholder="buscar autor…"
          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.78rem', fontFamily: 'inherit', padding: '5px 13px', borderRadius: 20, outline: 'none', width: 180 }}
        />
      </div>

      {/* ── Status ── */}
      <div style={{ padding: '12px 48px 0', fontSize: '0.8rem', color: 'var(--muted)', minHeight: 32 }}>
        {isFetching && livros.length === 0 ? 'carregando…' : total > 0 ? `${total.toLocaleString('pt-BR')} livros` : ''}
      </div>

      {/* ── Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '28px 20px',
        padding: '24px 48px 40px',
        alignItems: 'start',
      }}>
        {livros.length === 0 && !isFetching && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#333', padding: '80px 0', fontSize: '0.9rem' }}>
            nenhum livro encontrado
          </div>
        )}
        {livros.map(livro => (
          <BookCard key={livro.id} livro={livro} onClick={() => setDetalhe(livro)} />
        ))}
      </div>

      {/* ── Sentinel scroll infinito ── */}
      <div ref={sentinelRef} style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 48px' }}>
        {isFetching && <span style={{ fontSize: '0.78rem', color: '#333' }}>carregando…</span>}
      </div>

      {/* ── Detalhe modal ── */}
      {detalhe && (
        <DetalheModal livro={detalhe} onClose={() => setDetalhe(null)} />
      )}

      {/* ── Painel editoras ── */}
      {epOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setEpOpen(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 440, maxWidth: '100vw', background: 'var(--surface)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '20px 20px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 'normal', marginBottom: 4 }}>editoras</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>grupos e editoras para filtrar o catálogo</p>
              </div>
              <button onClick={() => setEpOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
              <input type="text" value={epSearch} onChange={e => setEpSearch(e.target.value)} placeholder="buscar editora ou grupo…"
                style={{ width: '100%', background: '#111', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.82rem', fontFamily: 'inherit', padding: '7px 12px', borderRadius: 6, outline: 'none' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
              {selosPorGrupo.map(({ grupo, selos: sl }) => (
                <div key={grupo.id} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 'bold', marginBottom: 6, color: grupo.cor || 'var(--muted)' }}>
                    {grupo.nome}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {sl.map(s => (
                      <button key={s.id} onClick={() => toggleSelo(s.id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px',
                          borderRadius: 20, border: '1px solid', cursor: 'pointer', fontSize: '0.75rem',
                          fontFamily: 'inherit', userSelect: 'none', transition: 'all 0.12s',
                          borderColor: selectedSelos.has(s.id) ? 'var(--accent)' : 'var(--border)',
                          color: selectedSelos.has(s.id) ? 'var(--accent)' : 'var(--muted)',
                          background: selectedSelos.has(s.id) ? 'rgba(201,168,76,0.08)' : 'transparent',
                        }}>
                        {selectedSelos.has(s.id) && <span style={{ fontSize: '0.65rem' }}>✓ </span>}
                        {s.nome_display}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {selosSemGrupo.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 'bold', marginBottom: 6, color: 'var(--muted)' }}>
                    independentes
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selosSemGrupo.map(s => (
                      <button key={s.id} onClick={() => toggleSelo(s.id)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px',
                          borderRadius: 20, border: '1px solid', cursor: 'pointer', fontSize: '0.75rem',
                          fontFamily: 'inherit', userSelect: 'none',
                          borderColor: selectedSelos.has(s.id) ? 'var(--accent)' : 'var(--border)',
                          color: selectedSelos.has(s.id) ? 'var(--accent)' : 'var(--muted)',
                          background: selectedSelos.has(s.id) ? 'rgba(201,168,76,0.08)' : 'transparent',
                        }}>
                        {selectedSelos.has(s.id) && <span style={{ fontSize: '0.65rem' }}>✓ </span>}
                        {s.nome_display}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', flex: 1 }}>{selectedSelos.size > 0 ? `${selectedSelos.size} selecionada${selectedSelos.size > 1 ? 's' : ''}` : 'todas as ativas'}</span>
              <button onClick={() => setSelectedSelos(new Set())}
                style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.78rem', fontFamily: 'inherit', padding: '5px 12px', borderRadius: 20, cursor: 'pointer' }}>
                padrão
              </button>
              <button onClick={() => setEpOpen(false)}
                style={{ background: 'var(--accent)', border: '1px solid var(--accent)', color: '#0f0f0f', fontSize: '0.78rem', fontFamily: 'inherit', padding: '5px 12px', borderRadius: 20, cursor: 'pointer' }}>
                aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function BookCard({ livro, onClick }: { livro: Livro; onClick: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer', transform: hovered ? 'translateY(-4px)' : 'none', transition: 'transform 0.15s' }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', background: 'var(--bg)', borderRadius: 4, overflow: 'hidden', marginBottom: 9 }}>
        {livro.capa_url ? (
          <img
            src={livro.capa_url}
            alt={livro.titulo}
            onLoad={() => setImgLoaded(true)}
            style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 'auto', display: 'block', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.35s' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '2rem' }}>📖</div>
        )}
      </div>
      <div style={{ fontSize: '0.82rem', lineHeight: 1.35, color: hovered ? 'var(--accent)' : 'var(--text)', marginBottom: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color 0.15s' }}>
        {livro.titulo}
      </div>
      <div style={{ fontSize: '0.73rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {livro.autor}
      </div>
    </div>
  )
}

function DetalheModal({ livro, onClose }: { livro: Livro; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const dataFormatada = livro.data_publicacao
    ? new Date(livro.data_publicacao).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : ''

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '40px 20px' }}
    >
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, width: 680, maxWidth: '100%', overflow: 'hidden', position: 'relative' }}>
        <button onClick={onClose}
          style={{ position: 'absolute', top: 16, left: 20, background: 'rgba(0,0,0,0.5)', border: '1px solid #333', color: '#aaa', padding: '6px 12px', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', zIndex: 10 }}>
          ← voltar
        </button>
        <div style={{ display: 'flex', minHeight: 280 }}>
          <div style={{ width: 180, flexShrink: 0, background: '#111' }}>
            {livro.capa_url
              ? <img src={livro.capa_url} alt={livro.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2a2a2a', fontSize: '3rem' }}>📖</div>
            }
          </div>
          <div style={{ flex: 1, padding: '48px 28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'linear-gradient(to bottom, #111 0%, var(--surface) 100%)' }}>
            {livro.editora && <div style={{ fontSize: '0.72rem', color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>{livro.editora}</div>}
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'normal', lineHeight: 1.3, color: '#f0e8dc', marginBottom: 6 }}>{livro.titulo}</h2>
            {livro.autor && <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: 12 }}>{livro.autor}</div>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {dataFormatada && <span style={{ fontSize: '0.72rem', padding: '3px 8px', border: '1px solid var(--border)', borderRadius: 4, color: '#666' }}>{dataFormatada}</span>}
              {livro.isbn && <span style={{ fontSize: '0.72rem', padding: '3px 8px', border: '1px solid var(--border)', borderRadius: 4, color: '#666' }}>ISBN {livro.isbn}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
