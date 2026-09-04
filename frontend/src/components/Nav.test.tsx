import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '../context/ThemeProvider'
import { Nav } from './Nav'

function renderNav(path = '/') {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <Nav />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('Nav', () => {
  it('renders every top-level link', () => {
    renderNav()
    for (const label of ['Home', 'Projects', 'Experience', 'Contact']) {
      expect(
        screen.getAllByRole('link', { name: label }).length,
      ).toBeGreaterThan(0)
    }
  })

  it('marks the current route as the active page', () => {
    renderNav('/projects')
    const active = screen
      .getAllByRole('link', { name: 'Projects' })
      .find((el) => el.getAttribute('aria-current') === 'page')
    expect(active).toBeDefined()
  })

  it('does not mark a non-current route as active', () => {
    renderNav('/projects')
    const home = screen
      .getAllByRole('link', { name: 'Home' })
      .find((el) => el.getAttribute('aria-current') === 'page')
    expect(home).toBeUndefined()
  })

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup()
    renderNav()

    const trigger = screen.getByRole('button', { name: /open menu/i })
    await user.click(trigger)
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close menu/i }))
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
  })

  it('renders the brand as a link home', () => {
    renderNav('/contact')
    expect(screen.getByRole('link', { name: /jacob otero/i })).toHaveAttribute(
      'href',
      '/',
    )
  })
})
