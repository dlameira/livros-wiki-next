'use client'

import { useEffect, useRef, useState } from 'react'
import type { Livro, Selo } from '@/app/page'

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://directus-production-afdd.up.railway.app'
const PAGE_LIMIT = 500
const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']

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

type Props = {
  livros: Livro[]
  totalCount: number
  selos: Selo[]
  editorasAtivas: string[]
  dataFrom: string
  dataTo: string
}

type Preset = 'prevenda' | 'lancamentos' | 'tudo'

function buildDates(preset: Preset) {
  const hoje = new Date(); const ano = hoje.getFullYear(); const mes = hoje.getMonth()
  if (preset === 'prevenda')    return { from: new Date(),                to: new Date(ano, mes + 3, 1) }
  if (preset === 'lancamentos') return { from: new Date(ano, mes - 6, 1), to: new Date(ano, mes + 2, 1) }
  return { from: null, to: null }
}

function toISO(d: Date) { return d.toISOString().split('T')[0] }

function buildGrupos(selos: Selo[]) {
  const map = new Map<string, { nome: string; cor: string }>()
  for (const s of selos) {
    if (s.grupo && !map.has(s.grupo.nome)) map.set(s.grupo.nome, { nome: s.grupo.nome, cor: s.grupo.cor || '#888' })
  }
  return Array.from(map.values()).sort((a, b) => a.nome.localeCompare(b.nome))
}

export default function CatalogoClient({ livros: initialLivros, totalCount: initialTotal, selos, editorasAtivas, dataFrom: initialFrom, dataTo: initialTo }: Props) {
  const grupos = buildGrupos(selos)
  const hoje = new Date()

  // ── Estado de filtros ────────────────────────────────────────────────────────
  const [preset, setPreset]         = useState<Preset>('lancamentos')
  const [dateFrom, setDateFrom]     = useState<Date>(new Date(initialFrom))
  const [dateTo, setDateTo]         = useState<Date>(new Date(initialTo))
  const [fromMonth, setFromMonth]   = useState(new Date(initialFrom).getMonth())
  const [fromYear,  setFromYear]    = useState(new Date(initialFrom).getFullYear())
  const [toMonth,   setToMonth]     = useState(new Date(initialTo).getMonth())
  const [toYear,    setToYear]      = useState(new Date(initialTo).getFullYear())
  const [selectedEditoras, setSelectedEditoras] = useState<Set<string>>(new Set())
  const [autorInput, setAutorInput] = useState('')
  const [autorBusca, setAutorBusca] = useState('')

  // ── Estado de dados ──────────────────────────────────────────────────────────
  const [livros,    setLivros]   = useState<Livro[]>(initialLivros)
  const [total,     setTotal]    = useState(initialTotal)
  const [loading,   setLoading]  = useState(false)
  const [hasMore,   setHasMore]  = useState(initialLivros.length < initialTotal)

  // ── Refs (não causam re-render) ──────────────────────────────────────────────
  const pageRef      = useRef(1)
  const fetchingRef  = useRef(false)
  const fetchGenRef  = useRef(0)
  const seenIds      = useRef(new Set(initialLivros.map(l => l.id)))
  const sentinelRef  = useRef<HTMLDivElement>(null)

  // ── UI ───────────────────────────────────────────────────────────────────────
  const [detalhe, setDetalhe] = useState<Livro | null>(null)
  const [epOpen,  setEpOpen]  = useState(false)
  const [epSearch, setEpSearch] = useState('')

  // ── Fetch ────────────────────────────────────────────────────────────────────
  async function fetchLivros(opts: { reset: boolean; currentPreset: Preset; currentFrom: Date | null; currentTo: Date | null; currentEditoras: Set<string>; currentAutor: string }) {
    if (!opts.reset && fetchingRef.current) return
    const gen = opts.reset ? ++fetchGenRef.current : fetchGenRef.current
    fetchingRef.current = true
    if (opts.reset) setLoading(true)

    const editoras = opts.currentEditoras.size > 0 ? Array.from(opts.currentEditoras) : editorasAtivas
    const conditions: object[] = []

    if (opts.currentPreset === 'tudo') {
      conditions.push({ data_publicacao: { _nnull: true } })
    } else if (opts.currentFrom || opts.currentTo) {
      const d: Record<string, string> = {}
      if (opts.currentFrom) d._gte = toISO(opts.currentFrom)
      if (opts.currentTo)   d._lte = toISO(opts.currentTo)
      conditions.push({ data_publicacao: d })
    }

    conditions.push({ editora: { _in: editoras } })

    if (opts.currentAutor.trim()) {
      opts.currentAutor.trim().split(/\s+/).filter(Boolean)
        .forEach(w => conditions.push({ autor: { _icontains: w } }))
    }

    const filter = conditions.length === 1 ? conditions[0] : { _and: conditions }
    const sort   = opts.currentPreset === 'prevenda' ? 'data_publicacao' : '-data_publicacao'
    const page   = opts.reset ? 1 : pageRef.current + 1

    const url = `${DIRECTUS_URL}/items/biblioteca`
      + `?fields=id,isbn,titulo,autor,editora,capa_url,data_publicacao`
      + `&sort=${sort}&limit=${PAGE_LIMIT}&page=${page}&meta=filter_count`
      + `&filter=${encodeURIComponent(JSON.stringify(filter))}`

    try {
      const res  = await fetch(url)
      const json = await res.json()
      if (gen !== fetchGenRef.current) return  // resultado stale, ignora

      const tc   = json.meta?.filter_count ?? 0
      setTotal(tc)

      const novos: Livro[] = (json.data ?? []).filter((l: Livro) => {
        if (seenIds.current.has(l.id)) return false
        seenIds.current.add(l.id)
        return true
      })

      if (opts.reset) {
        setLivros(novos)
        pageRef.current = 1
        setHasMore(novos.length < tc)
      } else {
        setLivros(prev => [...prev, ...novos])
        pageRef.current = page
        setHasMore(seenIds.current.size < tc)
      }
    } catch (e) {
      if (gen === fetchGenRef.current) console.error(e)
    } finally {
      if (gen === fetchGenRef.current) {
        fetchingRef.current = false
        setLoading(false)
      }
    }
  }

  // ── Refetch ao mudar filtros ──────────────────────────────────────────────────
  useEffect(() => {
    seenIds.current = new Set()
    pageRef.current = 1
    setLivros([])
    fetchLivros({ reset: true, currentPreset: preset, currentFrom: dateFrom, currentTo: dateTo, currentEditoras: selectedEditoras, currentAutor: autorBusca })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, dateFrom, dateTo, selectedEditoras, autorBusca])

  // ── Scroll infinito ──────────────────────────────────────────────────────────
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !fetchingRef.current) {
        fetchLivros({ reset: false, currentPreset: preset, currentFrom: dateFrom, currentTo: dateTo, currentEditoras: selectedEditoras, currentAutor: autorBusca })
      }
    }, { rootMargin: '500px' })
    if (sentinelRef.current) obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, preset, dateFrom, dateTo, selectedEditoras, autorBusca])

  // ── Preset ────────────────────────────────────────────────────────────────────
  function handlePreset(p: Preset) {
    const { from, to } = buildDates(p)
    setPreset(p)
    if (from) { setDateFrom(from); setFromMonth(from.getMonth()); setFromYear(from.getFullYear()) }
    if (to)   { setDateTo(to);     setToMonth(to.getMonth());     setToYear(to.getFullYear()) }
    if (!from) { setDateFrom(new Date(1980, 0, 1)); setFromMonth(0); setFromYear(1980) }
    if (!to)   { setDateTo(new Date(hoje.getFullYear() + 2, 11, 31)); setToMonth(11); setToYear(hoje.getFullYear() + 2) }
  }

  function onDateChange(fM: number, fY: number, tM: number, tY: number) {
    setDateFrom(new Date(fY, fM, 1))
    setDateTo(new Date(tY, tM, 1))
  }

  // ── Autor debounce ────────────────────────────────────────────────────────────
  const autorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  function handleAutorInput(val: string) {
    setAutorInput(val)
    if (autorTimerRef.current) clearTimeout(autorTimerRef.current)
    autorTimerRef.current = setTimeout(() => setAutorBusca(val.trim()), 400)
  }

  function toggleEditora(nome: string) {
    setSelectedEditoras(prev => { const n = new Set(prev); n.has(nome) ? n.delete(nome) : n.add(nome); return n })
  }

  function toggleGrupo(nomeGrupo: string) {
    const selosDoGrupo = selos.filter(s => s.grupo?.nome === nomeGrupo).map(s => s.nome_display)
    const todosAtivos = selosDoGrupo.every(nome => selectedEditoras.has(nome))
    setSelectedEditoras(prev => {
      const n = new Set(prev)
      if (todosAtivos) selosDoGrupo.forEach(nome => n.delete(nome))
      else selosDoGrupo.forEach(nome => n.add(nome))
      return n
    })
  }

  const anoAtual = hoje.getFullYear()
  const years = Array.from({ length: anoAtual + 3 - 1980 }, (_, i) => 1980 + i)
  const selosFiltrados = epSearch.trim() ? selos.filter(s => s.nome_display?.toLowerCase().includes(epSearch.toLowerCase())) : selos
  const selosPorGrupo  = grupos.map(g => ({ grupo: g, selos: selosFiltrados.filter(s => s.grupo?.nome === g.nome) })).filter(g => g.selos.length > 0)
  const selosSemGrupo  = selosFiltrados.filter(s => !s.grupo || s.grupo.nome === 'Independente')
  const selAdicionadas = selos.filter(s => selectedEditoras.has(s.nome_display))

  const sel = (p: Preset) => ({
    padding: '5px 13px', borderRadius: 20, border: '1px solid', fontFamily: 'inherit', fontSize: '0.78rem', cursor: 'pointer',
    borderColor: preset === p ? 'var(--accent)' : 'var(--border)',
    background: preset === p ? 'var(--accent)' : 'transparent',
    color: preset === p ? '#0f0f0f' : 'var(--muted)',
  })

  return (
    <>
      <header style={{ padding: '32px 48px 0', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'normal', letterSpacing: '0.06em', color: '#f0e8dc', marginBottom: 6 }}>
            livros<span style={{ color: 'var(--accent)' }}>.</span>wiki
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>livros sem algoritmos &nbsp;·&nbsp; <span style={{ color: '#444' }}>v 0.01 beta</span></p>
          <p style={{ fontSize: '0.68rem', color: '#333', marginTop: 3 }}>por daniel lameira + metabooks</p>
        </div>
      </header>

      {/* Preset */}
      <div style={{ padding: '16px 48px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={sel('prevenda')}    onClick={() => handlePreset('prevenda')}>pré-venda</button>
        <button style={sel('lancamentos')} onClick={() => handlePreset('lancamentos')}>lançamentos</button>
        <button style={sel('tudo')}        onClick={() => handlePreset('tudo')}>tudo</button>
      </div>

      {/* Datas */}
      <div style={{ padding: '8px 48px 0', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', fontSize: '0.78rem', color: 'var(--muted)' }}>
        <span>de</span>
        <select value={fromMonth} onChange={e => { const v=Number(e.target.value); setFromMonth(v); onDateChange(v, fromYear, toMonth, toYear) }}
          style={{ background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text)', fontSize:'0.78rem', fontFamily:'inherit', padding:'4px 6px', borderRadius:6 }}>
          {MONTHS_PT.map((m,i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={fromYear} onChange={e => { const v=Number(e.target.value); setFromYear(v); onDateChange(fromMonth, v, toMonth, toYear) }}
          style={{ background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text)', fontSize:'0.78rem', fontFamily:'inherit', padding:'4px 6px', borderRadius:6 }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span>até</span>
        <select value={toMonth} onChange={e => { const v=Number(e.target.value); setToMonth(v); onDateChange(fromMonth, fromYear, v, toYear) }}
          style={{ background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text)', fontSize:'0.78rem', fontFamily:'inherit', padding:'4px 6px', borderRadius:6 }}>
          {MONTHS_PT.map((m,i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={toYear} onChange={e => { const v=Number(e.target.value); setToYear(v); onDateChange(fromMonth, fromYear, toMonth, v) }}
          style={{ background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text)', fontSize:'0.78rem', fontFamily:'inherit', padding:'4px 6px', borderRadius:6 }}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Editoras selecionadas */}
      <div style={{ padding: '8px 48px 0', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize:'0.78rem', color:'var(--muted)' }}>editoras</span>
        {selAdicionadas.map(s => (
          <span key={s.nome_display} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px 4px 12px', borderRadius:20, border:'1px solid #3a3a3a', background:'#1e1e1e', fontSize:'0.75rem', color:'var(--text)' }}>
            {s.nome_display}
            <span onClick={() => toggleEditora(s.nome_display)} style={{ cursor:'pointer', color:'var(--muted)', fontSize:'1rem', lineHeight:1 }}>×</span>
          </span>
        ))}
        <button onClick={() => setEpOpen(true)} style={{ background:'transparent', border:'1px dashed var(--border)', color:'var(--muted)', fontSize:'0.75rem', fontFamily:'inherit', padding:'4px 12px', borderRadius:20, cursor:'pointer' }}>
          + adicionar
        </button>
      </div>

      {/* Autor */}
      <div style={{ padding: '8px 48px 0' }}>
        <input type="text" value={autorInput} onChange={e => handleAutorInput(e.target.value)} placeholder="buscar autor…"
          style={{ background:'transparent', border:'1px solid var(--border)', color:'var(--text)', fontSize:'0.78rem', fontFamily:'inherit', padding:'5px 13px', borderRadius:20, outline:'none', width:180 }} />
      </div>

      {/* Status */}
      <div style={{ padding: '12px 48px 0', fontSize: '0.8rem', color: 'var(--muted)', minHeight: 32 }}>
        {loading ? 'carregando…' : total > 0 ? `${total.toLocaleString('pt-BR')} livros` : ''}
      </div>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(130px, 1fr))', gap:'28px 20px', padding:'24px 48px 40px', alignItems:'start' }}>
        {livros.length === 0 && !loading && (
          <div style={{ gridColumn:'1/-1', textAlign:'center', color:'#333', padding:'80px 0', fontSize:'0.9rem' }}>nenhum livro encontrado</div>
        )}
        {livros.map(livro => <BookCard key={livro.id} livro={livro} onClick={() => setDetalhe(livro)} />)}
      </div>

      {/* Sentinel */}
      <div ref={sentinelRef} style={{ height:80, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 48px' }}>
        {!loading && hasMore && livros.length > 0 && <span style={{ fontSize:'0.78rem', color:'#333' }}>carregando mais…</span>}
      </div>

      {detalhe && <DetalheModal livro={detalhe} onClose={() => setDetalhe(null)} />}

      {/* Painel editoras */}
      {epOpen && (
        <div onClick={e => { if (e.target===e.currentTarget) setEpOpen(false) }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:300, display:'flex', justifyContent:'flex-end' }}>
          <div style={{ width:440, maxWidth:'100vw', background:'var(--surface)', borderLeft:'1px solid var(--border)', display:'flex', flexDirection:'column', height:'100%' }}>
            <div style={{ padding:'20px 20px 14px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
              <div>
                <h2 style={{ fontSize:'1rem', fontWeight:'normal', marginBottom:4 }}>editoras</h2>
                <p style={{ fontSize:'0.78rem', color:'var(--muted)' }}>grupos e editoras para filtrar o catálogo</p>
              </div>
              <button onClick={() => setEpOpen(false)} style={{ background:'none', border:'none', color:'var(--muted)', fontSize:'1.1rem', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ padding:'10px 16px', borderBottom:'1px solid #1a1a1a', flexShrink:0 }}>
              <input type="text" value={epSearch} onChange={e => setEpSearch(e.target.value)} placeholder="buscar editora ou grupo…"
                style={{ width:'100%', background:'#111', border:'1px solid var(--border)', color:'var(--text)', fontSize:'0.82rem', fontFamily:'inherit', padding:'7px 12px', borderRadius:6, outline:'none' }} />
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'12px 16px' }}>
              {selosPorGrupo.map(({ grupo, selos: sl }) => {
                const selosDoGrupo = sl.map(s => s.nome_display)
                const todosAtivos = selosDoGrupo.length > 0 && selosDoGrupo.every(n => selectedEditoras.has(n))
                return (
                <div key={grupo.nome} style={{ marginBottom:16 }}>
                  <div onClick={() => toggleGrupo(grupo.nome)} style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:'bold', marginBottom:6, color: todosAtivos ? grupo.cor : grupo.cor, cursor:'pointer', opacity: todosAtivos ? 1 : 0.7, display:'flex', alignItems:'center', gap:6 }}>
                    {todosAtivos && <span style={{ fontSize:'0.6rem' }}>✓</span>}{grupo.nome}
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {sl.map(s => (
                      <button key={s.nome_display} onClick={() => toggleEditora(s.nome_display)} style={{
                        display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:20, border:'1px solid', cursor:'pointer', fontSize:'0.75rem', fontFamily:'inherit',
                        borderColor: selectedEditoras.has(s.nome_display) ? 'var(--accent)' : 'var(--border)',
                        color:       selectedEditoras.has(s.nome_display) ? 'var(--accent)' : 'var(--muted)',
                        background:  selectedEditoras.has(s.nome_display) ? 'rgba(201,168,76,0.08)' : 'transparent',
                      }}>
                        {selectedEditoras.has(s.nome_display) && <span style={{ fontSize:'0.65rem' }}>✓</span>}
                        {s.nome_display}
                      </button>
                    ))}
                  </div>
                </div>
              )
              })}
              {selosSemGrupo.length > 0 && (
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:'bold', marginBottom:6, color:'var(--muted)' }}>independentes</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {selosSemGrupo.map(s => (
                      <button key={s.nome_display} onClick={() => toggleEditora(s.nome_display)} style={{
                        display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:20, border:'1px solid', cursor:'pointer', fontSize:'0.75rem', fontFamily:'inherit',
                        borderColor: selectedEditoras.has(s.nome_display) ? 'var(--accent)' : 'var(--border)',
                        color:       selectedEditoras.has(s.nome_display) ? 'var(--accent)' : 'var(--muted)',
                        background:  selectedEditoras.has(s.nome_display) ? 'rgba(201,168,76,0.08)' : 'transparent',
                      }}>
                        {selectedEditoras.has(s.nome_display) && <span style={{ fontSize:'0.65rem' }}>✓</span>}
                        {s.nome_display}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding:'14px 20px', borderTop:'1px solid var(--border)', display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
              <span style={{ fontSize:'0.78rem', color:'var(--muted)', flex:1 }}>{selectedEditoras.size > 0 ? `${selectedEditoras.size} selecionada${selectedEditoras.size > 1 ? 's' : ''}` : 'todas as ativas'}</span>
              <button onClick={() => setSelectedEditoras(new Set())} style={{ background:'none', border:'1px solid var(--border)', color:'var(--muted)', fontSize:'0.78rem', fontFamily:'inherit', padding:'5px 12px', borderRadius:20, cursor:'pointer' }}>padrão</button>
              <button onClick={() => setEpOpen(false)} style={{ background:'var(--accent)', border:'1px solid var(--accent)', color:'#0f0f0f', fontSize:'0.78rem', fontFamily:'inherit', padding:'5px 12px', borderRadius:20, cursor:'pointer' }}>aplicar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function BookCard({ livro, onClick }: { livro: Livro; onClick: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [hovered,   setHovered]   = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ cursor:'pointer', transform: hovered ? 'translateY(-4px)' : 'none', transition:'transform 0.15s' }}>
      <div style={{ position:'relative', width:'100%', aspectRatio:'2/3', background:'var(--bg)', borderRadius:4, overflow:'hidden', marginBottom:9 }}>
        {livro.capa_url
          ? <img src={livro.capa_url} alt={livro.titulo} onLoad={() => setImgLoaded(true)}
              style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'auto', display:'block', opacity: imgLoaded ? 1 : 0, transition:'opacity 0.35s' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#333', fontSize:'2rem' }}>📖</div>
        }
      </div>
      <div style={{ fontSize:'0.82rem', lineHeight:1.35, color: hovered ? 'var(--accent)' : 'var(--text)', marginBottom:3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', transition:'color 0.15s' }}>
        {livro.titulo}
      </div>
      <div style={{ fontSize:'0.73rem', color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
        {livro.autor}
      </div>
    </div>
  )
}

function DetalheModal({ livro, onClose }: { livro: Livro; onClose: () => void }) {
  const [extra, setExtra] = useState<{ sinopse?: string; biografia_autor?: string; contributors?: Contributor[] } | null>(null)

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  useEffect(() => {
    fetch(`${DIRECTUS_URL}/items/biblioteca/${livro.id}?fields=sinopse,biografia_autor,contributors`)
      .then(r => r.json())
      .then(j => setExtra(j.data || {}))
      .catch(() => setExtra({}))
  }, [livro.id])

  const dataFormatada = livro.data_publicacao ? formatDate(livro.data_publicacao) : ''
  const contribs = extra?.contributors ? formatContributors(extra.contributors) : ''

  return (
    <div onClick={e => { if (e.target===e.currentTarget) onClose() }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'40px 20px' }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, width:680, maxWidth:'100%', overflow:'hidden', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:16, left:20, background:'rgba(0,0,0,0.5)', border:'1px solid #333', color:'#aaa', padding:'6px 12px', borderRadius:6, fontSize:'0.78rem', cursor:'pointer', fontFamily:'inherit', zIndex:10 }}>
          ← voltar
        </button>
        <div style={{ display:'flex', minHeight:280 }}>
          <div style={{ width:200, flexShrink:0, background:'#111', minHeight:280, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
            {livro.capa_url
              ? <img src={livro.capa_url} alt={livro.titulo} style={{ width:'100%', height:'auto', maxHeight:340, objectFit:'contain', display:'block' }} />
              : <div style={{ color:'#2a2a2a', fontSize:'3rem' }}>📖</div>
            }
          </div>
          <div style={{ flex:1, padding:'48px 28px 24px', display:'flex', flexDirection:'column', justifyContent:'flex-end', background:'linear-gradient(to bottom, #111 0%, var(--surface) 100%)' }}>
            {livro.editora && <div style={{ fontSize:'0.72rem', color:'var(--accent)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>{livro.editora}</div>}
            <h2 style={{ fontSize:'1.4rem', fontWeight:'normal', lineHeight:1.3, color:'#f0e8dc', marginBottom:6 }}>{livro.titulo}</h2>
            {livro.autor && <div style={{ fontSize:'0.9rem', color:'#aaa', marginBottom:12 }}>{livro.autor}</div>}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span style={{ fontSize:'0.72rem', padding:'3px 8px', border:'1px solid var(--border)', borderRadius:4, color:'#666' }}>
                {dataFormatada || 'sem data cadastrada'}
              </span>
              {livro.isbn && <span style={{ fontSize:'0.72rem', padding:'3px 8px', border:'1px solid var(--border)', borderRadius:4, color:'#666' }}>ISBN {livro.isbn}</span>}
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:'24px 28px 32px', borderTop:'1px solid var(--border)' }}>
          {extra === null && <div style={{ color:'#444', fontSize:'0.82rem' }}>carregando…</div>}
          {extra !== null && (
            <>
              {contribs && (
                <div style={{ fontSize:'0.78rem', color:'#666', marginBottom:20, lineHeight:1.6 }}>{contribs}</div>
              )}
              {extra.sinopse
                ? <div style={{ fontSize:'0.88rem', lineHeight:1.75, color:'#bbb' }}>
                    {extra.sinopse.split('\n').filter(Boolean).map((p, i) => <p key={i} style={{ marginBottom:12 }}>{p}</p>)}
                  </div>
                : <div style={{ color:'#444', fontSize:'0.82rem' }}>sinopse não disponível</div>
              }
              {extra.biografia_autor && (
                <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid var(--border)' }}>
                  <div style={{ fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.08em', color:'#555', marginBottom:10 }}>sobre o autor</div>
                  <div style={{ fontSize:'0.85rem', lineHeight:1.7, color:'#888' }}>{extra.biografia_autor}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
