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
    <>
      <header style={{ padding: '32px 48px 20px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/liki.png" alt="liki" style={{ width: 'auto', height: '72px', imageRendering: 'pixelated', flexShrink: 0, marginBottom: 2 }} />
          <div>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 4, lineHeight: 1 }}>
                livros<span style={{ color: 'var(--accent)' }}>.</span>wiki
              </h1>
            </Link>
            {subtitle ?? (
              <>
                <p style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  livros sem algoritmos &nbsp;·&nbsp;{' '}
                  <Link href="/changelog" style={{ color: 'var(--muted)', opacity: .5, textDecoration: 'none' }}>v 0.011</Link>
                </p>
                <p style={{ fontSize: '0.62rem', color: 'var(--muted)', opacity: .4, marginTop: 3, letterSpacing: '0.02em' }}>
                  por daniel lameira + metabooks
                </p>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => setTema(t => t === 'dark' ? 'light' : 'dark')}
          style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.72rem', fontFamily: 'inherit', padding: '5px 12px', borderRadius: 20, cursor: 'pointer', letterSpacing: '0.04em' }}
        >
          {tema === 'dark' ? '☀ claro' : '☾ escuro'}
        </button>
      </header>
      {/* Linha divisória */}
      <div style={{ borderBottom: '1px solid var(--border)', margin: '0 48px' }} />
    </>
  )
}
