import { act, renderHook } from '@testing-library/react'
import { hasReducedMotionListener, prefersReducedMotion } from 'motion-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRotatingText } from './useRotatingText'

/**
 * Forces `useReducedMotion()` (from `motion/react`) to resolve a given value.
 * See `Reveal.test.tsx` for why `vi.stubGlobal('matchMedia', ...)` doesn't
 * work here: the hook caches its `matchMedia` read at module level after the
 * first call in the process, so later stubs are ignored. Setting these refs
 * directly (exported by `motion-dom`, which `motion/react` reads them from)
 * is the reliable way to force the branch in tests.
 */
function setPrefersReducedMotion(value: boolean) {
  hasReducedMotionListener.current = true
  prefersReducedMotion.current = value
}

/**
 * Advances the fake clock in small steps rather than one big jump.
 *
 * `useRotatingText` schedules its next `setTimeout` from inside the effect
 * that a previous timer's `setState` triggers. With React 19's batched,
 * microtask-scheduled effect flush, a single
 * `act(() => vi.advanceTimersByTime(2000))` only fires the *first* queued
 * timer — the follow-up timer that the resulting re-render schedules isn't
 * queued yet when the fake clock races through the rest of the 2000ms, so
 * the cascade stalls after one character. Advancing (and letting `act` flush
 * effects) in small steps gives each re-render a chance to schedule its own
 * next timer before the clock moves further.
 */
function advanceTime(totalMs: number, stepMs = 25) {
  let remaining = totalMs
  while (remaining > 0) {
    const step = Math.min(stepMs, remaining)
    act(() => {
      vi.advanceTimersByTime(step)
    })
    remaining -= step
  }
}

describe('useRotatingText', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    setPrefersReducedMotion(false)
  })

  it('starts empty and types the first phrase in', () => {
    const { result } = renderHook(() => useRotatingText(['abc', 'xyz']))
    expect(result.current).toBe('')

    advanceTime(500)
    expect('abc').toContain(result.current)
    expect(result.current.length).toBeGreaterThan(0)
  })

  it('eventually reaches the full first phrase', () => {
    const { result } = renderHook(() => useRotatingText(['abc', 'xyz']))
    advanceTime(2000)
    expect(result.current).toBe('abc')
  })

  it('returns an empty string for an empty phrase list', () => {
    const { result } = renderHook(() => useRotatingText([]))
    advanceTime(2000)
    expect(result.current).toBe('')
  })

  it('cycles into the second phrase given enough time', () => {
    const { result } = renderHook(() => useRotatingText(['abc', 'xyz']))
    // type 'abc' (~210ms) + hold (1800ms) + delete 'abc' (~105ms) + a bit of
    // typing 'xyz' back in.
    advanceTime(2300)
    expect(result.current).not.toBe('abc')
    expect('xyz').toContain(result.current)
    expect(result.current.length).toBeGreaterThan(0)
  })

  it('under reduced motion, settles on the first phrase and does not cycle', () => {
    setPrefersReducedMotion(true)
    const { result } = renderHook(() => useRotatingText(['abc', 'xyz']))

    expect(result.current).toBe('abc')

    // Advance well past a full type + hold + delete + retype cycle; it must
    // still be sitting on the first phrase, untouched.
    advanceTime(10000)
    expect(result.current).toBe('abc')
  })

  it('under reduced motion with no phrases, returns an empty string', () => {
    setPrefersReducedMotion(true)
    const { result } = renderHook(() => useRotatingText([]))
    advanceTime(1000)
    expect(result.current).toBe('')
  })
})
