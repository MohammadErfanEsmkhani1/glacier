const IMAGEKIT_ORIGIN = 'https://ik.imagekit.io'
const IMAGEKIT_ACCOUNT_PATH = '/m3vqx7tis'

/**
 * Resize and compress posters from this ImageKit account.
 * External poster URLs remain unchanged.
 */
export function getPosterImageUrl(source: string | null | undefined, width = 360): string | undefined {
  if (!source) return undefined

  try {
    const url = new URL(source)
    if (url.origin !== IMAGEKIT_ORIGIN || !url.pathname.startsWith(IMAGEKIT_ACCOUNT_PATH + '/')) return source

    const segments = url.pathname.split('/')
    if (segments[2]?.startsWith('tr:')) return source

    const safeWidth = Math.max(160, Math.min(1200, Math.round(width)))
    const height = Math.round(safeWidth * 1.5)
    segments.splice(2, 0, `tr:w-${safeWidth},h-${height},q-82,f-auto`)
    url.pathname = segments.join('/')
    return url.toString()
  } catch {
    return source
  }
}
