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
    const safeWidth = Math.max(160, Math.min(1200, Math.round(width)))
    const height = Math.round(safeWidth * 1.5)
    const transformation = `tr:w-${safeWidth},h-${height},q-82,f-auto`

    // Replace an existing ImageKit transform instead of returning the same
    // URL for every candidate; this keeps srcSet responsive without stacking transforms.
    if (segments[2]?.startsWith('tr:')) segments[2] = transformation
    else segments.splice(2, 0, transformation)
    url.pathname = segments.join('/')
    return url.toString()
  } catch {
    return source
  }
}

/**
 * Build responsive candidates for browsers that support srcSet.
 * Returns undefined for external URLs that cannot be transformed by this account.
 */
export function getPosterImageSrcSet(source: string | null | undefined): string | undefined {
  if (!source) return undefined

  const widths = [240, 360, 480, 640, 800]
  const candidates = widths.map((width) => {
    const url = getPosterImageUrl(source, width)
    return url ? `${url} ${width}w` : ''
  }).filter(Boolean)

  if (candidates.length !== widths.length) return undefined
  const urls = candidates.map((candidate) => candidate.slice(0, candidate.lastIndexOf(' ')))
  if (new Set(urls).size === 1) return undefined

  return candidates.join(', ')
}
