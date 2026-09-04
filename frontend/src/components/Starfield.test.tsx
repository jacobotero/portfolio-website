import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { hasReducedMotionListener, prefersReducedMotion } from 'motion-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../context/ThemeProvider'
import { Starfield } from './Starfield'
import { ThemeToggle } from './ThemeToggle'

/**
 * `test/setup.ts` stubs `getContext` to always return null so components
 * tolerate jsdom's lack of a real canvas. Guards 2 and 3 (and the
 * IntersectionObserver-undefined tolerance) only run their guarded code when
 * a context exists, so tests that exercise them need a real-enough fake to
 * actually reach that code — otherwise the assertion holds for the wrong
 * reason (no context) rather than the right one (the guard itself).
 */
function mockCanvasContext() {
  const ctx = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    setTransform: vi.fn(),
    fillStyle: '',
  }
  // `HTMLCanvasElement.prototype.getContext` is already a `vi.fn()` from
  // test/setup.ts (a direct property assignment, not a spy), so
  // `vi.spyOn(...)` on it returns that same mock reference rather than a
  // restorable wrapper — `vi.restoreAllMocks()` in afterEach has nothing to
  // undo and the fake context leaks into later tests. Reassigning the
  // null-returning stub explicitly in afterEach (below) fixes it, the same
  // way the `matchMedia` leak was fixed.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  )
  return ctx
}

/**
 * jsdom's `getBoundingClientRect` always returns a zero-size rect, which
 * makes `resize()` bail out before ever drawing (by design — a 0×0 canvas
 * has nothing to draw). Tests that need `resize()` to actually run its draw
 * path need a non-zero rect.
 */
function mockCanvasSize(width: number, height: number) {
  vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue(
    {
      width,
      height,
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      x: 0,
      y: 0,
      toJSON() {},
    } as DOMRect,
  )
}

/** A controllable IntersectionObserver stub that lets a test fire
 * isIntersecting transitions on demand instead of relying on real scrolling. */
function mockIntersectionObserver() {
  let callback: IntersectionObserverCallback = () => {}
  const observe = vi.fn()
  const disconnect = vi.fn()
  class FakeIntersectionObserver {
    constructor(cb: IntersectionObserverCallback) {
      callback = cb
    }
    observe = observe
    disconnect = disconnect
    unobserve = vi.fn()
    takeRecords = () => []
  }
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  return {
    observe,
    disconnect,
    fire(isIntersecting: boolean) {
      callback(
        [{ isIntersecting } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    },
  }
}

/**
 * Forces `useReducedMotion()` (from `motion/react`) to resolve a given value.
 *
 * `useReducedMotion()` only reads `window.matchMedia` the *first* time it is
 * ever called in the whole process, then caches the result at module level —
 * see `Reveal.test.tsx` for the full explanation. `vi.stubGlobal('matchMedia',
 * ...)` is a no-op once any earlier test in the run has rendered a component
 * that calls the hook. Setting these refs directly (exported by `motion-dom`,
 * which `motion/react` reads them from) is the reliable way to force it.
 */
function setPrefersReducedMotion(value: boolean) {
  hasReducedMotionListener.current = true
  prefersReducedMotion.current = value
}

// Starfield reads the theme via useTheme(), which throws without a
// ThemeProvider ancestor.
function renderStarfield() {
  return render(
    <ThemeProvider>
      <Starfield />
    </ThemeProvider>,
  )
}

describe('Starfield', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    setPrefersReducedMotion(false)
    // vi.restoreAllMocks() doesn't undo mockCanvasContext()'s override (see
    // the comment on mockCanvasContext) — explicitly put the null-returning
    // stub from test/setup.ts back so later tests get a clean null context.
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never
  })

  it('renders without throwing when the 2D context is unavailable', () => {
    expect(() => renderStarfield()).not.toThrow()
  })

  it('starts no animation frame loop when reduced motion is preferred', () => {
    mockCanvasContext()
    setPrefersReducedMotion(true)
    const raf = vi.spyOn(window, 'requestAnimationFrame')

    renderStarfield()

    expect(raf).not.toHaveBeenCalled()
  })

  it('renders when IntersectionObserver is unavailable', () => {
    mockCanvasContext()
    const original = globalThis.IntersectionObserver
    // @ts-expect-error deliberately removing the global for this case
    delete globalThis.IntersectionObserver
    expect(() => renderStarfield()).not.toThrow()
    globalThis.IntersectionObserver = original
  })

  it('cleans up its listeners on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderStarfield()
    unmount()
    expect(remove).toHaveBeenCalled()
  })

  it('pauses the loop when scrolled out of view and resumes when back in view', () => {
    mockCanvasContext()
    const io = mockIntersectionObserver()
    const raf = vi.spyOn(window, 'requestAnimationFrame')
    const caf = vi.spyOn(window, 'cancelAnimationFrame')

    renderStarfield()
    expect(raf).toHaveBeenCalledTimes(1) // initial mount starts the loop

    io.fire(false) // scrolled out of view
    expect(caf).toHaveBeenCalledTimes(1)

    const callsBeforeResume = raf.mock.calls.length
    io.fire(true) // scrolled back into view
    expect(raf.mock.calls.length).toBeGreaterThan(callsBeforeResume)
  })

  it('does not resume the loop on tab focus while scrolled out of view', () => {
    mockCanvasContext()
    const io = mockIntersectionObserver()
    const raf = vi.spyOn(window, 'requestAnimationFrame')

    renderStarfield()
    io.fire(false) // scrolled out of view; the observer stops the loop

    const callsBeforeVisibilityChange = raf.mock.calls.length

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    })
    document.dispatchEvent(new Event('visibilitychange')) // tab backgrounded

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    })
    document.dispatchEvent(new Event('visibilitychange')) // tab refocused, still off-screen

    expect(raf.mock.calls.length).toBe(callsBeforeVisibilityChange)
  })

  it('redraws on resize under reduced motion instead of leaving the canvas blank', () => {
    const ctx = mockCanvasContext()
    mockCanvasSize(300, 300)
    setPrefersReducedMotion(true)

    renderStarfield()
    const clearsAfterMount = ctx.clearRect.mock.calls.length
    expect(clearsAfterMount).toBeGreaterThan(0) // the one static frame at mount

    window.dispatchEvent(new Event('resize'))

    // A second draw happened — canvas.width/height being reassigned in
    // resize() clears the bitmap, and under reduced motion there is no rAF
    // loop to repaint it on the next frame, so resize() must draw directly.
    expect(ctx.clearRect.mock.calls.length).toBeGreaterThan(clearsAfterMount)
    // And it actually painted stars, not just cleared the canvas.
    expect(ctx.arc.mock.calls.length).toBeGreaterThan(0)
  })

  it('tears down and re-registers its listeners without leaking when the theme changes', async () => {
    mockCanvasContext()
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <ThemeToggle />
        <Starfield />
      </ThemeProvider>,
    )
    const addCallsAfterMount = add.mock.calls.length

    await user.click(screen.getByRole('button', { name: /theme/i }))

    // The effect's dependency array now includes `theme`, so toggling tears
    // the whole effect down and re-runs it. Every listener added on mount
    // must be removed once, and the re-run adds its own fresh set — no net
    // accumulation of duplicate listeners across the toggle.
    expect(remove.mock.calls.length).toBeGreaterThanOrEqual(addCallsAfterMount)
    expect(add.mock.calls.length).toBeGreaterThan(addCallsAfterMount)
  })
})
