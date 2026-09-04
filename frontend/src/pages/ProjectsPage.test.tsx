import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ProjectsPage } from './ProjectsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <ProjectsPage />
    </MemoryRouter>,
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
})
