import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Nav } from './Nav'

describe('Nav', () => {
  it('renders a link for every section', () => {
    render(<Nav />)

    const sections = ['about', 'skills', 'projects', 'resume', 'contact']
    for (const section of sections) {
      const link = screen.getByRole('link', { name: section })
      expect(link).toHaveAttribute('href', `#${section}`)
    }
  })
})
