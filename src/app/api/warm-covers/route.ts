import { NextRequest, NextResponse } from 'next/server'
import postgres from 'postgres'

const sql    = postgres(process.env.DATABASE_URL!, { max: 3, idle_timeout: 10 })
const MB_TOKEN = process.env.METABOOKS_TOKEN || 'c0f55cf9-c553-47ec-ac2f-8c4f4f57325c'
const CACHE_SECONDS = 60 * 60 * 24 * 30 // 30 dias

// ISBNs dos livros que aparecem no preset padrão (lançamentos, editoras curadas)
async function getIsbnsPrioritarios(): Promise<string[]> {
  const hoje = new Date()
  const from = new Date(hoje.getFullYear(), hoje.getMonth() - 6, 1).toISOString().split('T')[0]
  const to   = new Date(hoje.getFullYear(), hoje.getMonth() + 2, 1).toISOString().split('T')[0]

  const rows = await sql<{ isbn: string }[]>`
    SELECT isbn FROM biblioteca
    WHERE isbn IS NOT NULL AND isbn != ''
      AND capa_url IS NOT NULL AND capa_url != ''
      AND data_publicacao >= ${from}
      AND data_publicacao <= ${to}
    ORDER BY data_publicacao DESC
    LIMIT 500
  `
  return rows.map(r => r.isbn)
}

async function warmOne(isbn: string): Promise<boolean> {
  try {
    const url = `https://api.metabooks.com/api/v1/cover/${isbn}/m?access_token=${MB_TOKEN}`
    const res = await fetch(url, {
      next: { revalidate: CACHE_SECONDS },
      signal: AbortSignal.timeout(8000),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  // Proteção simples: só aceita chamadas internas ou com secret
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.WARM_SECRET && req.headers.get('x-vercel-cron') !== '1') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const isbns = await getIsbnsPrioritarios()

  // Aquece em paralelo em lotes de 20 para não sobrecarregar
  let ok = 0, fail = 0
  const BATCH = 20
  for (let i = 0; i < isbns.length; i += BATCH) {
    const batch = isbns.slice(i, i + BATCH)
    const results = await Promise.all(batch.map(warmOne))
    results.forEach(r => r ? ok++ : fail++)
  }

  return NextResponse.json({ warmed: ok, failed: fail, total: isbns.length })
}
