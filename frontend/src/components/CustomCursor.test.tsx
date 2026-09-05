import { render } from '@testing-library/react'
import { hasReducedMotionListener, prefersReducedMotion } from 'motion-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CustomCursor } from './CustomCursor'

/**
 * Forces `useReducedMotion()` (from `motion/react`) to resolve a given value.
 * See `Reveal.test.tsx` for the full explanation: it only reads
 * `window.matchMedia` the first time it's ever called in the whole process,
 * so later renders must set these `motion-dom` refs directly.
 */
function setPrefersReducedMotion(value: boolean) {
  hasReducedMotionListener.current = true
  prefersReducedMotion.current = value
}

/**
 * `window.matchMedia` is stubbed globally in test/setup.ts to return
 * `matches: false` for every query (jsdom has no real media-query engine).
 * CustomCursor's whole effect is gated on `(pointer: fine)` matching, so
 * activating it in a test means overriding just that one query.
 */
function mockPointerFine(value: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
    matches: query === '(pointer: fine)' ? value : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

/** Replaces requestAnimationFrame with a manual driver, same pattern as
    Starfield.test.tsx — steps the loop to a chosen frame on demand. */
function captureFrameDriver() {
  let pending: FrameRequestCallback | null = null
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    pending = cb
    return 1
  })
  return function tick(time: number) {
    const cb = pending
    pending = null
    cb?.(time)
  }
}

function move(x: number, y: number) {
  window.dispatchEvent(new MouseEvent('mousemove', { clientX: x, clientY: y }))
}

function getDot() {
  return document.querySelector('.custom-cursor-dot') as HTMLDivElement
}

describe('CustomCursor', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    setPrefersReducedMotion(false)
  })

  it('stays hidden until the pointer actually moves', () => {
    mockPointerFine(true)
    render(<CustomCursor />)

    expect(getDot().style.opacity).not.toBe('1')
  })

  it('reveals and places itself at the pointer on first movement', () => {
    mockPointerFine(true)
    render(<CustomCursor />)

    move(120, 80)

    const dot = getDot()
    expect(dot.style.opacity).toBe('1')
    expect(dot.style.transform).toContain('120px')
    expect(dot.style.transform).toContain('80px')
  })

  it('does nothing on a touch (non-fine-pointer) device', () => {
    mockPointerFine(false)
    const raf = vi.spyOn(window, 'requestAnimationFrame')
    render(<CustomCursor />)

    move(120, 80)

    expect(getDot().style.opacity).not.toBe('1')
    expect(raf).not.toHaveBeenCalled()
  })

  it('grows on hover over an interactive element and shrinks back when it leaves', () => {
    mockPointerFine(true)
    const { container } = render(
      <div>
        <CustomCursor />
        <a href="/projects">Projects</a>
        <span>plain text</span>
      </div>,
    )
    const link = container.querySelector('a')!
    const span = container.querySelector('span')!

    link.dispatchEvent(
      new MouseEvent('mouseover', { bubbles: true, relatedTarget: null }),
    )
    expect(getDot().classList.contains('is-hovering')).toBe(true)

    // Leaving the link for a plain, non-interactive element should drop the
    // hover state.
    link.dispatchEvent(
      new MouseEvent('mouseout', { bubbles: true, relatedTarget: span }),
    )
    expect(getDot().classList.contains('is-hovering')).toBe(false)
  })

  it('tracks the pointer target within a single frame, with no perceptible trailing lag', () => {
    mockPointerFine(true)
    const tick = captureFrameDriver()
    render(<CustomCursor />)

    move(0, 0) // reveals at the origin, current == target == 0,0
    move(200, 0) // target jumps away

    tick(16)
    const xAfterOneFrame = Number(
      getDot().style.transform.match(/translate3d\(([\d.-]+)px/)?.[1],
    )
    // EASE = 1: the single frame closes the whole gap immediately, matching
    // the native cursor's feel rather than a visibly trailing dot.
    expect(xAfterOneFrame).toBe(200)
  })

  it('starts no easing loop under reduced motion, tracking the pointer directly instead', () => {
    mockPointerFine(true)
    setPrefersReducedMotion(true)
    const raf = vi.spyOn(window, 'requestAnimationFrame')
    render(<CustomCursor />)

    move(50, 60)

    expect(raf).not.toHaveBeenCalled()
    expect(getDot().style.transform).toContain('50px')
    expect(getDot().style.transform).toContain('60px')
  })

  it('cleans up its listeners on unmount', () => {
    mockPointerFine(true)
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<CustomCursor />)

    unmount()

    expect(remove).toHaveBeenCalledWith('mousemove', expect.any(Function))
  })
})
