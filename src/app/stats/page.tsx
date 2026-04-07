import { DIRECTUS_URL } from '@/lib/directus'
import { sql } from '@/lib/db'
import SiteHeader from '@/components/SiteHeader'
import BubbleViz from './BubbleViz'

export const dynamic = 'force-dynamic'

type Grupo = { id: number; nome: string }
type Selo = { id: number; nome_display: string; grupo: number }

export default async function StatsPage() {
  const [gruposRes, selosRes, countRows] = await Promise.all([
    fetch(`${DIRECTUS_URL}/items/grupos_editoriais?fields=id,nome&limit=50`),
    fetch(`${DIRECTUS_URL}/items/selos?fields=id,nome_display,grupo&limit=500`),
    sql`SELECT editora, COUNT(*)::int AS count FROM biblioteca GROUP BY editora`,
  ])

  const grupos: Grupo[] = (await gruposRes.json()).data || []
  const selos: Selo[] = (await selosRes.json()).data || []

  const countByEditora = new Map(countRows.map(r => [r.editora, r.count]))
  const grupoMap = new Map(grupos.map(g => [g.id, g.nome]))

  // All curated selos: grouped ones in clusters, ungrouped as independents
  const curadaRes = await fetch(`${DIRECTUS_URL}/items/selos?fields=id,nome_display,grupo&limit=500&filter[curada][_eq]=true`)
  const curadas: Selo[] = (await curadaRes.json()).data || []

  const bubbleData = curadas
    .filter(s => (countByEditora.get(s.nome_display) || 0) > 0)
    .map(s => ({
      selo: s.nome_display,
      grupo: (s.grupo && grupoMap.has(s.grupo)) ? grupoMap.get(s.grupo)! : '',
      count: countByEditora.get(s.nome_display) || 0,
    }))
    .sort((a, b) => b.count - a.count)

  const totalBooks = bubbleData.reduce((sum, d) => sum + d.count, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <SiteHeader subtitle="stats" />

      <div style={{ padding: '48px 64px 24px' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>
          catálogo por grupo editorial
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <span className="font-serif" style={{ fontSize: '2rem', color: 'var(--text)', fontWeight: 'normal' }}>
            {totalBooks.toLocaleString('pt-BR')} livros
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
            {bubbleData.length} selos · {grupos.length} grupos
          </span>
        </div>
      </div>

      <div style={{ padding: '0 32px 64px' }}>
        <BubbleViz data={bubbleData} />
      </div>
    </div>
  )
}
