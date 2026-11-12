import { useEffect, useState } from 'react'

const RESOURCE_TIMEOUT_MS = 9000
const TOTAL_TIMEOUT_MS = 15000

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

export default function ViewportPreloader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let active = true
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const reveal = () => {
      if (!active) return
      document.body.style.overflow = previousOverflow
      setVisible(false)
    }

    const safetyTimeout = window.setTimeout(reveal, TOTAL_TIMEOUT_MS)

    void waitForViewport().finally(() => {
      reveal()
      window.clearTimeout(safetyTimeout)
    })

    return () => {
      active = false
      document.body.style.overflow = previousOverflow
      window.clearTimeout(safetyTimeout)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="viewport-preloader" role="status" aria-live="polite" aria-label="Preparing the visible page content">
      <div className="viewport-preloader-content">
        <span className="viewport-preloader-mark" aria-hidden="true">◇</span>
        <span className="viewport-preloader-brand">Glacier</span>
        <span className="viewport-preloader-spinner" aria-hidden="true" />
        <span className="viewport-preloader-caption">Preparing your view</span>
      </div>
    </div>
  )
}
