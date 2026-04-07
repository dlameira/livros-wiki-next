import { sql } from '@/lib/db'

export async function getMonthlyBookCounts(editoras: string[]): Promise<{ month: string; count: number }[]> {
  if (!editoras.length) return []

  const rows = await sql`
    SELECT
      to_char(gs.month, 'YYYY-MM') AS month,
      COALESCE(c.count, 0)::int AS count
    FROM generate_series(
      date_trunc('month', now() - interval '5 years'),
      date_trunc('month', now()),
      interval '1 month'
    ) AS gs(month)
    LEFT JOIN (
      SELECT date_trunc('month', data_publicacao) AS month, COUNT(*)::int AS count
      FROM biblioteca
      WHERE editora = ANY(${editoras})
        AND data_publicacao >= now() - interval '5 years'
      GROUP BY 1
    ) c ON c.month = gs.month
    ORDER BY gs.month
  `

  return rows.map(r => ({ month: r.month, count: r.count }))
}
