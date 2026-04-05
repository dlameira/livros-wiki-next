'use client'

import { useRef, useState } from 'react'

type LivroMosaico = {
  isbn: string
  titulo: string
  capa_url: string | null
}

export default function MosaicoScroll({ livros }: { livros: LivroMosaico[] }) {
  const outerRef = useRef<HTMLDivElement>(null)   // clipping container
  const trackRef = useRef<HTMLDivElement>(null)   // moving track
  const [offset, setOffset] = useState(0)
  const [leftHover,  setLeftHover]  = useState(false)
  const [rightHover, setRightHover] = useState(false)

  function slide(dir: 'left' | 'right') {
    const outer = outerRef.current
    const track = trackRef.current
    if (!outer || !track) return
    const pageW  = outer.clientWidth * 0.85
    const maxOff = Math.max(0, track.scrollWidth - outer.clientWidth)
    setOffset(prev =>
      dir === 'right'
        ? Math.min(prev + pageW, maxOff)
        : Math.max(prev - pageW, 0)
    )
  }

  const arrowStyle = (hovered: boolean): React.CSSProperties => ({
    pointerEvents: 'all',
    background: hovered ? 'var(--text)' : 'var(--surface)',
    border: '1px solid var(--border)',
    color: hovered ? 'var(--bg)' : 'var(--text)',
    width: '36px', height: '36px',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    lineHeight: '1',
    transform: hovered ? 'scale(1.1)' : 'scale(1)',
    boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
    transition: 'background 0.15s, color 0.15s, transform 0.15s, box-shadow 0.15s',
  })

  return (
    <div style={{ position: 'relative' }}>
      {/* Clipping container — hides overflow */}
      <div ref={outerRef} style={{ overflow: 'hidden', height: '200px' }}>
        {/* Track — slides via CSS transform */}
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: '6px',
            height: '100%',
            transform: `translateX(-${offset}px)`,
            transition: 'transform 0.48s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform',
          }}
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
      </div>

      {/* Left fade + arrow */}
      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '70px', background: 'linear-gradient(to right, var(--bg) 25%, transparent)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
        <button
          onClick={() => slide('left')}
          onMouseEnter={() => setLeftHover(true)}
          onMouseLeave={() => setLeftHover(false)}
          style={{ ...arrowStyle(leftHover), marginLeft: '8px' }}
        >
          ‹
        </button>
      </div>

      {/* Right fade + arrow */}
      <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '70px', background: 'linear-gradient(to left, var(--bg) 25%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pointerEvents: 'none' }}>
        <button
          onClick={() => slide('right')}
          onMouseEnter={() => setRightHover(true)}
          onMouseLeave={() => setRightHover(false)}
          style={{ ...arrowStyle(rightHover), marginRight: '8px' }}
        >
          ›
        </button>
      </div>
    </div>
  )
}
