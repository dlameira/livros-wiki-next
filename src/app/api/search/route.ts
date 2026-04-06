import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL!, { max: 3, idle_timeout: 10 })

export async function GET(req: NextRequest) {
  const q           = req.nextUrl.searchParams.get('q')?.trim() || ''
  const from        = req.nextUrl.searchParams.get('from')
  const to          = req.nextUrl.searchParams.get('to')
  const editorasParam = req.nextUrl.searchParams.get('editoras')
  const editoras    = editorasParam ? editorasParam.split(',').filter(Boolean) : []

  if (!q) return NextResponse.json({ data: [], total: 0 })

  const words = q.split(/\s+/).filter(Boolean).slice(0, 6)

  try {
    // Build dynamic WHERE with postgres tagged templates
    const wordConditions = words.map(word =>
      sql`(immutable_unaccent(titulo) ILIKE immutable_unaccent(${'%' + word + '%'})
        OR immutable_unaccent(autor)   ILIKE immutable_unaccent(${'%' + word + '%'})
        OR immutable_unaccent(editora) ILIKE immutable_unaccent(${'%' + word + '%'}))`
    )

    const dateFrom  = from   ? sql`AND data_publicacao >= ${from}`        : sql``
    const dateTo    = to     ? sql`AND data_publicacao <= ${to}`          : sql``
    const edFilter  = editoras.length > 0 ? sql`AND editora = ANY(${editoras})` : sql``

    const where = wordConditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)

    const rows = await sql`
      SELECT id, isbn, titulo, autor, editora, capa_url, data_publicacao
      FROM biblioteca
      WHERE ${where} ${dateFrom} ${dateTo} ${edFilter}
      ORDER BY data_publicacao DESC NULLS LAST
      LIMIT 500
    `
    const [{ count }] = await sql`
      SELECT COUNT(*)::int AS count
      FROM biblioteca
      WHERE ${where} ${dateFrom} ${dateTo} ${edFilter}
    `

    return NextResponse.json({ data: rows, total: count }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    console.error('search error', e)
    return NextResponse.json({ error: 'search failed' }, { status: 500 })
  }
}
