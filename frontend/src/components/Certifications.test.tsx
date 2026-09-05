import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Certifications } from './Certifications'

describe('Certifications', () => {
  it('shows an "In Progress" status pill for the AWS certification', () => {
    render(<Certifications />)
    const aws = screen
      .getByText('AWS Certified Solutions Architect - Associate')
      .closest('p')
    expect(aws).not.toBeNull()
    expect(aws).toHaveTextContent('In Progress')
    expect(aws).not.toHaveTextContent('Completed')
  })

  it('shows a "Completed" status pill for the Google AI certification', () => {
    render(<Certifications />)
    const google = screen
      .getByText('Google AI Professional Certificate')
      .closest('p')
    expect(google).not.toBeNull()
    expect(google).toHaveTextContent('Completed')
    expect(google).not.toHaveTextContent('In Progress')
  })

  it('no longer buries the status as a sentence inside the description', () => {
    render(<Certifications />)
    // Regression check for the fix itself: the old copy read "In progress."
    // / "Completed." as the first sentence of the description paragraph.
    expect(screen.queryByText(/^in progress\./i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^completed\./i)).not.toBeInTheDocument()
  })
})
