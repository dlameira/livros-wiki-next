import { NextRequest, NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
})

export async function GET(req: NextRequest) {
  const q      = req.nextUrl.searchParams.get('q')?.trim() || ''
  const from   = req.nextUrl.searchParams.get('from')
  const to     = req.nextUrl.searchParams.get('to')
  const editorasParam = req.nextUrl.searchParams.get('editoras')
  const editoras = editorasParam ? editorasParam.split(',').filter(Boolean) : []

  if (!q) return NextResponse.json({ data: [], total: 0 })

  const words = q.split(/\s+/).filter(Boolean).slice(0, 6)

  const params: (string | string[])[] = []
  const whereClauses: string[] = []

  for (const word of words) {
    const p = params.length
    params.push(`%${word}%`, `%${word}%`, `%${word}%`)
    whereClauses.push(
      `(immutable_unaccent(titulo) ILIKE immutable_unaccent($${p + 1}) OR immutable_unaccent(autor) ILIKE immutable_unaccent($${p + 2}) OR immutable_unaccent(editora) ILIKE immutable_unaccent($${p + 3}))`
    )
  }

  if (from) {
    params.push(from)
    whereClauses.push(`data_publicacao >= $${params.length}`)
  }
  if (to) {
    params.push(to)
    whereClauses.push(`data_publicacao <= $${params.length}`)
  }
  if (editoras.length > 0) {
    params.push(editoras as unknown as string)
    whereClauses.push(`editora = ANY($${params.length})`)
  }

  const where = whereClauses.join(' AND ')

  const sql = `
    SELECT id, isbn, titulo, autor, editora, capa_url, data_publicacao
    FROM biblioteca
    WHERE ${where}
    ORDER BY data_publicacao DESC NULLS LAST
    LIMIT 500
  `

  const countSql = `SELECT COUNT(*) FROM biblioteca WHERE ${where}`

  try {
    const client = await pool.connect()
    const [rows, count] = await Promise.all([
      client.query(sql, params),
      client.query(countSql, params),
    ])
    client.release()

    return NextResponse.json({
      data: rows.rows,
      total: parseInt(count.rows[0].count),
    }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    console.error('search error', e)
    return NextResponse.json({ error: 'search failed' }, { status: 500 })
  }
}
