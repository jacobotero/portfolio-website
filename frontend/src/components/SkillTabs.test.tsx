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
})
