import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { useTheme } from '../hooks/useTheme'

type Tint = 'none' | 'warm' | 'cool'

export interface Star {
  /** Distance from the rotation centre, 0-1 of the canvas half-diagonal. */
  radius: number
  /** Starting angle in radians; rotation is added to this each frame. */
  angle: number
  /** Dot radius in CSS px. */
  size: number
  /** Peak alpha, before twinkle and cursor glow. */
  alpha: number
  /** Twinkle wave offset, so the field never pulses in unison. */
  phase: number
  /** Twinkle rate; 1.05-3.14 gives a 2-6 second period. */
  speed: number
  /** How much of `alpha` the twinkle swings through. Capped per layer below
      1 so no star ever fades to fully invisible — a field that's dimmed at
      every point of every cycle reads as much sparser than its actual
      count. */
  twinkleDepth: number
  /** 0-1, drives how far the star shifts with the pointer and, via the
      layer it came from, roughly how "close" it reads. */
  depth: number
  /** A small slice of stars are warm- or cool-tinted rather than pure
      `--c-star`, mimicking real star colour variation (blue giants, red
      dwarfs) — mostly `'none'`. */
  tint: Tint
}

interface ShootingStar {
  x: number
  y: number
  vx: number
  vy: number
  /** Frames elapsed, against `maxLife`. */
  life: number
  maxLife: number
  length: number
}

/** One depth band. Stars are generated per-layer rather than from one
    continuous random spread, so the field reads as actual depth (far stars
    small, dim, and barely reactive; near stars bigger, brighter, and more
    responsive to the pointer) rather than a uniform scatter. */
interface LayerConfig {
  /** Fraction of the total star budget this layer gets. */
  countRatio: number
  size: [number, number]
  alpha: [number, number]
  depth: [number, number]
  twinkleDepth: [number, number]
}

const LAYERS: LayerConfig[] = [
  {
    // far: the bulk of the field — small, numerous, least reactive.
    countRatio: 0.55,
    size: [0.3, 0.7],
    alpha: [0.3, 0.6],
    depth: [0.05, 0.22],
    twinkleDepth: [0.18, 0.4],
  },
  {
    // mid
    countRatio: 0.3,
    size: [0.6, 1.15],
    alpha: [0.45, 0.78],
    depth: [0.28, 0.55],
    twinkleDepth: [0.22, 0.48],
  },
  {
    // near: fewer, bigger, brighter, most reactive to the pointer.
    countRatio: 0.15,
    size: [1.0, 1.9],
    alpha: [0.62, 0.95],
    depth: [0.62, 1],
    twinkleDepth: [0.28, 0.52],
  },
]

const MAX_STARS = 420
const DENSITY_DIVISOR = 4200

/** Milliseconds for one full revolution of the field. Lower is faster. */
const ROTATION_PERIOD_MS = 240_000

const PARALLAX_PX = 12
const PARALLAX_EASE = 0.06

/** Stars within this many px of the pointer brighten. */
const GLOW_RADIUS = 140
const GLOW_BOOST = 0.65

const SHOOTING_MIN_GAP_MS = 8_000
const SHOOTING_MAX_GAP_MS = 15_000
const SHOOTING_SPEED = 9
const SHOOTING_LIFE_FRAMES = 55

/** ~10% warm, ~10% cool, the rest untinted — enough to read as texture
    without the field looking obviously multicoloured. */
function pickTint(): Tint {
  const roll = Math.random()
  if (roll < 0.1) return 'warm'
  if (roll < 0.2) return 'cool'
  return 'none'
}

function randRange([min, max]: [number, number]): number {
  return min + Math.random() * (max - min)
}

export function createStars(width: number, height: number): Star[] {
  const total = Math.min(MAX_STARS, Math.round((width * height) / DENSITY_DIVISOR))
  const stars: Star[] = []
  for (const layer of LAYERS) {
    const count = Math.round(total * layer.countRatio)
    for (let i = 0; i < count; i += 1) {
      stars.push({
        // sqrt() keeps the distribution uniform by area rather than crowding
        // the centre, which is what a plain uniform radius would do.
        radius: Math.sqrt(Math.random()),
        angle: Math.random() * Math.PI * 2,
        size: randRange(layer.size),
        alpha: randRange(layer.alpha),
        phase: Math.random() * Math.PI * 2,
        speed: 1.05 + Math.random() * 2.09,
        twinkleDepth: randRange(layer.twinkleDepth),
        depth: randRange(layer.depth),
        tint: pickTint(),
      })
    }
  }
  return stars
}

/**
 * Star canvas scoped to the hero band it sits in, not the viewport. The field
 * is generated in three depth layers (far/mid/near), rotates slowly, each
 * star twinkles on its own period, stars near the pointer brighten, and a
 * shooting star crosses every 8-15 seconds.
 *
 * It stops animating when scrolled out of view or when the tab is hidden, and
 * draws a single static frame under prefers-reduced-motion.
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()
  const reduceMotion = useReducedMotion() ?? false

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    // Nested closures below (resize, handlePointer) don't retain TS's null
    // narrowing on a captured `HTMLCanvasElement | null`, so re-bind to a
    // const whose declared type is already non-null.
    const canvas: HTMLCanvasElement = canvasEl

    let ctx: CanvasRenderingContext2D | null = null
    try {
      ctx = canvas.getContext('2d')
    } catch {
      ctx = null // No canvas support (jsdom, exotic browsers) — draw nothing.
    }
    const context = ctx

    let stars: Star[] = []
    let width = 0
    let height = 0
    let halfDiagonal = 0
    let raf = 0
    let running = false
    // Whether the hero band is currently on screen. Defaults true so the
    // no-IntersectionObserver case still animates; the observer callback
    // (when one exists) keeps this in sync with real scroll position.
    let intersecting = true

    // Pointer parallax: target is where the mouse says we should be, current
    // eases toward it so the field glides rather than snaps.
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    // Pointer position in canvas-local px, for the proximity glow. Starts far
    // off-canvas so nothing is lit before the pointer has ever been over it.
    let pointerX = Number.NEGATIVE_INFINITY
    let pointerY = Number.NEGATIVE_INFINITY

    let shooting: ShootingStar | null = null
    let nextShootingAt = 0

    // Read once per effect run (mount, and again whenever `theme` changes)
    // rather than once per star per frame — `getComputedStyle` is one of the
    // more expensive DOM reads, and this loop can run for up to 420 stars at
    // 60fps. The tint offsets below are derived from this base triplet
    // rather than hardcoded, so warm/cool variation stays theme-aware
    // instead of only looking right in one theme.
    const starColorTriplet =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--c-star')
        .trim() || '255, 255, 255'
    const [baseR, baseG, baseB] = starColorTriplet
      .split(',')
      .map((n) => parseInt(n.trim(), 10))

    function clamp255(n: number): number {
      return Math.max(0, Math.min(255, n))
    }

    const TINT_TRIPLETS: Record<Tint, string> = {
      none: `${baseR}, ${baseG}, ${baseB}`,
      warm: `${clamp255(baseR + 25)}, ${clamp255(baseG + 5)}, ${clamp255(baseB - 35)}`,
      cool: `${clamp255(baseR - 25)}, ${clamp255(baseG)}, ${clamp255(baseB + 30)}`,
    }

    function starColor(alpha: number, tint: Tint = 'none') {
      return `rgba(${TINT_TRIPLETS[tint]}, ${alpha})`
    }

    function resize() {
      if (!context) return
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (width === 0 || height === 0) return
      // Stars are laid out on a disc of this radius so that rotating the
      // field never swings an empty corner into view.
      halfDiagonal = Math.sqrt(width * width + height * height) / 2
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      stars = createStars(width, height)
      // Reassigning canvas.width/height above clears the bitmap. Under
      // normal motion the rAF loop repaints next frame regardless, but under
      // reduced motion there is no loop — without this the first resize
      // (mobile URL-bar collapse, a desktop window drag) permanently blanks
      // the field. Harmless under normal motion: the loop just overwrites it.
      draw(0)
    }

    function spawnShootingStar() {
      // Enter from the top edge, travelling down and across. The horizontal
      // direction is random so it doesn't always sweep the same way.
      const goingRight = Math.random() < 0.5
      const angle = (Math.random() * 0.35 + 0.2) * Math.PI // 36-99 degrees
      shooting = {
        x: goingRight ? Math.random() * width * 0.4 : width - Math.random() * width * 0.4,
        y: Math.random() * height * 0.35,
        vx: (goingRight ? 1 : -1) * Math.cos(angle) * SHOOTING_SPEED,
        vy: Math.sin(angle) * SHOOTING_SPEED,
        life: 0,
        maxLife: SHOOTING_LIFE_FRAMES,
        length: 60 + Math.random() * 60,
      }
    }

    function drawShootingStar() {
      if (!context || !shooting) return
      const s = shooting
      // Fade in over the first fifth of its life, then out across the rest.
      const t = s.life / s.maxLife
      const fade = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8

      const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy) || 1
      const tailX = s.x - (s.vx / speed) * s.length
      const tailY = s.y - (s.vy / speed) * s.length

      const gradient = context.createLinearGradient(s.x, s.y, tailX, tailY)
      gradient.addColorStop(0, starColor(0.9 * fade))
      gradient.addColorStop(1, starColor(0))

      context.beginPath()
      context.moveTo(s.x, s.y)
      context.lineTo(tailX, tailY)
      context.strokeStyle = gradient
      context.lineWidth = 1.6
      context.lineCap = 'round'
      context.stroke()
    }

    function draw(time: number) {
      if (!context) return
      context.clearRect(0, 0, width, height)
      currentX += (targetX - currentX) * PARALLAX_EASE
      currentY += (targetY - currentY) * PARALLAX_EASE

      const centreX = width / 2
      const centreY = height / 2
      // Derive rotation from the timestamp rather than accumulating per frame,
      // so the speed is the same on a 60Hz and a 144Hz display.
      const rotation = reduceMotion
        ? 0
        : (time / ROTATION_PERIOD_MS) * Math.PI * 2

      for (const star of stars) {
        const theta = star.angle + rotation
        const distance = star.radius * halfDiagonal
        const x = centreX + Math.cos(theta) * distance + currentX * star.depth
        const y = centreY + Math.sin(theta) * distance + currentY * star.depth

        let alpha = star.alpha
        if (!reduceMotion) {
          const wave =
            0.5 + 0.5 * Math.sin(time * 0.001 * star.speed + star.phase)
          alpha *= 1 - star.twinkleDepth + star.twinkleDepth * wave

          // Proximity glow. Squared-distance test first so the sqrt only runs
          // for the handful of stars actually near the pointer.
          const dx = pointerX - x
          const dy = pointerY - y
          const distanceSq = dx * dx + dy * dy
          if (distanceSq < GLOW_RADIUS * GLOW_RADIUS) {
            const falloff = 1 - Math.sqrt(distanceSq) / GLOW_RADIUS
            alpha = Math.min(1, alpha + falloff * GLOW_BOOST)
          }
        }

        if (alpha <= 0.002) continue

        context.beginPath()
        context.arc(x, y, star.size, 0, Math.PI * 2)
        context.fillStyle = starColor(alpha, star.tint)
        context.fill()
      }

      drawShootingStar()
    }

    function frame(time: number) {
      if (nextShootingAt === 0) {
        nextShootingAt =
          time +
          SHOOTING_MIN_GAP_MS +
          Math.random() * (SHOOTING_MAX_GAP_MS - SHOOTING_MIN_GAP_MS)
      }

      if (!shooting && time >= nextShootingAt) {
        spawnShootingStar()
      }

      if (shooting) {
        shooting.x += shooting.vx
        shooting.y += shooting.vy
        shooting.life += 1
        if (shooting.life >= shooting.maxLife) {
          shooting = null
          nextShootingAt =
            time +
            SHOOTING_MIN_GAP_MS +
            Math.random() * (SHOOTING_MAX_GAP_MS - SHOOTING_MIN_GAP_MS)
        }
      }

      draw(time)
      raf = window.requestAnimationFrame(frame)
    }

    function start() {
      if (!context || running) return
      if (reduceMotion) {
        draw(0) // One static frame — the sky is there, it just doesn't move.
        return
      }
      running = true
      raf = window.requestAnimationFrame(frame)
    }

    function stop() {
      if (!running) return
      running = false
      window.cancelAnimationFrame(raf)
    }

    function handlePointer(event: MouseEvent) {
      const rect = canvas.getBoundingClientRect()
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * PARALLAX_PX
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * PARALLAX_PX
      pointerX = event.clientX - rect.left
      pointerY = event.clientY - rect.top
    }

    function handlePointerLeave() {
      pointerX = Number.NEGATIVE_INFINITY
      pointerY = Number.NEGATIVE_INFINITY
    }

    function handleVisibility() {
      if (document.hidden) {
        stop()
      } else if (intersecting) {
        // Don't resume just because the tab regained focus — the hero may
        // still be scrolled out of view, and no further observer callback
        // will fire until intersection actually changes.
        start()
      }
    }

    if (context) {
      resize()
      start()
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handlePointer)
    document.addEventListener('mouseleave', handlePointerLeave)
    document.addEventListener('visibilitychange', handleVisibility)

    let observer: IntersectionObserver | null = null
    if (context && typeof IntersectionObserver !== 'undefined' && !reduceMotion) {
      observer = new IntersectionObserver(
        ([entry]) => {
          intersecting = entry.isIntersecting
          if (intersecting) start()
          else stop()
        },
        { threshold: 0 },
      )
      observer.observe(canvas)
    }

    return () => {
      stop()
      observer?.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handlePointer)
      document.removeEventListener('mouseleave', handlePointerLeave)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
    // Re-running on theme change is what lets a reduced-motion visitor's
    // toggle repaint the (only ever drawn once) static frame in the new
    // theme's star color instead of leaving stale colors on screen — see the
    // cached `starColorTriplet` above. The cleanup above fully tears down
    // this run's rAF loop, listeners, and observer before the next run sets
    // up its own, so toggling doesn't leak a loop or double-register
    // anything.
  }, [theme, reduceMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        maskImage:
          'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
      }}
    />
  )
}
