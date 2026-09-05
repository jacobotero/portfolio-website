import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '../context/ThemeProvider'
import { ProjectsPage } from './ProjectsPage'

// PageHero renders Starfield, which reads the theme via useTheme() — a
// ThemeProvider ancestor is required.
function renderPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('ProjectsPage', () => {
  it('renders every project by default', () => {
    renderPage()
    expect(screen.getByText('DonorTrack')).toBeInTheDocument()
    expect(screen.getByText('AGV Fault Tracker')).toBeInTheDocument()
    expect(screen.getByText('FanatIQ')).toBeInTheDocument()
    expect(
      screen.getByText('Resume & Job Description Analyzer'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Portfolio Website Infrastructure'),
    ).toBeInTheDocument()
  })

  it('narrows the list when a tech filter is selected', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Flask' }))

    expect(screen.getByText('AGV Fault Tracker')).toBeInTheDocument()
    expect(screen.queryByText('DonorTrack')).not.toBeInTheDocument()
  })

  it('restores the full list when All is selected', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Flask' }))
    await user.click(screen.getByRole('button', { name: 'All' }))

    expect(screen.getByText('DonorTrack')).toBeInTheDocument()
    expect(screen.getByText('AGV Fault Tracker')).toBeInTheDocument()
  })

  it('links each card to its detail page', () => {
    renderPage()
    const links = screen.getAllByRole('link', { name: /view details/i })
    expect(links[0]).toHaveAttribute('href', '/projects/donortrack')
  })

  it('marks the selected filter as pressed', async () => {
    const user = userEvent.setup()
    renderPage()

    const all = screen.getByRole('button', { name: 'All' })
    const flask = screen.getByRole('button', { name: 'Flask' })
    await user.click(flask)
    expect(flask).toHaveAttribute('aria-pressed', 'true')
    expect(all).toHaveAttribute('aria-pressed', 'false')
  })

  it('sets the document title', () => {
    renderPage()
    expect(document.title).toBe('Projects - Jacob Otero')
  })

  it('folds the tail of the tech filter list behind a "+N more" toggle', async () => {
    const user = userEvent.setup()
    renderPage()

    // Zod is the last (alphabetically) of the full tech list — well past
    // the default cutoff, so it should start hidden.
    expect(screen.queryByRole('button', { name: 'Zod' })).not.toBeInTheDocument()
    const moreButton = screen.getByRole('button', { name: /\+\d+ more/ })
    expect(moreButton).toHaveAttribute('aria-expanded', 'false')

    await user.click(moreButton)

    expect(screen.getByRole('button', { name: 'Zod' })).toBeInTheDocument()
    const lessButton = screen.getByRole('button', { name: /show less/i })
    expect(lessButton).toHaveAttribute('aria-expanded', 'true')

    await user.click(lessButton)

    expect(screen.queryByRole('button', { name: 'Zod' })).not.toBeInTheDocument()
  })
})
