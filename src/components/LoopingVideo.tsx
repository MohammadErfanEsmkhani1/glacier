import { useEffect, useRef } from 'react'

const FADE_MS = 1400
// Start the crossfade slightly before the end so the outgoing clip never freezes on its last frame mid-fade.
const LEAD_S = FADE_MS / 1000 + 0.2

const layer = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
} as const

/**
 * Seamless background loop. The native `loop` attribute seeks back to 0 when the clip ends,
 * which stalls on many browsers and exposes the hard cut between the last and first frame.
 * Two stacked copies of the clip are alternated instead: shortly before the visible one ends,
 * the hidden one (already parked on frame 0) starts playing and fades in on top of it.
 */
export default function LoopingVideo({ src }: { src: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const firstRef = useRef<HTMLVideoElement>(null)
  const secondRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const first = firstRef.current
    const second = secondRef.current
    if (!container || !first || !second) return

    const videos = [first, second]
    let active = 0
    let fading = false
    let inView = true
    let frame = 0
    let fadeTimer = 0

    const play = (video: HTMLVideoElement) => {
      video.play().catch(() => {})
    }

    first.style.opacity = '1'
    first.style.zIndex = '1'
    second.style.opacity = '0'
    second.style.zIndex = '0'

    const crossfade = () => {
      if (fading) return
      fading = true
      const outgoing = videos[active]
      const incoming = videos[1 - active]

      if (incoming.currentTime !== 0) incoming.currentTime = 0
      incoming.style.transition = `opacity ${FADE_MS}ms ease-in-out`
      incoming.style.zIndex = '1'
      outgoing.style.zIndex = '0'
      if (inView) play(incoming)
      requestAnimationFrame(() => {
        incoming.style.opacity = '1'
      })

      fadeTimer = window.setTimeout(() => {
        outgoing.pause()
        outgoing.style.transition = 'none'
        outgoing.style.opacity = '0'
        outgoing.currentTime = 0
        active = 1 - active
        fading = false
      }, FADE_MS + 50)
    }

    const tick = () => {
      const current = videos[active]
      if (!fading && current.duration && current.duration - current.currentTime <= LEAD_S) crossfade()
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)

    // rAF is throttled in background tabs; `ended` still fires, so it acts as a fallback trigger.
    const onEnded = (event: Event) => {
      if (event.currentTarget === videos[active] && !fading) crossfade()
    }
    videos.forEach((video) => video.addEventListener('ended', onEnded))

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (inView) {
        play(videos[active])
        if (fading) play(videos[1 - active])
      } else {
        videos.forEach((video) => video.pause())
      }
    })
    observer.observe(container)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(fadeTimer)
      observer.disconnect()
      videos.forEach((video) => video.removeEventListener('ended', onEnded))
    }
  }, [])

  return (
    <div ref={containerRef} aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
      <video ref={firstRef} style={layer} src={src} autoPlay muted playsInline preload="auto" />
      <video ref={secondRef} data-preloader-skip="true" style={layer} src={src} muted playsInline preload="auto" />
    </div>
  )
}
