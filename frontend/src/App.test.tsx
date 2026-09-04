import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppRoutes } from './App'
import { ThemeProvider } from './context/ThemeProvider'
import * as analytics from './lib/analytics'

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

  it('sets the document title for an unknown route', () => {
    renderAt('/nope')
    expect(document.title).toBe('Page not found — Jacob Otero')
  })
})

describe('pageview/title ordering (FIX C)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // FIX C's page_location/page_title event relies on document.title already
  // being correct by the time trackPageview() fires — because the page
  // component's own useDocumentTitle effect (a descendant of Layout) runs
  // before Layout's useAnalyticsPageview effect. That ordering is asserted
  // here directly, both on first mount and across a real client-side
  // navigation (through Layout's actual AnimatePresence transition, not a
  // stripped-down stand-in for it), rather than assumed.
  it('has already set the new route\'s title by the time the pageview fires, on mount and on navigation', async () => {
    const titlesAtCall: string[] = []
    vi.spyOn(analytics, 'trackPageview').mockImplementation(() => {
      titlesAtCall.push(document.title)
    })
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      </ThemeProvider>,
    )
    expect(titlesAtCall).toEqual(['Jacob Otero — Software Engineer'])

    await user.click(screen.getAllByRole('link', { name: 'Experience' })[0])

    expect(titlesAtCall).toEqual([
      'Jacob Otero — Software Engineer',
      'Experience — Jacob Otero',
    ])
  })
})
