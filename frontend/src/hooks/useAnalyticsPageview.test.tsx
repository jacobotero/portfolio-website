import { render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as analytics from '../lib/analytics'
import { useAnalyticsPageview } from './useAnalyticsPageview'

/** Mirrors how Layout calls it: the path comes in as a prop, not from context. */
function Page({ label, path }: { label: string; path: string }) {
  useAnalyticsPageview(path)
  return <p>{label}</p>
}

function RoutedPage({ label }: { label: string }) {
  const { pathname } = useLocation()
  return <Page label={label} path={pathname} />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoutedPage label="home" />} />
      <Route path="/contact" element={<RoutedPage label="contact" />} />
    </Routes>
  )
}

describe('useAnalyticsPageview', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('tracks a pageview for the given path on mount', () => {
    const spy = vi.spyOn(analytics, 'trackPageview').mockImplementation(() => {})

    renderHook(() => useAnalyticsPageview('/projects'))

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

  it('does not re-fire when the router moves but its own path prop does not', () => {
    const spy = vi.spyOn(analytics, 'trackPageview').mockImplementation(() => {})

    // Stands in for an outgoing AnimatePresence wrapper: still mounted while
    // the router has already moved on. Reading the path from context here is
    // what used to fire a pageview for the incoming route before that route
    // had mounted and set its title.
    const { rerender } = render(
      <MemoryRouter initialEntries={['/']}>
        <Page label="home" path="/" />
      </MemoryRouter>,
    )
    expect(spy).toHaveBeenCalledTimes(1)

    spy.mockClear()
    rerender(
      <MemoryRouter initialEntries={['/contact']}>
        <Page label="home" path="/" />
      </MemoryRouter>,
    )

    expect(spy).not.toHaveBeenCalled()
  })
})
