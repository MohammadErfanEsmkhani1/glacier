import { useEffect, useState } from 'react'

const RESOURCE_TIMEOUT_MS = 9000
const TOTAL_TIMEOUT_MS = 15000
const FADE_OUT_MS = 760

function nextFrame() {
  return new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()))
}

function isInViewport(element: Element) {
  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0 &&
    rect.top < window.innerHeight && rect.bottom > 0 &&
    rect.left < window.innerWidth && rect.right > 0
}

function waitForVisiblePendingContent() {
  return new Promise<void>((resolve) => {
    let finished = false
    const observer = new MutationObserver(check)
    const timeout = window.setTimeout(finish, RESOURCE_TIMEOUT_MS)

    function finish() {
      if (finished) return
      finished = true
      window.clearTimeout(timeout)
      observer.disconnect()
      resolve()
    }

    function check() {
      const pending = Array.from(document.querySelectorAll('[data-preloader-pending="true"]'))
        .some(isInViewport)
      if (!pending) finish()
    }

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-preloader-pending'],
      childList: true,
      subtree: true,
    })
    check()
  })
}

function waitForImage(image: HTMLImageElement) {
  return new Promise<void>((resolve) => {
    let finished = false
    const timeout = window.setTimeout(finish, RESOURCE_TIMEOUT_MS)

    function finish() {
      if (finished) return
      finished = true
      window.clearTimeout(timeout)
      image.removeEventListener('load', onLoad)
      image.removeEventListener('error', finish)
      resolve()
    }

    function onLoad() {
      void image.decode().catch(() => undefined).then(finish)
    }

    if (image.complete) {
      if (image.naturalWidth > 0) onLoad()
      else finish()
      return
    }

    image.addEventListener('load', onLoad, { once: true })
    image.addEventListener('error', finish, { once: true })
    image.loading = 'eager'
    if (image.complete) {
      if (image.naturalWidth > 0) onLoad()
      else finish()
    }
  })
}

function waitForVideo(video: HTMLVideoElement) {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return Promise.resolve()

  return new Promise<void>((resolve) => {
    const timeout = window.setTimeout(finish, RESOURCE_TIMEOUT_MS)

    function finish() {
      window.clearTimeout(timeout)
      video.removeEventListener('loadeddata', finish)
      video.removeEventListener('error', finish)
      resolve()
    }

    video.addEventListener('loadeddata', finish, { once: true })
    video.addEventListener('error', finish, { once: true })
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) finish()
  })
}

async function waitForViewport() {
  await nextFrame()
  await nextFrame()
  await waitForVisiblePendingContent()
  await nextFrame()

  const images = Array.from(document.images).filter(isInViewport)
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video:not([data-preloader-skip="true"])'))
    .filter(isInViewport)

  await Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    ...images.map(waitForImage),
    ...videos.map(waitForVideo),
  ])
}

export default function ViewportPreloader({ mode }: { mode: 'dark' | 'light' }) {
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let active = true
    const previousOverflow = document.body.style.overflow
    let hasRevealed = false
    document.body.style.overflow = 'hidden'

    const reveal = () => {
      if (!active || hasRevealed) return
      hasRevealed = true
      document.body.style.overflow = previousOverflow
      setLeaving(true)
      fadeTimeout = window.setTimeout(() => setVisible(false), FADE_OUT_MS)
    }

    let fadeTimeout = 0
    const safetyTimeout = window.setTimeout(reveal, TOTAL_TIMEOUT_MS)

    void waitForViewport().finally(() => {
      reveal()
      window.clearTimeout(safetyTimeout)
    })

    return () => {
      active = false
      document.body.style.overflow = previousOverflow
      window.clearTimeout(safetyTimeout)
      window.clearTimeout(fadeTimeout)
    }
  }, [])

  if (!visible) return null

  return (
    <div className={`viewport-preloader mode-${mode}${leaving ? ' is-leaving' : ''}`} role="status" aria-live="polite" aria-label="Loading Glacier">
      <div className="viewport-preloader-content">
        <span className="viewport-preloader-mark" aria-hidden="true">
          <svg viewBox="0 0 64 64" focusable="false">
            <path d="M32 6.5 57.5 32 32 57.5 6.5 32 32 6.5Z" />
            <path d="M32 17v30M17 32h30M21.4 21.4l21.2 21.2m0-21.2L21.4 42.6" />
          </svg>
        </span>
        <span className="viewport-preloader-spinner" aria-hidden="true" />
      </div>
    </div>
  )
}
