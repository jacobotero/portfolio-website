import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Reveal } from './Reveal'

describe('Reveal', () => {
  it('renders its children', () => {
    render(
      <Reveal>
        <p>visible content</p>
      </Reveal>,
    )
    expect(screen.getByText('visible content')).toBeInTheDocument()
  })

  it('passes through a className', () => {
    const { container } = render(
      <Reveal className="custom-class">
        <p>content</p>
      </Reveal>,
    )
    expect(container.querySelector('.custom-class')).not.toBeNull()
  })
})
