import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'

// ThemeProvider's toggleTheme persists to localStorage (FIX D), and jsdom's
// localStorage isn't reset between tests on its own — without this, one
// test file's toggle can leak the resulting theme into another file's (or
// even another test's) ThemeProvider mount.
afterEach(() => {
  localStorage.clear()
  // useGitHubStats caches its fetch result here; without clearing it, one
  // test's cached data leaks into another test's (or file's) render.
  sessionStorage.clear()
})

if (typeof window.matchMedia !== 'function') {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
}

// jsdom has no canvas implementation; components must tolerate a null context.
HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never

// jsdom's document is blank — it never loads index.html — so mirror the
// <meta name="description"> tag index.html defines, giving useDocumentTitle
// the same starting point in tests that a real browser paints first.
if (!document.querySelector('meta[name="description"]')) {
  const meta = document.createElement('meta')
  meta.setAttribute('name', 'description')
  meta.setAttribute(
    'content',
    'Jacob Otero, a Computer Science senior building full-stack products and the AWS infrastructure they run on. Full-stack development, database design, system design, cloud architecture, and applied AI.',
  )
  document.head.appendChild(meta)
}
