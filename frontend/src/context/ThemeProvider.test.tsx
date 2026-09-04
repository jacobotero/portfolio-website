import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTheme } from '../hooks/useTheme'
import { ThemeProvider } from './ThemeProvider'

function Toggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  )
}

function renderProvider() {
  return render(
    <ThemeProvider>
      <Toggle />
    </ThemeProvider>,
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('does not write to localStorage on mount when no theme was stored', () => {
    renderProvider()
    // Writing the resolved (OS-preference-derived) theme on mount would make
    // readStoredTheme() and index.html's inline bootstrap script both
    // short-circuit on it forever, permanently defeating the
    // prefers-color-scheme fallback for a visitor who never touches the
    // toggle.
    expect(localStorage.getItem('theme')).toBeNull()
  })

  it('writes to localStorage once the theme is actually toggled', async () => {
    const user = userEvent.setup()
    renderProvider()
    expect(localStorage.getItem('theme')).toBeNull()

    await user.click(screen.getByRole('button'))

    expect(localStorage.getItem('theme')).toMatch(/^(light|dark)$/)
  })

  it('still sets data-theme on the document on mount, unstored', () => {
    renderProvider()
    expect(document.documentElement.getAttribute('data-theme')).toMatch(
      /^(light|dark)$/,
    )
  })

  // Regression test for FIX D: the previous guard against persisting the
  // resolved OS preference on mount was a useRef "first run" flag read
  // inside the effect. StrictMode double-invokes effects in development —
  // the first (discarded) run flips the flag, and the second run then
  // sails past the guard and persists anyway. main.tsx renders inside
  // <StrictMode>, so this reproduces what `npm run dev` actually does,
  // unlike the other tests in this file which render without it.
  it('does not write to localStorage on mount inside StrictMode, but still does on toggle', async () => {
    const user = userEvent.setup()
    render(
      <StrictMode>
        <ThemeProvider>
          <Toggle />
        </ThemeProvider>
      </StrictMode>,
    )
    expect(localStorage.getItem('theme')).toBeNull()

    await user.click(screen.getByRole('button'))

    expect(localStorage.getItem('theme')).toMatch(/^(light|dark)$/)
  })
})
