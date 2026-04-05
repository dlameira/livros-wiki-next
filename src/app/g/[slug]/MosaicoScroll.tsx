'use client'

import { useRef } from 'react'

type LivroMosaico = {
  isbn: string
  titulo: string
  capa_url: string | null
}

export default function MosaicoScroll({ livros }: { livros: LivroMosaico[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Scrollable strip */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '6px',
          height: '200px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        } as React.CSSProperties}
      >
        {livros.map(livro => (
          <div
            key={livro.isbn}
            style={{ height: '100%', flexShrink: 0, borderRadius: '3px', overflow: 'hidden', background: 'var(--surface)' }}
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
      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '60px', background: 'linear-gradient(to right, var(--bg) 20%, transparent)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
        <button
          onClick={() => scroll('left')}
          style={{
            pointerEvents: 'all',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            width: '32px', height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            lineHeight: 1,
            marginLeft: '6px',
          }}
        >
          ‹
        </button>
      </div>

      {/* Right fade + arrow */}
      <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '60px', background: 'linear-gradient(to left, var(--bg) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pointerEvents: 'none' }}>
        <button
          onClick={() => scroll('right')}
          style={{
            pointerEvents: 'all',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            width: '32px', height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            lineHeight: 1,
            marginRight: '6px',
          }}
        >
          ›
        </button>
      </div>
    </div>
  )
}
