import { useEffect, useRef } from 'react'

const INTERACTIVE_SELECTOR = 'a, button, input, textarea'
const RING_PADDING = 6

/**
 * A trailing cursor dot + a ring that magnetically snaps to trace the exact
 * shape of whatever interactive element it's hovering (buttons, nav pills,
 * cards) — reading the element's own border-radius so it always matches,
 * rather than just growing into a fixed circle.
 *
 * Desktop-pointer only: disabled on touch devices and when the visitor
 * prefers reduced motion.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const isTouch =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: coarse)').matches
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isTouch || prefersReducedMotion) return

    document.documentElement.classList.add('custom-cursor-active')

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2

    // Current (eased) ring box, and where it's heading toward.
    let ringLeft = mouseX - 16
    let ringTop = mouseY - 16
    let ringW = 32
    let ringH = 32

    let locked = false
    let targetRect = { x: mouseX - 16, y: mouseY - 16, w: 32, h: 32 }

    function handleMove(e: MouseEvent) {
      mouseX = e.clientX
      mouseY = e.clientY
      if (dotRef.current) {
        dotRef.current.style.left = `${mouseX}px`
        dotRef.current.style.top = `${mouseY}px`
      }
    }

    function handleOver(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)
      if (!target || !ringRef.current || !dotRef.current) return

      const rect = target.getBoundingClientRect()
      targetRect = {
        x: rect.left - RING_PADDING,
        y: rect.top - RING_PADDING,
        w: rect.width + RING_PADDING * 2,
        h: rect.height + RING_PADDING * 2,
      }
      const radius = window.getComputedStyle(target).borderRadius
      ringRef.current.style.borderRadius = radius && radius !== '0px' ? radius : '10px'
      ringRef.current.classList.add('cursor-locked')
      dotRef.current.style.opacity = '0'
      locked = true
    }

    function handleOut(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)
      if (!target || !ringRef.current || !dotRef.current) return

      locked = false
      ringRef.current.style.borderRadius = '50%'
      ringRef.current.classList.remove('cursor-locked')
      dotRef.current.style.opacity = '1'
    }

    let raf: number
    function animate() {
      const ease = locked ? 0.22 : 0.15
      const target = locked
        ? targetRect
        : { x: mouseX - 16, y: mouseY - 16, w: 32, h: 32 }

      ringLeft += (target.x - ringLeft) * ease
      ringTop += (target.y - ringTop) * ease
      ringW += (target.w - ringW) * ease
      ringH += (target.h - ringH) * ease

      if (ringRef.current) {
        ringRef.current.style.left = `${ringLeft}px`
        ringRef.current.style.top = `${ringTop}px`
        ringRef.current.style.width = `${ringW}px`
        ringRef.current.style.height = `${ringH}px`
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseover', handleOver)
    document.addEventListener('mouseout', handleOut)

    return () => {
      document.documentElement.classList.remove('custom-cursor-active')
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseover', handleOver)
      document.removeEventListener('mouseout', handleOut)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}
