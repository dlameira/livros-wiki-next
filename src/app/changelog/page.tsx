'use client'

import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'

const VERSIONS = [
  {
    versao: '0.011',
    data: '04 abr. 2026',
    mudancas: [
      { tipo: 'stack',     desc: 'Migração completa para Next.js 16 (App Router) + deploy Railway' },
      { tipo: 'visual',    desc: 'Modo claro/escuro com estética Wikipedia — claro agora como padrão' },
      { tipo: 'modal',     desc: 'Redesign do modal de livro: layout centrado, sinopse completa, contributors e bio do autor' },
      { tipo: 'filtros',   desc: 'Contador corrigido para usar filter_count (total real com filtros aplicados)' },
      { tipo: 'filtros',   desc: 'Pré-venda: data inicial agora é hoje (não mais o dia 1 do mês)' },
      { tipo: 'filtros',   desc: 'Correção de race condition no fetch ao trocar filtros rapidamente' },
      { tipo: 'editoras',  desc: 'Clique no nome do grupo seleciona/deseleciona todos os selos do grupo' },
      { tipo: 'changelog', desc: 'Histórico público de versões (esta página)' },
    ],
  },
  {
    versao: '0.01',
    data: 'mai. 2025',
    mudancas: [
      { tipo: 'stack',   desc: 'Versão inicial em HTML/CSS/JS estático com Directus como CMS' },
      { tipo: 'visual',  desc: 'Grid de capas com filtros por preset (pré-venda, lançamentos, tudo)' },
      { tipo: 'editoras',desc: 'Painel de selos com agrupamento por grupo editorial' },
      { tipo: 'filtros', desc: 'Busca por autor, filtro de datas, scroll infinito' },
    ],
  },
]

const TIPO_LABEL: Record<string, string> = {
  stack:     'stack',
  visual:    'visual',
  modal:     'modal',
  filtros:   'filtros',
  editoras:  'editoras',
  changelog: 'meta',
}

const TIPO_COR: Record<string, string> = {
  stack:     '#6b7cc4',
  visual:    '#c9a84c',
  modal:     '#72b48a',
  filtros:   '#c47c6b',
  editoras:  '#9b72c4',
  changelog: '#72a4c4',
}

export default function ChangelogPage() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', color:'var(--text)', fontFamily:'Georgia, serif' }}>
      <SiteHeader subtitle={<p style={{ fontSize:'0.82rem', color:'var(--muted)' }}>histórico de versões</p>} />

      <main style={{ maxWidth:720, margin:'48px auto', padding:'0 48px 80px' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:16, marginBottom:40, paddingBottom:20, borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:'normal', color:'var(--text)' }}>changelog</h2>
          <span style={{ fontSize:'0.78rem', color:'var(--muted)' }}>alterações públicas por versão</span>
        </div>

        {VERSIONS.map((v, vi) => (
          <section key={v.versao} style={{ marginBottom: vi < VERSIONS.length - 1 ? 56 : 0 }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:16, marginBottom:20 }}>
              <span style={{ fontSize:'1rem', fontWeight:'normal', color:'var(--accent)', letterSpacing:'0.04em' }}>v {v.versao}</span>
              <span style={{ fontSize:'0.8rem', color:'var(--muted)' }}>{v.data}</span>
            </div>
            <div style={{ borderLeft:'2px solid var(--border)', paddingLeft:20, display:'flex', flexDirection:'column', gap:12 }}>
              {v.mudancas.map((m, mi) => (
                <div key={mi} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                  <span style={{
                    fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.06em',
                    color: TIPO_COR[m.tipo] || 'var(--muted)',
                    border: `1px solid ${TIPO_COR[m.tipo] || 'var(--border)'}`,
                    borderRadius:4, padding:'2px 6px', flexShrink:0, marginTop:2, opacity:.85
                  }}>
                    {TIPO_LABEL[m.tipo] || m.tipo}
                  </span>
                  <span style={{ fontSize:'0.88rem', lineHeight:1.6, color:'var(--text)', opacity:.85 }}>{m.desc}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
