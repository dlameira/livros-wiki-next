'use client'

import { useRef, useState, useEffect } from 'react'
import { DetalheModal, type ModalTarget } from './DetalheModal'

type LivroMosaico = {
  id: number
  isbn: string
  titulo: string
  capa_url: string | null
}

export default function MosaicoScroll({ livros }: { livros: LivroMosaico[] }) {
  const outerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset]       = useState(0)
  const [maxOffset, setMaxOffset] = useState(0)
  const [leftHover,  setLeftHover]  = useState(false)
  const [rightHover, setRightHover] = useState(false)
  const [hoveredIsbn, setHoveredIsbn] = useState<string | null>(null)
  const [modal, setModal]   = useState<ModalTarget | null>(null)
  const [modalKey, setModalKey] = useState(0)

  // Calculate maxOffset once on mount (track width is fixed — no layout shift)
  useEffect(() => {
    const outer = outerRef.current
    const track = trackRef.current
    if (!outer || !track) return
    setMaxOffset(Math.max(0, track.scrollWidth - outer.clientWidth))
    const ro = new ResizeObserver(() => {
      if (outer && track) setMaxOffset(Math.max(0, track.scrollWidth - outer.clientWidth))
    })
    ro.observe(outer)
    return () => ro.disconnect()
  }, [livros])

  function slide(dir: 'left' | 'right') {
    const outer = outerRef.current
    const track = trackRef.current
    if (!outer || !track) return
    const pageW   = outer.clientWidth * 0.85
    const freshMax = Math.max(0, track.scrollWidth - outer.clientWidth)
    setMaxOffset(freshMax)
    setOffset(prev =>
      dir === 'right'
        ? Math.min(prev + pageW, freshMax)
        : Math.max(prev - pageW, 0)
    )
  }

  function openModal(livro: LivroMosaico) {
    setModal({ type: 'id', id: livro.id, titulo: livro.titulo, capa_url: livro.capa_url })
    setModalKey(k => k + 1)
  }

  const arrowBtn = (dir: 'left' | 'right', hovered: boolean): React.CSSProperties => ({
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
    marginLeft:  dir === 'left'  ? '8px' : undefined,
    marginRight: dir === 'right' ? '8px' : undefined,
  })

  const showLeft  = offset > 0
  const showRight = offset < maxOffset

  return (
    <>
      <div style={{ position: 'relative' }}>
        {/* Clipping container */}
        <div ref={outerRef} style={{ overflow: 'hidden', height: '200px' }}>
          {/* Moving track */}
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
            {livros.map(livro => {
              const hovered = hoveredIsbn === livro.isbn
              return (
                <div
                  key={livro.isbn}
                  onClick={() => openModal(livro)}
                  onMouseEnter={() => setHoveredIsbn(livro.isbn)}
                  onMouseLeave={() => setHoveredIsbn(null)}
                  title={livro.titulo}
                  style={{
                    height: '100%',
                    width: '133px',
                    flexShrink: 0,
                    borderRadius: '3px',
                    overflow: 'hidden',
                    background: 'var(--bg)',
                    cursor: 'pointer',
                    transform: hovered ? 'scale(1.04)' : 'scale(1)',
                    transition: 'transform 0.15s',
                    transformOrigin: 'center bottom',
                  }}
                >
                  {livro.capa_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/cover/${livro.isbn}?size=m`}
                      alt={livro.titulo}
                      style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Left fade + arrow */}
        {showLeft && (
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '70px', background: 'linear-gradient(to right, var(--bg) 25%, transparent)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <button
              onClick={() => slide('left')}
              onMouseEnter={() => setLeftHover(true)}
              onMouseLeave={() => setLeftHover(false)}
              style={arrowBtn('left', leftHover)}
            >
              ‹
            </button>
          </div>
        )}

        {/* Right fade + arrow */}
        {showRight && (
          <div style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '70px', background: 'linear-gradient(to left, var(--bg) 25%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pointerEvents: 'none' }}>
            <button
              onClick={() => slide('right')}
              onMouseEnter={() => setRightHover(true)}
              onMouseLeave={() => setRightHover(false)}
              style={arrowBtn('right', rightHover)}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {modal && (
        <DetalheModal
          key={modalKey}
          target={modal}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
