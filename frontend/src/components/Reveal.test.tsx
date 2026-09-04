import { render, screen } from '@testing-library/react'
import { hasReducedMotionListener, prefersReducedMotion } from 'motion-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { Reveal } from './Reveal'

/**
 * Forces `useReducedMotion()` (from `motion/react`) to resolve `true`.
 *
 * `useReducedMotion()` only reads `window.matchMedia` the *first* time it is
 * ever called in the whole process: internally it does
 * `!hasReducedMotionListener.current && initPrefersReducedMotion()`, and
 * `initPrefersReducedMotion()` sets `hasReducedMotionListener.current = true`
 * as its first act. Every later call — even with a different
 * `window.matchMedia` mock/stub freshly installed — skips the matchMedia
 * read entirely and just reads the cached `prefersReducedMotion.current`
 * value as its `useState` lazy-initial-value. That makes
 * `vi.stubGlobal('matchMedia', ...)` a no-op here once any earlier test in
 * this file has rendered a component that calls the hook (this file's own
 * first two tests do). Confirmed by mutation testing: with a
 * stubGlobal-only version of this helper, deleting `className` from
 * `Reveal`'s reduced-motion branch left every test in this file green,
 * because the branch was never actually reached.
 *
 * Setting these refs directly — exported by `motion-dom`, the package
 * `motion/react`'s `useReducedMotion` reads them from — is the reliable way
 * to force the branch in tests.
 */
function setPrefersReducedMotion(value: boolean) {
  hasReducedMotionListener.current = true
  prefersReducedMotion.current = value
}

describe('Reveal', () => {
  afterEach(() => {
    setPrefersReducedMotion(false)
  })

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

  it('still renders its children when reduced motion is preferred', () => {
    setPrefersReducedMotion(true)
    render(
      <Reveal>
        <p>visible content</p>
      </Reveal>,
    )
    // Not stranded at opacity 0 for a reduced-motion visitor: the content
    // must actually be present in the DOM.
    expect(screen.getByText('visible content')).toBeInTheDocument()
  })

  it('still passes through a className when reduced motion is preferred, via the plain-div branch', () => {
    setPrefersReducedMotion(true)
    const { container } = render(
      <Reveal className="custom-class">
        <p>content</p>
      </Reveal>,
    )
    const el = container.querySelector('.custom-class')
    expect(el).not.toBeNull()
    // Prove the plain-<div> early-return branch is what actually rendered,
    // not that a motion.div coincidentally also carries the class: a
    // motion.div always stamps an inline `style` for its `initial` state
    // (opacity/transform) even before any animation runs, while the plain
    // `<div>` in Reveal's reduced-motion branch never gets a style attribute.
    expect(el).not.toHaveAttribute('style')
  })

  it('does not leak the reduced-motion override into a later render', () => {
    // `afterEach` above already restored the preference to false before this
    // test started; assert the effect explicitly so a regression in the
    // restore itself (or in matchMedia stubbing generally) is caught here.
    const { container } = render(
      <Reveal className="leak-check">
        <p>leak check</p>
      </Reveal>,
    )
    expect(container.querySelector('.leak-check')).toHaveAttribute('style')
  })
})
