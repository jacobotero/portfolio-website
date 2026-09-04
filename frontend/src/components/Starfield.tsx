import { useEffect, useRef } from 'react'

interface Star {
  x: number // normalized 0-1
  y: number // normalized 0-1
  r: number // radius in CSS px
  alpha: number // base alpha
  phase: number // twinkle offset
  speed: number // twinkle rate
  depth: number // 0-1, drives parallax strength
}

const MAX_STARS = 260
const DRIFT_PER_FRAME = 0.006 // px, a pan measured in minutes
const PARALLAX_PX = 12
const PARALLAX_EASE = 0.06

function createStars(width: number, height: number): Star[] {
  const count = Math.min(MAX_STARS, Math.round((width * height) / 6000))
  const stars: Star[] = []
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random(),
      alpha: 0.15 + Math.random() * 0.75,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
      depth: Math.random(),
    })
  }
  return stars
}

/**
 * Star canvas scoped to the hero band it sits in — not the viewport. It stops
 * animating when scrolled out of view or when the tab is hidden, and draws a
 * single static frame under prefers-reduced-motion.
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let stars: Star[] = []
    let width = 0
    let height = 0
    let drift = 0
    let raf = 0
    let running = false

    // Pointer parallax: target is where the mouse says we should be, current
    // eases toward it so the field glides rather than snaps.
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    function starColor(alpha: number) {
      const triplet =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--c-star')
          .trim() || '255, 255, 255'
      return `rgba(${triplet}, ${alpha})`
    }

    function resize() {
      if (!context) return
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (width === 0 || height === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      stars = createStars(width, height)
    }

    function draw(time: number) {
      if (!context) return
      context.clearRect(0, 0, width, height)
      currentX += (targetX - currentX) * PARALLAX_EASE
      currentY += (targetY - currentY) * PARALLAX_EASE

      for (const star of stars) {
        const twinkle =
          reduceMotion ? 1 : 0.65 + 0.35 * Math.sin(time * 0.001 * star.speed + star.phase)
        let x = star.x * width + drift + currentX * star.depth
        const y = star.y * height + currentY * star.depth
        // Wrap horizontally so the drift never runs out of sky.
        x = ((x % width) + width) % width

        context.beginPath()
        context.arc(x, y, star.r, 0, Math.PI * 2)
        context.fillStyle = starColor(star.alpha * twinkle)
        context.fill()
      }
    }

    function frame(time: number) {
      drift += DRIFT_PER_FRAME
      draw(time)
      raf = window.requestAnimationFrame(frame)
    }

    function start() {
      if (running || reduceMotion || !context) return
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
    }

    function handleVisibility() {
      if (document.hidden) stop()
      else start()
    }

    if (context) {
      resize()
      if (reduceMotion) {
        draw(0) // One static frame — the sky is there, it just doesn't move.
      } else {
        start()
      }
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handlePointer)
    document.addEventListener('visibilitychange', handleVisibility)

    let observer: IntersectionObserver | null = null
    if (context && typeof IntersectionObserver !== 'undefined' && !reduceMotion) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) start()
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
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

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
