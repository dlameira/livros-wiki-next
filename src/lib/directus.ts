const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://directus-production-afdd.up.railway.app'

export { DIRECTUS_URL }

export async function fetchDirectus(path: string, params?: Record<string, string>) {
  const url = new URL(`${DIRECTUS_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error(`Directus error: ${res.status} ${url}`)
  return res.json()
}
