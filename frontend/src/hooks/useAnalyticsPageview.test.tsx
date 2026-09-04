import { render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '../lib/analytics'
import { useAnalyticsPageview } from './useAnalyticsPageview'

function Page({ label }: { label: string }) {
  useAnalyticsPageview()
  return <p>{label}</p>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Page label="home" />} />
      <Route path="/contact" element={<Page label="contact" />} />
    </Routes>
  )
}

describe('useAnalyticsPageview', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('tracks a pageview for the current path on mount', () => {
    const spy = vi.spyOn(analytics, 'trackPageview').mockImplementation(() => {})

    renderHook(() => useAnalyticsPageview(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/projects']}>{children}</MemoryRouter>
      ),
    })

    expect(spy).toHaveBeenCalledWith('/projects')
  })

  it('tracks another pageview when the route changes', async () => {
    const spy = vi.spyOn(analytics, 'trackPageview').mockImplementation(() => {})
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Link to="/contact">Contact</Link>
        <App />
      </MemoryRouter>,
    )
    expect(spy).toHaveBeenCalledWith('/')

    spy.mockClear()
    await user.click(screen.getByRole('link', { name: 'Contact' }))

    expect(spy).toHaveBeenCalledWith('/contact')
  })
})
