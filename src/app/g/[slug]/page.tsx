import { DIRECTUS_URL } from '@/lib/directus'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

function slugify(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

type Grupo = { id: number; nome: string; cor?: string }

type Selo = {
  id: number
  nome_display: string
  total_livros_mb: number | null
  ativo: boolean
  logo_url?: string | null
  descricao?: string | null
}

type Livro = {
  isbn: string
  titulo: string
  editora: string
  capa_url: string | null
  data_publicacao: string
}


export default async function GrupoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const gruposRes = await fetch(`${DIRECTUS_URL}/items/grupos_editoriais?fields=id,nome,cor&limit=100`)
  const grupos: Grupo[] = (await gruposRes.json()).data || []
  const grupo = grupos.find(g => slugify(g.nome) === slug)
  if (!grupo) notFound()

  const selosRes = await fetch(
    `${DIRECTUS_URL}/items/selos?filter[grupo][_eq]=${grupo.id}&fields=id,nome_display,total_livros_mb,ativo,logo_url,descricao&limit=200&sort=nome_display`
  )
  const selos: Selo[] = ((await selosRes.json()).data || []).filter((s: Selo) => s.nome_display)

  const selosAtivos = selos.filter(s => s.ativo)
  const selosInativos = selos.filter(s => !s.ativo)
  const totalLivros = selos.reduce((sum, s) => sum + (s.total_livros_mb || 0), 0)

  // Busca capas por selo em paralelo
  const livrosPorSelo: Record<string, Livro[]> = {}
  await Promise.all(
    selosAtivos.map(async (selo) => {
      const filter = encodeURIComponent(JSON.stringify({ editora: { _eq: selo.nome_display } }))
      const res = await fetch(
        `${DIRECTUS_URL}/items/biblioteca?fields=isbn,titulo,editora,capa_url,data_publicacao&sort=-data_publicacao&limit=10&filter=${filter}`
      )
      const data = (await res.json()).data || []
      livrosPorSelo[selo.nome_display] = data
    })
  )

  // Mosaico: 12 livros mais recentes do grupo inteiro
  const nomesSelos = selos.map(s => s.nome_display)
  let mosaico: Livro[] = []
  if (nomesSelos.length > 0) {
    const filter = encodeURIComponent(JSON.stringify({ editora: { _in: nomesSelos }, capa_url: { _nnull: true } }))
    const res = await fetch(
      `${DIRECTUS_URL}/items/biblioteca?fields=isbn,titulo,editora,capa_url&sort=-data_publicacao&limit=20&filter=${filter}`
    )
    mosaico = (await res.json()).data || []
  }

  const sortedSelos = [...selosAtivos, ...selosInativos]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'Georgia, serif' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <div style={{
        padding: '64px 64px 48px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '32px',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c0392b', marginBottom: '12px' }}>
            grupo editorial
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 'normal', letterSpacing: '0.04em', color: 'var(--text)', lineHeight: 1, marginBottom: '10px' }}>
            {grupo.nome}
          </h1>
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic' }}>
            {selosAtivos.length} selos ativos · {totalLivros.toLocaleString('pt-BR')} títulos catalogados
          </div>
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────────── */}
      <div style={{ display: 'flex', padding: '36px 64px', borderBottom: '1px solid var(--border)' }}>
        {[
          { num: selosAtivos.length, label: 'selos ativos' },
          { num: selosInativos.length, label: 'selos inativos' },
          { num: totalLivros.toLocaleString('pt-BR'), label: 'títulos catalogados' },
          { num: selos.length, label: 'total de selos' },
        ].map((stat, i, arr) => (
          <div key={i} style={{
            flex: 1,
            paddingRight: i < arr.length - 1 ? '32px' : 0,
            marginRight: i < arr.length - 1 ? '32px' : 0,
            borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ fontSize: '2.4rem', fontWeight: 'normal', color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '6px' }}>
              {stat.num}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── MOSAICO ──────────────────────────────────────── */}
      {mosaico.length > 0 && (
        <div style={{ padding: '48px 64px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '24px' }}>
            lançamentos recentes
          </div>
          <div style={{ display: 'flex', gap: '6px', height: '200px', overflow: 'hidden' }}>
            {mosaico.map(livro => (
              <div key={livro.isbn} style={{ height: '100%', flexShrink: 0, borderRadius: '3px', overflow: 'hidden', background: 'var(--surface)' }}>
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
      )}

      {/* ── SELOS ────────────────────────────────────────── */}
      <div style={{ padding: '48px 64px 80px' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '24px' }}>
          selos do grupo
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2px' }}>
          {sortedSelos.map(selo => {
            const covers = livrosPorSelo[selo.nome_display] || []
            const isInativo = !selo.ativo
            return (
              <div
                key={selo.id}
                style={{
                  background: 'var(--surface)',
                  padding: '32px',
                  border: '1px solid var(--border)',
                  position: 'relative',
                  opacity: isInativo ? 0.6 : 1,
                }}
              >
                {isInativo && (
                  <div style={{
                    position: 'absolute', top: '14px', right: '14px',
                    fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: '#c0392b', border: '1px solid #c0392b', background: 'rgba(192,57,43,0.08)',
                    padding: '2px 7px', borderRadius: '3px',
                  }}>
                    inativo
                  </div>
                )}

                {/* Logo */}
                {selo.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selo.logo_url}
                    alt={selo.nome_display}
                    style={{ maxHeight: '28px', maxWidth: '110px', width: 'auto', height: 'auto', display: 'block', marginBottom: '10px', opacity: 0.8 }}
                  />
                )}

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
                  <div style={{ fontSize: '1.1rem', letterSpacing: '0.03em', color: 'var(--text)' }}>
                    {selo.nome_display}
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: 'var(--text)', fontWeight: 'normal' }}>
                        {(selo.total_livros_mb || 0).toLocaleString('pt-BR')}
                      </strong>{' '}títulos
                    </span>
                  </div>
                </div>

                {/* Descrição */}
                {selo.descricao && (
                  <div style={{
                    fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '20px',
                    fontStyle: 'italic',
                    display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {selo.descricao}
                  </div>
                )}

                {/* Mini covers */}
                {covers.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {covers.slice(0, 8).map(livro => (
                      <div
                        key={livro.isbn}
                        title={livro.titulo}
                        style={{
                          width: '56px', height: '80px', background: 'var(--border)',
                          borderRadius: '3px', overflow: 'hidden', flexShrink: 0,
                          border: '1px solid var(--border)',
                        }}
                      >
                        {livro.capa_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={livro.capa_url}
                            alt={livro.titulo}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            loading="lazy"
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '1.2rem' }}>
                            ◻
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {!isInativo && covers.length === 0 && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                    sem títulos catalogados
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
