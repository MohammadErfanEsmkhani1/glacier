const CACHE_VERSION = 'v1'

function cacheKey(kind: 'favorites' | 'recent', userId: string) {
  return `glacier:${kind}:${CACHE_VERSION}:${userId}`
}

export function readPersonalIds(kind: 'favorites' | 'recent', userId: string): string[] {
  try {
    const raw = localStorage.getItem(cacheKey(kind, userId))
    const value: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export function writePersonalIds(kind: 'favorites' | 'recent', userId: string, ids: string[]) {
  try {
    localStorage.setItem(cacheKey(kind, userId), JSON.stringify(ids))
  } catch {
    // Storage can be unavailable or full; in-memory state still works.
  }
}
