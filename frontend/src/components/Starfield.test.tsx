import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Starfield } from './Starfield'

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
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  )
  return ctx
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

describe('Starfield', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders without throwing when the 2D context is unavailable', () => {
    expect(() => render(<Starfield />)).not.toThrow()
  })

  it('starts no animation frame loop when reduced motion is preferred', () => {
    mockCanvasContext()
    // `vi.spyOn(window, 'matchMedia').mockImplementation(...)` doesn't get
    // reliably undone by `vi.restoreAllMocks()` here: `window.matchMedia` is
    // already a `vi.fn()` from test/setup.ts, and spyOn on an existing mock
    // returns that same mock rather than a restorable wrapper, so the
    // reduced-motion override leaked into later tests. `vi.stubGlobal` is
    // paired with `vi.unstubAllGlobals()` in afterEach and reliably restores.
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    )
    const raf = vi.spyOn(window, 'requestAnimationFrame')

    render(<Starfield />)

    expect(raf).not.toHaveBeenCalled()
  })

  it('renders when IntersectionObserver is unavailable', () => {
    mockCanvasContext()
    const original = globalThis.IntersectionObserver
    // @ts-expect-error deliberately removing the global for this case
    delete globalThis.IntersectionObserver
    expect(() => render(<Starfield />)).not.toThrow()
    globalThis.IntersectionObserver = original
  })

  it('cleans up its listeners on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Starfield />)
    unmount()
    expect(remove).toHaveBeenCalled()
  })

  it('pauses the loop when scrolled out of view and resumes when back in view', () => {
    mockCanvasContext()
    const io = mockIntersectionObserver()
    const raf = vi.spyOn(window, 'requestAnimationFrame')
    const caf = vi.spyOn(window, 'cancelAnimationFrame')

    render(<Starfield />)
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

    render(<Starfield />)
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
})
