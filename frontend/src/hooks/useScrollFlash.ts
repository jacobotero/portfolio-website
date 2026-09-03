import { useEffect } from 'react'

/**
 * Flashes the target section when an in-page "#id" link is clicked, so
 * jumping to a section (nav links, hero buttons) reads as arriving
 * somewhere rather than an abrupt cut. Smooth scrolling itself is handled
 * by `scroll-behavior: smooth` in index.css.
 */
export function useScrollFlash() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const anchor = (event.target as HTMLElement).closest('a[href^="#"]')
      if (!anchor) return

      const id = anchor.getAttribute('href')?.slice(1)
      const target = id ? document.getElementById(id) : null
      if (!target) return

      target.classList.remove('animate-target-flash')
      void target.offsetWidth // restart the animation if the same link is clicked again
      target.classList.add('animate-target-flash')
      target.addEventListener(
        'animationend',
        () => target.classList.remove('animate-target-flash'),
        { once: true },
      )
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])
}
