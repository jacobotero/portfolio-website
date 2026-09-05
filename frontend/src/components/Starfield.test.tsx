import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { hasReducedMotionListener, prefersReducedMotion } from 'motion-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../context/ThemeProvider'
import { createStars, Starfield } from './Starfield'
import { ThemeToggle } from './ThemeToggle'

/**
 * `test/setup.ts` stubs `getContext` to always return null so components
 * tolerate jsdom's lack of a real canvas. Guards 2 and 3 (and the
 * IntersectionObserver-undefined tolerance) only run their guarded code when
 * a context exists, so tests that exercise them need a real-enough fake to
 * actually reach that code — otherwise the assertion holds for the wrong
 * reason (no context) rather than the right one (the guard itself).
 */
function mockCanvasContext() {
  // fillStyle is tracked as a history, not just a last-value snapshot, so
  // tests can tell which theme's color was in effect at each individual
  // draw call rather than only at the end.
  const fillStyleHistory: string[] = []
  const ctx = {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    setTransform: vi.fn(),
    // Used only by the shooting star, which draws a gradient-stroked line
    // rather than an arc.
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillStyleHistory,
    get fillStyle() {
      return fillStyleHistory.at(-1) ?? ''
    },
    set fillStyle(value: string) {
      fillStyleHistory.push(value)
    },
    strokeStyle: '' as unknown,
    lineWidth: 0,
    lineCap: '' as CanvasLineCap,
  }
  // `HTMLCanvasElement.prototype.getContext` is already a `vi.fn()` from
  // test/setup.ts (a direct property assignment, not a spy), so
  // `vi.spyOn(...)` on it returns that same mock reference rather than a
  // restorable wrapper — `vi.restoreAllMocks()` in afterEach has nothing to
  // undo and the fake context leaks into later tests. Reassigning the
  // null-returning stub explicitly in afterEach (below) fixes it, the same
  // way the `matchMedia` leak was fixed.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  )
  return ctx
}

/**
 * Stands in for the real `--c-star` cascade (`:root` for dark, `[data-theme
 * ="light"]` for light — see index.css), which jsdom never actually applies
 * since no stylesheet is loaded in tests. Reads `data-theme` off
 * `document.documentElement` *live*, on every call, exactly like a real
 * browser's computed style would — so a test can tell whether Starfield's
 * effect read the DOM attribute before or after ThemeProvider wrote it.
 */
function mockThemeAwareComputedStyle() {
  const TRIPLETS = { dark: '255, 255, 255', light: '90, 80, 120' } as const
  const original = window.getComputedStyle.bind(window)
  vi.spyOn(window, 'getComputedStyle').mockImplementation((el, ...rest) => {
    if (el !== document.documentElement) return original(el, ...rest)
    const isLight = document.documentElement.getAttribute('data-theme') === 'light'
    return {
      getPropertyValue: (prop: string) =>
        prop === '--c-star' ? TRIPLETS[isLight ? 'light' : 'dark'] : '',
    } as CSSStyleDeclaration
  })
}

/**
 * jsdom's `getBoundingClientRect` always returns a zero-size rect, which
 * makes `resize()` bail out before ever drawing (by design — a 0×0 canvas
 * has nothing to draw). Tests that need `resize()` to actually run its draw
 * path need a non-zero rect.
 */
function mockCanvasSize(width: number, height: number) {
  vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue(
    {
      width,
      height,
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      x: 0,
      y: 0,
      toJSON() {},
    } as DOMRect,
  )
}

/** A controllable IntersectionObserver stub that lets a test fire
 * isIntersecting transitions on demand instead of relying on real scrolling. */
function mockIntersectionObserver() {
  let callback: IntersectionObserverCallback = () => {}
  const observe = vi.fn()
  const disconnect = vi.fn()
  class FakeIntersectionObserver {
    constructor(cb: IntersectionObserverCallback) {
      callback = cb
    }
    observe = observe
    disconnect = disconnect
    unobserve = vi.fn()
    takeRecords = () => []
  }
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
  return {
    observe,
    disconnect,
    fire(isIntersecting: boolean) {
      callback(
        [{ isIntersecting } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    },
  }
}

/**
 * Forces `useReducedMotion()` (from `motion/react`) to resolve a given value.
 *
 * `useReducedMotion()` only reads `window.matchMedia` the *first* time it is
 * ever called in the whole process, then caches the result at module level —
 * see `Reveal.test.tsx` for the full explanation. `vi.stubGlobal('matchMedia',
 * ...)` is a no-op once any earlier test in the run has rendered a component
 * that calls the hook. Setting these refs directly (exported by `motion-dom`,
 * which `motion/react` reads them from) is the reliable way to force it.
 */
function setPrefersReducedMotion(value: boolean) {
  hasReducedMotionListener.current = true
  prefersReducedMotion.current = value
}

/**
 * Replaces requestAnimationFrame with a manual driver so a test can step the
 * loop to chosen timestamps rather than waiting on real frames. Returns a
 * `tick(time)` that runs whichever callback is currently pending; the loop
 * re-registers itself on each frame, so repeated ticks keep it going.
 */
function captureFrameDriver() {
  let pending: FrameRequestCallback | null = null
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    pending = cb
    return 1
  })
  return function tick(time: number) {
    const cb = pending
    pending = null
    cb?.(time)
  }
}

/** Every (x, y) a frame passed to ctx.arc(), rounded, for comparison. */
function positionsFrom(ctx: { arc: ReturnType<typeof vi.fn> }) {
  return ctx.arc.mock.calls.map(
    (call: unknown[]) =>
      `${Math.round(call[0] as number)},${Math.round(call[1] as number)}`,
  )
}

// Starfield reads the theme via useTheme(), which throws without a
// ThemeProvider ancestor.
function renderStarfield() {
  return render(
    <ThemeProvider>
      <Starfield />
    </ThemeProvider>,
  )
}

describe('Starfield', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    setPrefersReducedMotion(false)
    // vi.restoreAllMocks() doesn't undo mockCanvasContext()'s override (see
    // the comment on mockCanvasContext) — explicitly put the null-returning
    // stub from test/setup.ts back so later tests get a clean null context.
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never
  })

  it('renders without throwing when the 2D context is unavailable', () => {
    expect(() => renderStarfield()).not.toThrow()
  })

  it('starts no animation frame loop when reduced motion is preferred', () => {
    mockCanvasContext()
    setPrefersReducedMotion(true)
    const raf = vi.spyOn(window, 'requestAnimationFrame')

    renderStarfield()

    expect(raf).not.toHaveBeenCalled()
  })

  it('renders when IntersectionObserver is unavailable', () => {
    mockCanvasContext()
    const original = globalThis.IntersectionObserver
    // @ts-expect-error deliberately removing the global for this case
    delete globalThis.IntersectionObserver
    expect(() => renderStarfield()).not.toThrow()
    globalThis.IntersectionObserver = original
  })

  it('cleans up its listeners on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderStarfield()
    unmount()
    expect(remove).toHaveBeenCalled()
  })

  it('pauses the loop when scrolled out of view and resumes when back in view', () => {
    mockCanvasContext()
    const io = mockIntersectionObserver()
    const raf = vi.spyOn(window, 'requestAnimationFrame')
    const caf = vi.spyOn(window, 'cancelAnimationFrame')

    renderStarfield()
    expect(raf).toHaveBeenCalledTimes(1) // initial mount starts the loop

    io.fire(false) // scrolled out of view
    expect(caf).toHaveBeenCalledTimes(1)

    const callsBeforeResume = raf.mock.calls.length
    io.fire(true) // scrolled back into view
    expect(raf.mock.calls.length).toBeGreaterThan(callsBeforeResume)
  })

  it('does not resume the loop on tab focus while scrolled out of view', () => {
    mockCanvasContext()
    const io = mockIntersectionObserver()
    const raf = vi.spyOn(window, 'requestAnimationFrame')

    renderStarfield()
    io.fire(false) // scrolled out of view; the observer stops the loop

    const callsBeforeVisibilityChange = raf.mock.calls.length

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    })
    document.dispatchEvent(new Event('visibilitychange')) // tab backgrounded

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    })
    document.dispatchEvent(new Event('visibilitychange')) // tab refocused, still off-screen

    expect(raf.mock.calls.length).toBe(callsBeforeVisibilityChange)
  })

  it('redraws on resize under reduced motion instead of leaving the canvas blank', () => {
    const ctx = mockCanvasContext()
    mockCanvasSize(300, 300)
    setPrefersReducedMotion(true)

    renderStarfield()
    const clearsAfterMount = ctx.clearRect.mock.calls.length
    expect(clearsAfterMount).toBeGreaterThan(0) // the one static frame at mount

    window.dispatchEvent(new Event('resize'))

    // A second draw happened — canvas.width/height being reassigned in
    // resize() clears the bitmap, and under reduced motion there is no rAF
    // loop to repaint it on the next frame, so resize() must draw directly.
    expect(ctx.clearRect.mock.calls.length).toBeGreaterThan(clearsAfterMount)
    // And it actually painted stars, not just cleared the canvas.
    expect(ctx.arc.mock.calls.length).toBeGreaterThan(0)
  })

  it('tears down and re-registers its listeners without leaking when the theme changes', async () => {
    mockCanvasContext()
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <ThemeToggle />
        <Starfield />
      </ThemeProvider>,
    )
    const addCallsAfterMount = add.mock.calls.length

    await user.click(screen.getByRole('button', { name: /theme/i }))

    // The effect's dependency array now includes `theme`, so toggling tears
    // the whole effect down and re-runs it. Every listener added on mount
    // must be removed once, and the re-run adds its own fresh set — no net
    // accumulation of duplicate listeners across the toggle.
    expect(remove.mock.calls.length).toBeGreaterThanOrEqual(addCallsAfterMount)
    expect(add.mock.calls.length).toBeGreaterThan(addCallsAfterMount)
  })

  // Regression test for FIX A: ThemeProvider set `data-theme` from a plain
  // `useEffect`. Passive effects flush child-first, so this descendant's
  // effect could run and read the *previous* theme's data-theme value —
  // toggling dark -> light would draw with the dark triplet, silently
  // painting near-white stars on the light background. ThemeProvider now
  // writes `data-theme` from a `useLayoutEffect`, which React guarantees
  // flushes (tree-wide) before any passive effect runs, so by the time
  // Starfield's effect reads it, it already holds the *new* theme.
  it('draws with the new theme\'s star color immediately after a toggle, not the stale one', async () => {
    const ctx = mockCanvasContext()
    mockCanvasSize(300, 300)
    mockThemeAwareComputedStyle()
    setPrefersReducedMotion(true) // one synchronous draw per effect run, no rAF needed
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <ThemeToggle />
        <Starfield />
      </ThemeProvider>,
    )

    // Checking "some" draw rather than only the *last* one: stars now carry
    // a random warm/cool tint (~20% of them), which offsets their triplet
    // away from the pure base color — pinning this on whichever star happens
    // to be drawn last would make the assertion flaky. With ~20 stars at
    // this canvas size, at least one untinted draw is a near-certainty.
    const initialFills = [...ctx.fillStyleHistory]
    expect(initialFills.some((f) => f.includes('255, 255, 255'))).toBe(true) // dark is the initial theme

    await user.click(screen.getByRole('button', { name: /theme/i })) // dark -> light

    const fillsAfterToggle = ctx.fillStyleHistory.slice(initialFills.length)
    expect(fillsAfterToggle.some((f) => f.includes('90, 80, 120'))).toBe(true) // light's triplet, not dark's
    expect(fillsAfterToggle.some((f) => f.includes('255, 255, 255'))).toBe(false)
  })

  it('rotates the field, so star positions move over time', () => {
    // Pin Math.random so every star is generated identically. Without this
    // the assertion passes for the wrong reason: stars whose twinkle dips
    // under the skip threshold aren't drawn at all, so the set of arc() calls
    // differs frame to frame even with rotation switched off entirely.
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ctx = mockCanvasContext()
    mockCanvasSize(1200, 800)
    const tick = captureFrameDriver()

    renderStarfield()

    // resize() paints one frame directly before the loop starts, so clear
    // first or this frame's positions get concatenated with that one.
    ctx.arc.mockClear()
    tick(1_000)
    const firstFrame = positionsFrom(ctx)

    ctx.arc.mockClear()
    // 60s into a 240s revolution, i.e. a quarter turn.
    tick(61_000)
    const laterFrame = positionsFrom(ctx)

    expect(firstFrame.length).toBeGreaterThan(0)
    expect(laterFrame).toHaveLength(firstFrame.length)
    expect(laterFrame).not.toEqual(firstFrame)
  })

  it('completes a full twinkle cycle within a few seconds', () => {
    // Pinned so the star's twinkle period is deterministic: speed becomes
    // 1.05 + 0.5 * 2.09 = 2.095 rad/s, a ~3.0s cycle.
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ctx = mockCanvasContext()
    mockCanvasSize(1200, 800)
    const tick = captureFrameDriver()

    renderStarfield()

    for (let time = 0; time <= 3_000; time += 200) {
      tick(time)
    }

    const alphas = ctx.fillStyleHistory
      .map((fill) => Number(fill.match(/,\s*([\d.]+)\)$/)?.[1] ?? NaN))
      .filter((alpha) => Number.isFinite(alpha))

    expect(alphas.length).toBeGreaterThan(0)
    // A full cycle inside the 3s window sweeps the star's entire range. The
    // previous formula's speed (0.4 + rand*0.8, a 5-16s period) could only
    // traverse part of its range in 3s, which is exactly why the field read
    // as motionless. This range check is what separates the two.
    const swing = Math.max(...alphas) - Math.min(...alphas)
    expect(swing).toBeGreaterThan(0.25)
  })

  it('generates stars across multiple depth layers, not one flat spread', () => {
    // A large canvas gives a big enough sample that all three layers
    // (far/mid/near) are essentially guaranteed to appear.
    const stars = createStars(1200, 800)

    expect(stars.length).toBeGreaterThan(0)
    const depths = stars.map((s) => s.depth)
    // Far layer tops out at 0.22, near layer starts at 0.62 — a real spread
    // across layers must clear both sides of that gap. A single flat
    // Math.random() spread (the old behaviour) would too, so this is
    // necessary but not sufficient; it at least catches a regression to "no
    // depth variation at all" (e.g. every star clustered in one band).
    expect(Math.min(...depths)).toBeLessThan(0.3)
    expect(Math.max(...depths)).toBeGreaterThan(0.6)

    // Near-layer stars (by construction, the ones with the highest depth)
    // should read as closer: bigger and brighter on average than far-layer
    // stars (lowest depth), not just differently positioned.
    const sorted = [...stars].sort((a, b) => a.depth - b.depth)
    const farSlice = sorted.slice(0, Math.floor(sorted.length * 0.3))
    const nearSlice = sorted.slice(-Math.floor(sorted.length * 0.3))
    const avg = (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length
    expect(avg(nearSlice.map((s) => s.size))).toBeGreaterThan(
      avg(farSlice.map((s) => s.size)),
    )
    expect(avg(nearSlice.map((s) => s.alpha))).toBeGreaterThan(
      avg(farSlice.map((s) => s.alpha)),
    )
  })

  it('gives a minority of stars a warm or cool tint rather than leaving the field flat', () => {
    const stars = createStars(1200, 800)
    const tints = new Set(stars.map((s) => s.tint))

    // With ~228 stars at this size and a ~20% combined warm/cool rate,
    // landing on all 'none' is astronomically unlikely — this isn't a coin
    // flip a rare unlucky run could fail.
    expect(tints.has('warm') || tints.has('cool')).toBe(true)
    expect(tints.has('none')).toBe(true) // still mostly untinted, not a rainbow
  })

  it('never lets a star\'s twinkle dim it all the way to zero alpha', () => {
    // twinkleDepth capped below 1 per layer means peak dimness is
    // alpha * (1 - twinkleDepth), never zero — the earlier design's brief
    // (raise the visibility floor) so the field doesn't look sparser than
    // its real count at the trough of every star's cycle.
    const stars = createStars(1200, 800)
    for (const star of stars) {
      const dimmest = star.alpha * (1 - star.twinkleDepth)
      expect(dimmest).toBeGreaterThan(0.05)
    }
  })

  it('gravitates stars toward a nearby cursor and relaxes them back when it leaves', () => {
    // Pins every star to the same base angle/radius — see the depth-layers
    // test above for why that's still useful: layers still diverge on depth,
    // which is what the pull strength scales with. The near layer (pushed
    // last by createStars) reacts most, so it gives the clearest signal.
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ctx = mockCanvasContext()
    mockCanvasSize(1200, 800)
    const tick = captureFrameDriver()

    renderStarfield()
    ctx.arc.mockClear()
    tick(0)
    const [baseX] = positionsFrom(ctx).at(-1)!.split(',').map(Number)

    // Cursor lands 60px to the right of the star — inside CURSOR_PULL_RADIUS
    // (170px) so it should visibly pull, with an unambiguous direction.
    window.dispatchEvent(
      new MouseEvent('mousemove', { clientX: baseX + 60, clientY: 400 }),
    )

    let pulledX = baseX
    for (let t = 16; t <= 400; t += 16) {
      ctx.arc.mockClear()
      tick(t)
      ;[pulledX] = positionsFrom(ctx).at(-1)!.split(',').map(Number)
    }
    expect(pulledX).toBeGreaterThan(baseX + 8)

    document.dispatchEvent(new Event('mouseleave'))

    let relaxedX = pulledX
    for (let t = 416; t <= 1200; t += 16) {
      ctx.arc.mockClear()
      tick(t)
      ;[relaxedX] = positionsFrom(ctx).at(-1)!.split(',').map(Number)
    }
    // Relaxes back most of the way toward its un-pulled position rather than
    // staying stuck where the cursor left it.
    expect(Math.abs(relaxedX - baseX)).toBeLessThan(
      Math.abs(pulledX - baseX) * 0.5,
    )
  })

  it('does not meaningfully pull stars once the cursor is farther than the pull radius', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const ctx = mockCanvasContext()
    mockCanvasSize(1200, 800)
    const tick = captureFrameDriver()

    renderStarfield()
    ctx.arc.mockClear()
    tick(0)
    const [baseX] = positionsFrom(ctx).at(-1)!.split(',').map(Number)

    // 400px away is well outside the 170px pull radius. Note: moving the
    // pointer at all still nudges position slightly via the pre-existing
    // whole-field parallax (independent of the pull radius) — this asserts
    // the pull specifically stayed off, not that nothing moved a single px.
    window.dispatchEvent(
      new MouseEvent('mousemove', { clientX: baseX + 400, clientY: 400 }),
    )

    let laterX = baseX
    for (let t = 16; t <= 200; t += 16) {
      ctx.arc.mockClear()
      tick(t)
      ;[laterX] = positionsFrom(ctx).at(-1)!.split(',').map(Number)
    }

    // Parallax alone tops out around 3px over this window; a real pull would
    // clear 8+ (see the test above), so this margin cleanly distinguishes
    // "pull didn't engage" from "pull engaged."
    expect(Math.abs(laterX - baseX)).toBeLessThan(6)
  })

  it('sends a shooting star across after the spawn gap elapses', () => {
    const ctx = mockCanvasContext()
    mockCanvasSize(1200, 800)
    const tick = captureFrameDriver()

    renderStarfield()

    // The first frame only schedules the next spawn; it never spawns on it.
    tick(0)
    expect(ctx.stroke).not.toHaveBeenCalled()

    // Well past the 8-15s spawn window.
    tick(20_000)
    expect(ctx.stroke).toHaveBeenCalled()
    expect(ctx.createLinearGradient).toHaveBeenCalled()
  })

  it('draws no shooting star under reduced motion', () => {
    const ctx = mockCanvasContext()
    mockCanvasSize(1200, 800)
    setPrefersReducedMotion(true)
    const tick = captureFrameDriver()

    renderStarfield()
    tick(20_000)

    expect(ctx.stroke).not.toHaveBeenCalled()
  })
})
