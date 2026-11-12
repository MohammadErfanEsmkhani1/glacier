import type { CSSProperties } from 'react'

type Bird = {
  x: number
  y: number
  size: number
  duration: number
  delay: number
  distance: number
  lift: number
  wing: number
  opacity: number
}

const flock: Bird[] = [
  { x: 7, y: 15, size: 34, duration: 13, delay: 1.2, distance: 24, lift: -10, wing: 1.6, opacity: .68 },
  { x: 17, y: 28, size: 22, duration: 10, delay: 3.4, distance: 18, lift: -8, wing: 1.3, opacity: .5 },
  { x: 24, y: 12, size: 42, duration: 15, delay: 2.1, distance: 30, lift: -15, wing: 1.9, opacity: .76 },
  { x: 32, y: 36, size: 19, duration: 11, delay: 4.7, distance: 16, lift: -7, wing: 1.4, opacity: .48 },
  { x: 39, y: 20, size: 29, duration: 12, delay: 5.2, distance: 22, lift: -12, wing: 1.5, opacity: .64 },
  { x: 49, y: 9, size: 24, duration: 14, delay: 2.8, distance: 19, lift: -11, wing: 1.7, opacity: .56 },
  { x: 57, y: 27, size: 38, duration: 16, delay: 6.1, distance: 28, lift: -13, wing: 2, opacity: .7 },
  { x: 66, y: 13, size: 27, duration: 11, delay: 1.8, distance: 20, lift: -9, wing: 1.35, opacity: .58 },
  { x: 74, y: 34, size: 20, duration: 13, delay: 4.2, distance: 17, lift: -8, wing: 1.6, opacity: .48 },
  { x: 83, y: 18, size: 36, duration: 15, delay: 3.1, distance: 25, lift: -12, wing: 1.8, opacity: .72 },
  { x: 92, y: 10, size: 25, duration: 12, delay: 5.7, distance: 18, lift: -10, wing: 1.4, opacity: .58 },
  { x: 12, y: 49, size: 18, duration: 14, delay: 6.5, distance: 15, lift: -6, wing: 1.5, opacity: .42 },
  { x: 22, y: 58, size: 25, duration: 17, delay: 2.4, distance: 20, lift: -9, wing: 1.9, opacity: .46 },
  { x: 29, y: 46, size: 16, duration: 10, delay: 7.3, distance: 14, lift: -6, wing: 1.2, opacity: .38 },
  { x: 43, y: 55, size: 22, duration: 13, delay: 3.8, distance: 18, lift: -8, wing: 1.55, opacity: .44 },
  { x: 54, y: 43, size: 17, duration: 12, delay: 5.4, distance: 15, lift: -7, wing: 1.35, opacity: .4 },
  { x: 63, y: 57, size: 26, duration: 16, delay: 1.5, distance: 21, lift: -10, wing: 1.8, opacity: .48 },
  { x: 72, y: 48, size: 17, duration: 11, delay: 6.9, distance: 14, lift: -6, wing: 1.4, opacity: .38 },
  { x: 80, y: 60, size: 23, duration: 15, delay: 2.9, distance: 19, lift: -8, wing: 1.7, opacity: .45 },
  { x: 89, y: 45, size: 19, duration: 12, delay: 4.4, distance: 16, lift: -7, wing: 1.45, opacity: .42 },
  { x: 96, y: 56, size: 15, duration: 10, delay: 7.8, distance: 13, lift: -5, wing: 1.25, opacity: .34 },
  { x: 4, y: 37, size: 15, duration: 12, delay: 5.9, distance: 13, lift: -5, wing: 1.3, opacity: .36 },
  { x: 36, y: 8, size: 18, duration: 10, delay: 8.2, distance: 14, lift: -7, wing: 1.2, opacity: .4 },
  { x: 46, y: 31, size: 15, duration: 13, delay: 7.1, distance: 13, lift: -6, wing: 1.45, opacity: .36 },
  { x: 69, y: 6, size: 18, duration: 12, delay: 9.1, distance: 14, lift: -7, wing: 1.3, opacity: .42 },
  { x: 77, y: 24, size: 15, duration: 11, delay: 8.5, distance: 12, lift: -5, wing: 1.25, opacity: .34 },
  { x: 86, y: 32, size: 17, duration: 14, delay: 6.2, distance: 14, lift: -7, wing: 1.5, opacity: .4 },
  { x: 15, y: 7, size: 17, duration: 11, delay: 9.8, distance: 13, lift: -6, wing: 1.2, opacity: .4 },
  { x: 57, y: 8, size: 16, duration: 10, delay: 10.4, distance: 13, lift: -6, wing: 1.25, opacity: .38 },
]

export default function BirdSky() {
  return (
    <div className="hero-bird-sky absolute inset-0" aria-hidden="true">
      {flock.map((bird, index) => (
        <svg
          key={index}
          viewBox="0 0 40 24"
          className="hero-bird"
          style={{
            left: bird.x + '%',
            top: bird.y + '%',
            width: bird.size + 'px',
            opacity: bird.opacity,
            '--flight-duration': bird.duration + 's',
            '--flight-delay': '-' + bird.delay + 's',
            '--flight-distance': bird.distance + 'px',
            '--flight-lift': bird.lift + 'px',
            '--wing-duration': bird.wing + 's',
          } as CSSProperties}
        >
          <g fill="currentColor">
            <path className="hero-bird-wing-left" d="M20 15 C14 7 7 4 2 6 C8 6 14 11 19 18 Z" />
            <path className="hero-bird-wing-right" d="M20 15 C26 7 33 4 38 6 C32 6 26 11 21 18 Z" />
            <path d="M17 15.2 Q20 12.7 23 15.2 Q20 17.1 17 15.2 Z" />
          </g>
        </svg>
      ))}
    </div>
  )
}
