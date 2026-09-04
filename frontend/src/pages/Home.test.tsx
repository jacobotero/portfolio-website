import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '../context/ThemeProvider'
import { Home } from './Home'

// Hero renders Starfield, which reads the theme via useTheme() — a
// ThemeProvider ancestor is required.
function renderHome() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('Home', () => {
  it('shows exactly the three featured projects', () => {
    renderHome()
    expect(screen.getByText('DonorTrack')).toBeInTheDocument()
    expect(screen.getByText('AGV Fault Tracker')).toBeInTheDocument()
    expect(screen.getByText('FanatIQ')).toBeInTheDocument()
    expect(
      screen.queryByText('Resume & Job Description Analyzer'),
    ).not.toBeInTheDocument()
  })

  it('links to the full projects page', () => {
    renderHome()
    expect(
      screen.getByRole('link', { name: /view all projects/i }),
    ).toHaveAttribute('href', '/projects')
  })

  it('renders both certifications', () => {
    renderHome()
    expect(
      screen.getByText(/AWS Certified Solutions Architect/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Google AI Professional Certificate/i),
    ).toBeInTheDocument()
  })

  it('links the Google certificate to its credential', () => {
    renderHome()
    expect(
      screen.getByRole('link', { name: /view credential/i }),
    ).toHaveAttribute(
      'href',
      'https://www.coursera.org/account/accomplishments/professional-cert/certificate/MFQ3BPXDSCLO',
    )
  })

  it('offers a resume download', () => {
    renderHome()
    const links = screen.getAllByRole('link', { name: /resume/i })
    expect(links.some((l) => l.getAttribute('href') === '/resume.pdf')).toBe(true)
  })

  it('sets the document title', () => {
    renderHome()
    expect(document.title).toBe('Jacob Otero — Software Engineer')
  })
})
