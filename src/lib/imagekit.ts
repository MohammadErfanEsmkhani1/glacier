const IMAGEKIT_ENDPOINT = 'https://ik.imagekit.io/m3vqx7tis'

/**
 * Optimize posters hosted in this ImageKit account while leaving all other
 * image providers and any URLs with explicit transformations untouched.
 */
export function getPosterImageUrl(source: string | null | undefined, width = 360): string | undefined {
  if (!source) return undefined

  try {
    const url = new URL(source)
    if (url.origin !== IMAGEKIT_ENDPOINT) return source
    if (!url.pathname.startsWith('/m3vqx7tis/')) return source
    if (url.searchParams.has('tr') || /\/tr:[^/]+\//.test(url.pathname)) return source

    const safeWidth = Math.max(160, Math.min(1200, Math.round(width)))
    const height = Math.round(safeWidth * 1.5)
    url.searchParams.set('tr', `w-${safeWidth},h-${height},q-82,f-auto`)
    return url.toString()
  } catch {
    return source
  }
}
