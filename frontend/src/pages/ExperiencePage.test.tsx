import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ExperiencePage } from './ExperiencePage'

describe('ExperiencePage', () => {
  it('names the company once as a heading', () => {
    render(<ExperiencePage />)
    expect(
      screen.getByRole('heading', { name: /Mercedes-Benz U\.S\. International/i }),
    ).toBeInTheDocument()
  })

  it('renders all three roles', () => {
    render(<ExperiencePage />)
    expect(screen.getAllByText('Software Engineering Co-op')).toHaveLength(3)
  })

  it('renders each role department and dates', () => {
    render(<ExperiencePage />)
    expect(screen.getByText(/May 2026 – Aug 2026/)).toBeInTheDocument()
    expect(screen.getByText(/Aug 2025 – Dec 2025/)).toBeInTheDocument()
    expect(screen.getByText(/Jan 2025 – May 2025/)).toBeInTheDocument()
    expect(screen.getAllByText(/Global Service & Parts/).length).toBe(2)
    expect(screen.getByText(/Battery Plant/)).toBeInTheDocument()
  })

  it('shows the combined tenure summary', () => {
    render(<ExperiencePage />)
    expect(screen.getByText(/3 terms/i)).toBeInTheDocument()
  })
})
