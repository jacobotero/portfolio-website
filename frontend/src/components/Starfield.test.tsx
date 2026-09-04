import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Starfield } from './Starfield'

describe('Starfield', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders without throwing when the 2D context is unavailable', () => {
    expect(() => render(<Starfield />)).not.toThrow()
  })

  it('starts no animation frame loop when reduced motion is preferred', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
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
})
