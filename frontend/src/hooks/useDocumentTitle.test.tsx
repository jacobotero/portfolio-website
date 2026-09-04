import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDocumentTitle } from './useDocumentTitle'

function getMetaDescription() {
  return document
    .querySelector('meta[name="description"]')
    ?.getAttribute('content')
}

function Page({ title, description }: { title: string; description?: string }) {
  useDocumentTitle(title, description)
  return null
}

describe('useDocumentTitle', () => {
  it('sets document.title', () => {
    render(<Page title="Projects — Jacob Otero" />)
    expect(document.title).toBe('Projects — Jacob Otero')
  })

  it('sets the meta description when one is given', () => {
    render(
      <Page
        title="Projects — Jacob Otero"
        description="A showcase of Jacob Otero's work."
      />,
    )
    expect(getMetaDescription()).toBe("A showcase of Jacob Otero's work.")
  })

  it('leaves the existing meta description untouched when none is given', () => {
    const before = getMetaDescription()
    render(<Page title="Some title" />)
    expect(getMetaDescription()).toBe(before)
  })

  it('updates the meta description again when it changes', () => {
    const { rerender } = render(
      <Page title="A" description="First description." />,
    )
    expect(getMetaDescription()).toBe('First description.')

    rerender(<Page title="A" description="Second description." />)
    expect(getMetaDescription()).toBe('Second description.')
  })
})
