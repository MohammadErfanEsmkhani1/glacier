import { useEffect, useRef, useState } from 'react'

/**
 * Defer the decorative background video until the hero has painted and is in view.
 * A single video element avoids the extra decoder and duplicate layer used by the old loop.
 */
export default function DeferredHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let loadTimer: number | undefined
    let sourceAttached = false
    let observer: IntersectionObserver | undefined

    const startVideo = () => {
      if (sourceAttached) return
      sourceAttached = true
      video.src = '/hero.mp4'
      video.load()
      void video.play().catch(() => setIsPlaying(false))
    }

    const scheduleVideo = () => {
      if (loadTimer !== undefined || sourceAttached) return
      // Let the title, navigation and first paint settle before requesting the video.
      loadTimer = window.setTimeout(startVideo, 900)
    }

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          scheduleVideo()
          observer?.disconnect()
        }
      }, { rootMargin: '120px' })
      observer.observe(video)
    } else {
      scheduleVideo()
    }

    const handlePlaying = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        video.pause()
      } else if (sourceAttached) {
        void video.play().catch(() => setIsPlaying(false))
      }
    }

    video.addEventListener('playing', handlePlaying)
    video.addEventListener('pause', handlePause)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (loadTimer !== undefined) window.clearTimeout(loadTimer)
      observer?.disconnect()
      video.removeEventListener('playing', handlePlaying)
      video.removeEventListener('pause', handlePause)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="hero-video-fallback">
        <svg className="hero-video-fallback-wings" viewBox="0 0 80 32" fill="none" aria-hidden="true">
          <path d="M4 25 C15 10 28 10 40 25" />
          <path d="M40 25 C52 10 65 10 76 25" />
        </svg>
      </div>
      <video
        ref={videoRef}
        className={`hero-video absolute inset-0 h-full w-full object-cover ${isPlaying ? 'is-playing' : ''}`}
        muted
        autoPlay
        loop
        playsInline
        preload="none"
        tabIndex={-1}
      />
    </div>
  )
}
