import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './App'
import { ThemeProvider } from './context/ThemeProvider'

function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('routing', () => {
  it('renders the home page at /', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Jacob Otero/i)
  })

  it('renders the projects page at /projects', () => {
    renderAt('/projects')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Projects/i)
  })

  it('renders the experience page at /experience', () => {
    renderAt('/experience')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Experience/i)
  })

  it('renders the contact page at /contact', () => {
    renderAt('/contact')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/touch|Contact/i)
  })

  it('renders a not-found page for an unknown route', () => {
    renderAt('/nope')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/not found/i)
  })
})
