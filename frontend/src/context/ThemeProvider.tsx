import {
  createContext,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Storage can be blocked (private mode, browser setting) — fall through.
  }
  try {
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    ) {
      return 'light'
    }
  } catch {
    // matchMedia unavailable — fall through to the dark default.
  }
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readStoredTheme)

  // useLayoutEffect (not useEffect) so this DOM write — which descendants
  // like Starfield read synchronously from their own effects — lands before
  // React flushes any passive effect in the tree. React runs every layout
  // effect (regardless of ancestor/descendant position) before any passive
  // effect, so this ordering holds even though Starfield sits below this
  // provider. With a plain useEffect, passive effects flush child-first,
  // so a descendant's effect can run and read the *previous* data-theme
  // value — see Starfield.tsx. No SSR in this app, so the usual
  // useLayoutEffect server warning doesn't apply.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    // Persisting here — not in the effect above, and not via a setState
    // updater function — means this write only ever happens once, on a
    // real user action. Persisting from the effect instead is defeated by
    // StrictMode's development-mode double-invoke of effects: a "first
    // render" guard flag would get flipped by the discarded first run, so
    // the second run persists the OS-derived initial theme anyway,
    // freezing the prefers-color-scheme fallback forever — the same bug
    // the guard was meant to prevent, just delayed one render. (A setState
    // updater function would have the identical problem: React
    // double-invokes those in StrictMode too.) A plain event handler has
    // no such double-invoke problem — it only runs in response to an
    // actual click.
    try {
      localStorage.setItem('theme', next)
    } catch {
      // Persisting is best-effort; the in-memory theme still applies.
    }
  }, [theme])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
