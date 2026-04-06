import { NextRequest, NextResponse } from 'next/server'

const MB_TOKEN = process.env.METABOOKS_TOKEN || 'c0f55cf9-c553-47ec-ac2f-8c4f4f57325c'
const CACHE_SECONDS = 60 * 60 * 24 * 30 // 30 dias

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ isbn: string }> }
) {
  const { isbn } = await params
  const size = req.nextUrl.searchParams.get('size') || 's'

  const url = `https://api.metabooks.com/api/v1/cover/${isbn}/${size}?access_token=${MB_TOKEN}`

  const res = await fetch(url, { next: { revalidate: CACHE_SECONDS } })

  if (!res.ok) {
    return new NextResponse(null, { status: 404 })
  }

  const buffer = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') || 'image/jpeg'

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=86400`,
    },
  })
}
