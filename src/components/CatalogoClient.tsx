'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Livro, Selo } from '@/app/page'
import SiteHeader from '@/components/SiteHeader'

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
  const [buscaInput, setBuscaInput] = useState('')
  const [buscaQuery, setBuscaQuery] = useState('')

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

  // ── Configurações ─────────────────────────────────────────────────────────────
  const [tema,             setTema]             = useState<'dark'|'light'>('light')
  const [curadoria,        setCuradoria]        = useState(true)
  const [mostrarSemData,   setMostrarSemData]   = useState(false)
  const [ocultarSemImagem, setOcultarSemImagem] = useState(true)
  const [gridSize,         setGridSize]         = useState<'compacta'|'padrao'|'grande'>('padrao')
  const [settingsOpen,     setSettingsOpen]     = useState(false)

  useEffect(() => {
    const t = localStorage.getItem('livros-tema') as 'dark'|'light' | null
    if (t) setTema(t)
    if (localStorage.getItem('livros-curadoria') === 'true') setCuradoria(true)
    if (localStorage.getItem('livros-sem-data') === 'false') setMostrarSemData(false)
    if (localStorage.getItem('livros-sem-imagem') === 'true') setOcultarSemImagem(true)
    const g = localStorage.getItem('livros-grid') as 'compacta'|'padrao'|'grande' | null
    if (g) setGridSize(g)
  }, [])

  useEffect(() => { localStorage.setItem('livros-curadoria',    String(curadoria)) },        [curadoria])
  useEffect(() => { localStorage.setItem('livros-sem-data',     String(mostrarSemData)) },   [mostrarSemData])
  useEffect(() => { localStorage.setItem('livros-sem-imagem',   String(ocultarSemImagem)) }, [ocultarSemImagem])
  useEffect(() => { localStorage.setItem('livros-grid',         gridSize) },                 [gridSize])

  function applyTema(t: 'dark'|'light') {
    setTema(t)
    document.documentElement.classList.toggle('light', t === 'light')
    localStorage.setItem('livros-tema', t)
  }

  // ── Fetch via PostgreSQL (busca textual) ─────────────────────────────────────
  async function fetchSearch(q: string, opts: { currentPreset: Preset; currentFrom: Date | null; currentTo: Date | null; currentEditoras: Set<string>; curadoria: boolean }) {
    const gen = ++fetchGenRef.current
    fetchingRef.current = true
    setLoading(true)
    const editoras = opts.currentEditoras.size > 0
      ? Array.from(opts.currentEditoras)
      : (opts.curadoria ? editorasAtivas : [])
    const params = new URLSearchParams({ q })
    if (opts.currentPreset !== 'tudo') {
      if (opts.currentFrom) params.set('from', toISO(opts.currentFrom))
      if (opts.currentTo)   params.set('to',   toISO(opts.currentTo))
    }
    if (editoras.length) params.set('editoras', editoras.join(','))
    try {
      const res  = await fetch(`/api/search?${params}`)
      const json = await res.json()
      if (gen !== fetchGenRef.current) return
      const data: Livro[] = json.data ?? []
      setLivros(data)
      setTotal(json.total ?? 0)
      setHasMore(false)
      seenIds.current = new Set(data.map(l => l.id))
      pageRef.current = 1
    } catch (e) {
      if (gen === fetchGenRef.current) console.error(e)
    } finally {
      if (gen === fetchGenRef.current) { fetchingRef.current = false; setLoading(false) }
    }
  }

  // ── Fetch via Directus (sem busca textual) ───────────────────────────────────
  async function fetchLivros(opts: { reset: boolean; currentPreset: Preset; currentFrom: Date | null; currentTo: Date | null; currentEditoras: Set<string>; curadoria: boolean; mostrarSemData: boolean }) {
    if (!opts.reset && fetchingRef.current) return
    const gen = opts.reset ? ++fetchGenRef.current : fetchGenRef.current
    fetchingRef.current = true
    if (opts.reset) setLoading(true)

    const editoras = opts.currentEditoras.size > 0 ? Array.from(opts.currentEditoras) : []
    const conditions: object[] = []

    if (opts.currentPreset === 'tudo') {
      if (!opts.mostrarSemData) conditions.push({ data_publicacao: { _nnull: true } })
    } else if (opts.currentFrom || opts.currentTo) {
      const d: Record<string, string> = {}
      if (opts.currentFrom) d._gte = toISO(opts.currentFrom)
      if (opts.currentTo)   d._lte = toISO(opts.currentTo)
      conditions.push({ data_publicacao: d })
    }

    if (editoras.length > 0) {
      conditions.push({ editora: { _in: editoras } })
    } else if (opts.curadoria && editorasAtivas.length > 0) {
      conditions.push({ editora: { _in: editorasAtivas } })
    }

    const filter = conditions.length === 1 ? conditions[0] : conditions.length > 1 ? { _and: conditions } : {}
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
    if (buscaQuery) {
      fetchSearch(buscaQuery, { currentPreset: preset, currentFrom: dateFrom, currentTo: dateTo, currentEditoras: selectedEditoras, curadoria })
    } else {
      fetchLivros({ reset: true, currentPreset: preset, currentFrom: dateFrom, currentTo: dateTo, currentEditoras: selectedEditoras, curadoria, mostrarSemData })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, dateFrom, dateTo, selectedEditoras, buscaQuery, curadoria, mostrarSemData])

  // ── Scroll infinito (apenas sem busca textual) ───────────────────────────────
  useEffect(() => {
    if (buscaQuery) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !fetchingRef.current) {
        fetchLivros({ reset: false, currentPreset: preset, currentFrom: dateFrom, currentTo: dateTo, currentEditoras: selectedEditoras, curadoria, mostrarSemData })
      }
    }, { rootMargin: '500px' })
    if (sentinelRef.current) obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, preset, dateFrom, dateTo, selectedEditoras, buscaQuery, curadoria, mostrarSemData])

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

  // ── Busca debounce ────────────────────────────────────────────────────────────
  const buscaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  function handleBuscaInput(val: string) {
    setBuscaInput(val)
    if (buscaTimerRef.current) clearTimeout(buscaTimerRef.current)
    buscaTimerRef.current = setTimeout(() => setBuscaQuery(val.trim()), 400)
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
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const selosFiltrados = epSearch.trim() ? selos.filter(s => normalize(s.nome_display ?? '').includes(normalize(epSearch))) : selos
  const selosPorGrupo  = grupos.map(g => ({ grupo: g, selos: selosFiltrados.filter(s => s.grupo?.nome === g.nome) })).filter(g => g.selos.length > 0)
  const selosSemGrupo  = selosFiltrados.filter(s => !s.grupo || s.grupo.nome === 'Independente')
  const selAdicionadas = selos.filter(s => selectedEditoras.has(s.nome_display))

  const gridMinMax     = gridSize === 'compacta' ? '90px' : gridSize === 'grande' ? '160px' : '120px'
  const livrosVisiveis = ocultarSemImagem ? livros.filter(l => l.capa_url) : livros

  const settingsBtn = (
    <button onClick={() => setSettingsOpen(true)}
      style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.72rem', fontFamily: 'inherit', padding: '5px 12px', borderRadius: 20, cursor: 'pointer', letterSpacing: '0.04em' }}>
      ⚙ configurar
    </button>
  )

  const sel = (p: Preset) => ({
    padding: '5px 16px', borderRadius: 20, border: '1px solid', fontFamily: 'inherit',
    fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: 'pointer',
    borderColor: preset === p ? 'var(--accent)' : 'var(--border)',
    background: preset === p ? 'var(--accent)' : 'transparent',
    color: preset === p ? '#0f0f0f' : 'var(--muted)',
    fontWeight: preset === p ? 700 : 500,
  })

  return (
    <>
      <SiteHeader action={settingsBtn} />

      {/* Preset */}
      <div style={{ padding: '24px 48px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={sel('prevenda')}    onClick={() => handlePreset('prevenda')}>pré-venda</button>
        <button style={sel('lancamentos')} onClick={() => handlePreset('lancamentos')}>lançamentos</button>
        <button style={sel('tudo')}        onClick={() => handlePreset('tudo')}>catálogo</button>
      </div>

      {/* Datas — só aparece no catálogo completo */}
      {preset === 'tudo' && <div style={{ padding: '12px 48px 0', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', fontSize: '0.78rem', color: 'var(--muted)' }}>
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
      </div>}

      {/* Editoras selecionadas */}
      <div style={{ padding: '12px 48px 0', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize:'0.78rem', color:'var(--muted)' }}>editoras</span>
        {selAdicionadas.map(s => (
          <span key={s.nome_display} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px 4px 12px', borderRadius:20, border:'1px solid var(--border)', background:'var(--surface)', fontSize:'0.75rem', color:'var(--text)' }}>
            {s.nome_display}
            <span onClick={() => toggleEditora(s.nome_display)} style={{ cursor:'pointer', color:'var(--muted)', fontSize:'1rem', lineHeight:1 }}>×</span>
          </span>
        ))}
        <button onClick={() => setEpOpen(true)} style={{ background:'transparent', border:'1px dashed var(--border)', color:'var(--muted)', fontSize:'0.75rem', fontFamily:'inherit', padding:'4px 12px', borderRadius:20, cursor:'pointer' }}>
          {selectedEditoras.size > 0 ? '+ adicionar' : '+ selecionar'}
        </button>
      </div>

      {/* Autor */}
      <div style={{ padding: '12px 48px 0' }}>
        <input type="text" value={buscaInput} onChange={e => handleBuscaInput(e.target.value)} placeholder="buscar"
          style={{ background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text)', fontSize:'0.78rem', fontFamily:'inherit', fontWeight:400, padding:'5px 13px', borderRadius:20, outline:'none', width:140 }} />
      </div>

      {/* Status */}
      <div style={{ padding: '20px 48px 0', display: 'flex', alignItems: 'baseline', gap: 6, minHeight: 28 }}>
        {!loading && total > 0 && <>
          <span style={{ fontSize: '0.88rem', fontWeight: 400, color: 'var(--text)' }}>
            {total.toLocaleString('pt-BR')}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>livros</span>
        </>}
        {loading && <span style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.08em' }}>carregando…</span>}
      </div>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:`repeat(auto-fill, minmax(${gridMinMax}, 1fr))`, gap:'20px 14px', padding:'16px 48px 40px', alignItems:'start' }}>
        {livrosVisiveis.length === 0 && !loading && (
          <div style={{ gridColumn:'1/-1', textAlign:'center', color:'#333', padding:'80px 0', fontSize:'0.9rem' }}>nenhum livro encontrado</div>
        )}
        {livrosVisiveis.map(livro => <BookCard key={livro.id} livro={livro} onClick={() => setDetalhe(livro)} />)}
      </div>

      {/* Sentinel */}
      <div ref={sentinelRef} style={{ height:80, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 48px' }}>
        {!loading && hasMore && livros.length > 0 && <span style={{ fontSize:'0.78rem', color:'#333' }}>carregando mais…</span>}
      </div>

      {detalhe && <DetalheModal livro={detalhe} onClose={() => setDetalhe(null)} />}

      {/* Painel de configurações */}
      {settingsOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setSettingsOpen(false) }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.22)', zIndex:400, display:'flex', justifyContent:'flex-end' }}>
          <div style={{
            width: 280, maxWidth: '100vw', height: '100%',
            background: '#fbf236', color: '#0f0f0f',
            borderLeft: '1px solid rgba(0,0,0,0.14)',
            display: 'flex', flexDirection: 'column',
            fontFamily: 'var(--font-sans), sans-serif',
          }}>
            {/* Header do painel */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'22px 20px 16px', borderBottom:'1px solid rgba(0,0,0,0.08)', flexShrink:0 }}>
              <span style={{ fontSize:'0.62rem', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:500, opacity:.5 }}>configurações</span>
              <button onClick={() => setSettingsOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#0f0f0f', fontSize:'1rem', lineHeight:1, padding:4, opacity:.4 }}>✕</button>
            </div>

            {/* Corpo com settings */}
            <div style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
              <SettingRow label="tema">
                {(['light','dark'] as const).map(t => (
                  <SettingBtn key={t} active={tema === t} onClick={() => applyTema(t)}>
                    {t === 'light' ? 'claro' : 'escuro'}
                  </SettingBtn>
                ))}
              </SettingRow>

              <SettingRow label="catálogo" hint={curadoria ? 'editoras selecionadas pelo livros.wiki' : undefined}>
                <SettingBtn active={!curadoria} onClick={() => setCuradoria(false)}>todas as editoras</SettingBtn>
                <SettingBtn active={curadoria}  onClick={() => setCuradoria(true)}>curadoria</SettingBtn>
              </SettingRow>

              <SettingRow label="livros sem data de lançamento">
                <SettingBtn active={mostrarSemData}  onClick={() => setMostrarSemData(true)}>mostrar</SettingBtn>
                <SettingBtn active={!mostrarSemData} onClick={() => setMostrarSemData(false)}>ocultar</SettingBtn>
              </SettingRow>

              <SettingRow label="livros sem capa">
                <SettingBtn active={!ocultarSemImagem} onClick={() => setOcultarSemImagem(false)}>mostrar</SettingBtn>
                <SettingBtn active={ocultarSemImagem}  onClick={() => setOcultarSemImagem(true)}>ocultar</SettingBtn>
              </SettingRow>

              <SettingRow label="grade">
                {(['compacta','padrao','grande'] as const).map(g => (
                  <SettingBtn key={g} active={gridSize === g} onClick={() => setGridSize(g)}>
                    {g === 'padrao' ? 'padrão' : g}
                  </SettingBtn>
                ))}
              </SettingRow>
            </div>
          </div>
        </div>
      )}

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
            <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
              <input type="text" value={epSearch} onChange={e => setEpSearch(e.target.value)} placeholder="buscar editora ou grupo…"
                style={{ width:'100%', background:'var(--surface)', border:'1px solid var(--border)', color:'var(--text)', fontSize:'0.82rem', fontFamily:'inherit', padding:'7px 12px', borderRadius:6, outline:'none' }} />
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
                        color:       selectedEditoras.has(s.nome_display) ? 'var(--accent-fg)' : 'var(--muted)',
                        background:  selectedEditoras.has(s.nome_display) ? 'rgba(251,242,54,0.12)' : 'transparent',
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
                        color:       selectedEditoras.has(s.nome_display) ? 'var(--accent-fg)' : 'var(--muted)',
                        background:  selectedEditoras.has(s.nome_display) ? 'rgba(251,242,54,0.12)' : 'transparent',
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

function SettingRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(0,0,0,0.07)' }}>
      <div style={{ fontSize:'0.6rem', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:500, marginBottom:10, opacity:.4 }}>{label}</div>
      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>{children}</div>
      {hint && <div style={{ fontSize:'0.65rem', lineHeight:1.5, marginTop:8, opacity:.45 }}>{hint}</div>}
    </div>
  )
}

function SettingBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding:'4px 12px', borderRadius:20, cursor:'pointer',
      fontSize:'0.72rem', fontFamily:'inherit',
      border: active ? '1px solid rgba(0,0,0,0.25)' : '1px solid transparent',
      background: active ? 'rgba(0,0,0,0.08)' : 'transparent',
      color: '#0f0f0f',
      fontWeight: active ? 600 : 400,
      opacity: active ? 1 : 0.45,
      letterSpacing: '0.01em',
    }}>{children}</button>
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
          ? <img src={`/api/cover/${livro.isbn}?size=m`} alt={livro.titulo} loading="lazy" onLoad={() => setImgLoaded(true)}
              style={{ position:'absolute', bottom:0, left:0, width:'100%', height:'auto', display:'block', opacity: imgLoaded ? 1 : 0, transition:'opacity 0.35s' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#333', fontSize:'2rem' }}>📖</div>
        }
      </div>
      <div className="font-serif" style={{ fontSize:'0.82rem', lineHeight:1.35, color: hovered ? 'var(--accent-fg)' : 'var(--text)', marginBottom:3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', transition:'color 0.15s' }}>
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
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:200, display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'48px 20px 60px' }}>
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, width:560, maxWidth:'100%', position:'relative' }}>

        {/* Fechar */}
        <button onClick={onClose}
          style={{ position:'absolute', top:14, right:16, background:'none', border:'none', color:'var(--muted)', fontSize:'1.1rem', cursor:'pointer', lineHeight:1, padding:4 }}>
          ✕
        </button>

        {/* Capa centralizada */}
        {livro.capa_url && (
          <div style={{ display:'flex', justifyContent:'center', padding:'40px 40px 20px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/cover/${livro.isbn}?size=m`} alt={livro.titulo}
              style={{ maxWidth:140, height:'auto', display:'block', borderRadius:3, boxShadow:'0 6px 24px rgba(0,0,0,0.35)' }} />
          </div>
        )}

        {/* Info */}
        <div style={{ padding: livro.capa_url ? '0 40px 24px' : '48px 40px 24px', textAlign:'center' }}>
          {livro.editora && (
            <div style={{ fontSize:'0.68rem', color:'var(--accent-fg)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>{livro.editora}</div>
          )}
          <h2 className="font-serif" style={{ fontSize:'1.35rem', fontWeight:400, lineHeight:1.35, color:'var(--text)', marginBottom:8 }}>{livro.titulo}</h2>
          {livro.autor && <div style={{ fontSize:'0.88rem', color:'var(--muted)', marginBottom:14 }}>{livro.autor}</div>}
          <div style={{ fontSize:'0.72rem', color:'var(--muted)', opacity:.7 }}>
            {dataFormatada || 'sem data cadastrada'}
            {livro.isbn && <span style={{ marginLeft:10, paddingLeft:10, borderLeft:'1px solid var(--border)' }}>ISBN {livro.isbn}</span>}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:'20px 40px 36px', borderTop:'1px solid var(--border)' }}>
          {extra === null && <div style={{ color:'var(--muted)', fontSize:'0.82rem', opacity:.5, textAlign:'center', padding:'8px 0' }}>carregando…</div>}
          {extra !== null && (
            <>
              {contribs && (
                <div style={{ fontSize:'0.78rem', color:'var(--muted)', marginBottom:20, lineHeight:1.7, textAlign:'center', opacity:.8 }}>{contribs}</div>
              )}
              {extra.sinopse
                ? <div className="font-serif" style={{ fontSize:'0.88rem', lineHeight:1.8, color:'var(--text)', opacity:.85 }}>
                    {extra.sinopse.split('\n').filter(Boolean).map((p, i) => <p key={i} style={{ marginBottom:14 }}>{p}</p>)}
                  </div>
                : <div style={{ color:'var(--muted)', fontSize:'0.82rem', opacity:.5, textAlign:'center', padding:'8px 0' }}>sinopse não disponível</div>
              }
              {extra.biografia_autor && (
                <div style={{ marginTop:28, paddingTop:24, borderTop:'1px solid var(--border)' }}>
                  <div style={{ fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--muted)', opacity:.6, marginBottom:12, textAlign:'center' }}>sobre o autor</div>
                  <div className="font-serif" style={{ fontSize:'0.85rem', lineHeight:1.75, color:'var(--text)', opacity:.7 }}>{extra.biografia_autor}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
