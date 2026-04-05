'use client'

import { useRef, useState } from 'react'

type LivroMosaico = {
  isbn: string
  titulo: string
  capa_url: string | null
}

export default function MosaicoScroll({ livros }: { livros: LivroMosaico[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [leftHover,  setLeftHover]  = useState(false)
  const [rightHover, setRightHover] = useState(false)

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    const container = scrollRef.current
    // Snap to exact page boundaries for a clean slide feel
    const pageW = container.clientWidth - 60          // small overlap so context is kept
    const cur   = container.scrollLeft
    const target = dir === 'right'
      ? Math.round(cur / pageW + 1) * pageW
      : Math.round(cur / pageW - 1) * pageW
    container.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }

  const arrowBase: React.CSSProperties = {
    pointerEvents: 'all',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    width: '36px', height: '36px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    lineHeight: 1,
    transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s',
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Scrollable strip — CSS smooth scroll + snap */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '6px',
          height: '200px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          scrollSnapType: 'x mandatory',
        } as React.CSSProperties}
      >
        {livros.map(livro => (
          <div
            key={livro.isbn}
            style={{
              height: '100%',
              flexShrink: 0,
              borderRadius: '3px',
              overflow: 'hidden',
              background: 'var(--surface)',
              scrollSnapAlign: 'start',
            } as React.CSSProperties}
          >
            {livro.capa_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={livro.capa_url}
                alt={livro.titulo}
                title={livro.titulo}
                style={{ height: '100%', width: 'auto', display: 'block', objectFit: 'cover' }}
                loading="lazy"
              />
            )}
          </div>
        ))}
      </div>

      {/* Left fade + arrow */}
      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '70px', background: 'linear-gradient(to right, var(--bg) 30%, transparent)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
        <button
          onClick={() => scroll('left')}
          onMouseEnter={() => setLeftHover(true)}
          onMouseLeave={() => setLeftHover(false)}
          style={{
            ...arrowBase,
            marginLeft: '8px',
            background: leftHover ? 'var(--text)' : 'var(--surface)',
            color: leftHover ? 'var(--bg)' : 'var(--text)',
            transform: leftHover ? 'scale(1.12)' : 'scale(1)',
            boxShadow: leftHover ? '0 4px 16px rgba(0,0,0,0.18)' : 'none',
          }}
        >
          ‹
        </button>
      </div>

      {/* Right fade + arrow */}
      <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '70px', background: 'linear-gradient(to left, var(--bg) 30%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pointerEvents: 'none' }}>
        <button
          onClick={() => scroll('right')}
          onMouseEnter={() => setRightHover(true)}
          onMouseLeave={() => setRightHover(false)}
          style={{
            ...arrowBase,
            marginRight: '8px',
            background: rightHover ? 'var(--text)' : 'var(--surface)',
            color: rightHover ? 'var(--bg)' : 'var(--text)',
            transform: rightHover ? 'scale(1.12)' : 'scale(1)',
            boxShadow: rightHover ? '0 4px 16px rgba(0,0,0,0.18)' : 'none',
          }}
        >
          ›
        </button>
      </div>
    </div>
  )
}
