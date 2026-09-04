import { fireEvent, render, screen } from '@testing-library/react'
import { hasReducedMotionListener, prefersReducedMotion } from 'motion-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BackToTop } from './BackToTop'

/**
 * Forces `useReducedMotion()` (from `motion/react`) to resolve `true`.
 *
 * See `Reveal.test.tsx` for the full explanation: `useReducedMotion()` only
 * reads `window.matchMedia` the first time it is ever called in the whole
 * process, so later renders must set these `motion-dom` refs directly rather
 * than stubbing `matchMedia`.
 */
function setPrefersReducedMotion(value: boolean) {
  hasReducedMotionListener.current = true
  prefersReducedMotion.current = value
}

function scrollDown() {
  Object.defineProperty(window, 'scrollY', { value: 800, writable: true })
  fireEvent.scroll(window)
}

describe('BackToTop', () => {
  afterEach(() => {
    setPrefersReducedMotion(false)
  })

  it('is hidden near the top of the page', () => {
    render(<BackToTop />)
    expect(screen.queryByRole('button', { name: /back to top/i })).toBeNull()
  })

  it('appears once the page is scrolled down', () => {
    render(<BackToTop />)
    scrollDown()
    expect(
      screen.getByRole('button', { name: /back to top/i }),
    ).toBeInTheDocument()
  })

  it('scrolls to the top when clicked', () => {
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo as never
    render(<BackToTop />)
    scrollDown()

    fireEvent.click(screen.getByRole('button', { name: /back to top/i }))
    expect(scrollTo).toHaveBeenCalled()
  })

  it('scrolls smoothly by default', () => {
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo as never
    render(<BackToTop />)
    scrollDown()

    fireEvent.click(screen.getByRole('button', { name: /back to top/i }))
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('jumps instantly instead of smooth-scrolling when reduced motion is preferred', () => {
    setPrefersReducedMotion(true)
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo as never
    render(<BackToTop />)
    scrollDown()

    fireEvent.click(screen.getByRole('button', { name: /back to top/i }))
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })
})
