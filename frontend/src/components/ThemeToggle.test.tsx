import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../context/ThemeProvider'
import { ThemeToggle } from './ThemeToggle'

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.setAttribute('data-theme', 'dark')
  })

  it('flips data-theme on the document when clicked', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(screen.getByRole('button', { name: /theme/i }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    await user.click(screen.getByRole('button', { name: /theme/i }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('persists the chosen theme to localStorage', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(screen.getByRole('button', { name: /theme/i }))
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('honors a theme already stored in localStorage', () => {
    localStorage.setItem('theme', 'light')
    renderToggle()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('still renders when localStorage throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => renderToggle()).not.toThrow()
    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument()
    spy.mockRestore()
  })
})
