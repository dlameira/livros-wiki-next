'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface SiteHeaderProps {
  subtitle?: React.ReactNode
}

export default function SiteHeader({ subtitle }: SiteHeaderProps) {
  const [tema, setTema] = useState<'dark'|'light'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('livros-tema') as 'dark'|'light' | null
    if (saved) setTema(saved)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('light', tema === 'light')
    localStorage.setItem('livros-tema', tema)
  }, [tema])

  return (
    <header style={{ padding: '32px 48px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 14 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/liki.png" alt="liki" style={{ width: 'auto', height: '81px', imageRendering: 'pixelated', flexShrink: 0 }} />
        <div>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'normal', letterSpacing: '0.06em', color: 'var(--text)', marginBottom: 6 }}>
            livros<span style={{ color: 'var(--accent)' }}>.</span>wiki
          </h1>
        </Link>
        {subtitle ?? (
          <>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>
              livros sem algoritmos &nbsp;·&nbsp;{' '}
              <Link href="/changelog" style={{ color: 'var(--muted)', opacity: .5, textDecoration: 'none' }}>v 0.011</Link>
            </p>
            <p style={{ fontSize: '0.68rem', color: 'var(--muted)', opacity: .4, marginTop: 3 }}>por daniel lameira + metabooks</p>
          </>
        )}
        </div>
      </div>
      <button
        onClick={() => setTema(t => t === 'dark' ? 'light' : 'dark')}
        style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.78rem', fontFamily: 'inherit', padding: '5px 12px', borderRadius: 20, cursor: 'pointer', marginTop: 6 }}
      >
        {tema === 'dark' ? '☀ claro' : '☾ escuro'}
      </button>
    </header>
  )
}
