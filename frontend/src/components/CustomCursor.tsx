import { useEffect, useRef } from 'react'

/**
 * A trailing cursor ring + dot, desktop-pointer only. Disabled on touch
 * devices and when the visitor prefers reduced motion — both cases where a
 * custom cursor is either meaningless or unwanted.
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
    let ringX = mouseX
    let ringY = mouseY

    function handleMove(e: MouseEvent) {
      mouseX = e.clientX
      mouseY = e.clientY
      if (dotRef.current) {
        dotRef.current.style.left = `${mouseX}px`
        dotRef.current.style.top = `${mouseY}px`
      }
    }

    function handleOver(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (target.closest('a, button, input, textarea')) {
        ringRef.current?.classList.add('cursor-hover')
      }
    }

    function handleOut(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (target.closest('a, button, input, textarea')) {
        ringRef.current?.classList.remove('cursor-hover')
      }
    }

    let raf: number
    function animate() {
      ringX += (mouseX - ringX) * 0.15
      ringY += (mouseY - ringY) * 0.15
      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`
        ringRef.current.style.top = `${ringY}px`
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
