import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'

/** How much of the gap to target position is closed each frame — the same
    "ease toward a target" shape Starfield uses for its pointer parallax.
    Higher = snappier/closer to the real pointer, lower = more trailing lag. */
const EASE = 0.55

/** Anything matching this is treated as interactive for the hover-grow
    state. Selector-based rather than reading computed `cursor: pointer` off
    every element under the pointer, which would mean a DOM query per
    mousemove instead of only on actual enter/leave. */
const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="button"]'

/**
 * A small glowing dot that free-follows the pointer with a slight elastic
 * lag, and grows/brightens over anything interactive. Only renders on
 * fine-pointer (mouse/trackpad) devices — index.css hides the native cursor
 * under the same `(pointer: fine)` media query, so touch devices see neither
 * this dot nor a hidden native cursor.
 *
 * Position is written directly to the DOM via a ref on every frame rather
 * than through React state, the same performance-motivated choice Starfield
 * makes for its own per-frame updates.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion() ?? false

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    const dotEl = dotRef.current
    if (!dotEl) return
    // Nested closures below don't retain TS's null narrowing on a captured
    // `HTMLDivElement | null` — same reasoning as Starfield's identical
    // `canvasEl`/`canvas` rebind.
    const dot: HTMLDivElement = dotEl

    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let hasMoved = false
    let raf = 0

    function place(x: number, y: number) {
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
    }

    function handleMove(event: MouseEvent) {
      targetX = event.clientX
      targetY = event.clientY
      if (!hasMoved) {
        // First real input: snap in at the actual position instead of
        // easing in from an arbitrary starting point, and reveal the dot —
        // until now it's had nowhere real to be.
        hasMoved = true
        currentX = targetX
        currentY = targetY
        dot.style.opacity = '1'
        place(currentX, currentY)
      } else if (reduceMotion) {
        // No per-frame loop under reduced motion (see below) — track the
        // pointer directly rather than not moving at all.
        currentX = targetX
        currentY = targetY
        place(currentX, currentY)
      }
    }

    function handleOver(event: MouseEvent) {
      if (
        event.target instanceof Element &&
        event.target.closest(INTERACTIVE_SELECTOR)
      ) {
        dot.classList.add('is-hovering')
      }
    }

    function handleOut(event: MouseEvent) {
      const related = event.relatedTarget
      const stillOverInteractive =
        related instanceof Element && related.closest(INTERACTIVE_SELECTOR)
      if (!stillOverInteractive) {
        dot.classList.remove('is-hovering')
      }
    }

    function handleLeaveWindow() {
      dot.style.opacity = '0'
      hasMoved = false
    }

    function frame() {
      currentX += (targetX - currentX) * EASE
      currentY += (targetY - currentY) * EASE
      place(currentX, currentY)
      raf = window.requestAnimationFrame(frame)
    }

    window.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseout', handleOut)
    document.addEventListener('mouseleave', handleLeaveWindow)
    // Under reduced motion, handleMove already places the dot directly on
    // every move — an easing loop would just be autonomous motion toward a
    // target the pointer itself already reached.
    if (!reduceMotion) raf = window.requestAnimationFrame(frame)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
      document.removeEventListener('mouseleave', handleLeaveWindow)
    }
  }, [reduceMotion])

  return <div ref={dotRef} aria-hidden="true" className="custom-cursor-dot" />
}
