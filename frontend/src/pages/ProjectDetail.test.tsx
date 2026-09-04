import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '../context/ThemeProvider'
import { ProjectDetail } from './ProjectDetail'

// PageHero renders Starfield, which reads the theme via useTheme() — a
// ThemeProvider ancestor is required.
function renderAt(slug: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[`/projects/${slug}`]}>
        <Routes>
          <Route path="/projects/:slug" element={<ProjectDetail />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('ProjectDetail', () => {
  it('renders the project title for a known slug', () => {
    renderAt('donortrack')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'DonorTrack',
    )
  })

  it('renders the three case study sections', () => {
    renderAt('donortrack')
    expect(screen.getByText(/the problem/i)).toBeInTheDocument()
    expect(screen.getByText(/^approach$/i)).toBeInTheDocument()
    expect(screen.getByText(/^outcome$/i)).toBeInTheDocument()
  })

  it('shows a live demo link only when the project has one', () => {
    renderAt('donortrack')
    expect(screen.getByRole('link', { name: /live demo/i })).toHaveAttribute(
      'href',
      'https://www.donortrackapp.com',
    )
  })

  it('omits the live demo link when there is no live URL', () => {
    renderAt('fanatiq')
    expect(screen.queryByRole('link', { name: /live demo/i })).toBeNull()
  })

  it('renders the not-found page for an unknown slug', () => {
    renderAt('does-not-exist')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /not found/i,
    )
  })

  it('renders the stack table', () => {
    renderAt('agv-fault-tracker')
    expect(screen.getByText('MongoDB (local, Docker, or Atlas)')).toBeInTheDocument()
  })

  it('sets the document title to the project name', () => {
    renderAt('donortrack')
    expect(document.title).toBe('DonorTrack — Jacob Otero')
  })

  it('sets the document title to a different project name on a different slug', () => {
    renderAt('fanatiq')
    expect(document.title).toBe('FanatIQ — Jacob Otero')
  })

  it('sets the document title to "Page not found" for an unknown slug', () => {
    renderAt('does-not-exist')
    expect(document.title).toBe('Page not found — Jacob Otero')
  })
})
