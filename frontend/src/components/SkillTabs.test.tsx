import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SkillTabs, SKILL_GROUPS } from './SkillTabs'

describe('SkillTabs', () => {
  it('renders a button for every category', () => {
    render(<SkillTabs />)
    for (const group of SKILL_GROUPS) {
      expect(screen.getByRole('button', { name: group.label })).toBeInTheDocument()
    }
  })

  it('selects the first category by default', () => {
    render(<SkillTabs />)
    expect(
      screen.getByRole('button', { name: SKILL_GROUPS[0].label }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows the skills of the selected category', () => {
    render(<SkillTabs />)
    expect(screen.getByText(SKILL_GROUPS[0].skills[0].name)).toBeInTheDocument()
  })

  it('switches the visible skills when another category is chosen', async () => {
    const user = userEvent.setup()
    render(<SkillTabs />)

    await user.click(screen.getByRole('button', { name: SKILL_GROUPS[1].label }))

    // AnimatePresence mode="wait" keeps the outgoing panel mounted for its
    // exit transition, so the new panel's content lands asynchronously.
    expect(
      await screen.findByText(SKILL_GROUPS[1].skills[0].name),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: SKILL_GROUPS[1].label }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it("renders a skill's own viewBox when it has one, and the shared 24x24 one otherwise", () => {
    // Java and Python are both in Languages, the default tab, so both are
    // on screen without needing to switch category. Java's icon is sourced
    // from Material Symbols (native coordinate space 0 -960 960 960);
    // Python's is a simple-icons brand mark (0 0 24 24, via the default).
    // Rendering a Material Symbols path in a 24-unit box makes it an
    // invisible speck in one corner — checking the DATA's viewBox field
    // alone doesn't catch that; it has to be the DOM's actual attribute.
    render(<SkillTabs />)

    const pythonIcon = screen.getByText('Python').querySelector('svg')
    expect(pythonIcon).toHaveAttribute('viewBox', '0 0 24 24')

    const javaIcon = screen.getByText('Java').querySelector('svg')
    expect(javaIcon).toHaveAttribute('viewBox', '0 -960 960 960')
  })
})
