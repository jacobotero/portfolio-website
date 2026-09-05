import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { hasReducedMotionListener, prefersReducedMotion } from 'motion-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// See Reveal.test.tsx for why setting these refs directly is required —
// useReducedMotion() caches its matchMedia read at module level, so a plain
// vi.stubGlobal('matchMedia', ...) is a no-op after any earlier render.
function setPrefersReducedMotion(value: boolean) {
  hasReducedMotionListener.current = true
  prefersReducedMotion.current = value
}

/**
 * AssistantWidget reads `import.meta.env.VITE_ASSISTANT_API_URL` into a
 * module-level constant at import time — the same pattern ContactPage uses.
 * `vi.stubEnv` in `beforeEach` runs too late to affect an already-imported
 * module, so each test that needs a specific value re-imports the module
 * fresh (paired with `vi.resetModules()`) rather than relying on a static
 * top-level import.
 */
async function renderWidget() {
  const { AssistantWidget } = await import('./AssistantWidget')
  return render(<AssistantWidget />)
}

function mockFetchOnce(response: { answer: string } | null, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    json: async () => response,
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('AssistantWidget', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_ASSISTANT_API_URL', 'https://api.example.com/assistant')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    setPrefersReducedMotion(false)
  })

  it('is closed by default, with an accessible toggle button', async () => {
    await renderWidget()
    expect(
      screen.getByRole('button', { name: /ask an ai assistant/i }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the panel and shows a greeting when the toggle is clicked', async () => {
    const user = userEvent.setup()
    await renderWidget()

    await user.click(screen.getByRole('button', { name: /ask an ai assistant/i }))

    expect(screen.getByRole('dialog', { name: /ask about jacob/i })).toBeInTheDocument()
    expect(screen.getByText(/ask me about his experience/i)).toBeInTheDocument()
  })

  it('closes the panel on Escape', async () => {
    const user = userEvent.setup()
    await renderWidget()
    await user.click(screen.getByRole('button', { name: /ask an ai assistant/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    // AnimatePresence keeps the element mounted for its exit transition
    // rather than removing it the instant state changes.
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('sends a question and displays the answer', async () => {
    const fetchMock = mockFetchOnce({ answer: 'He built DonorTrack.' })
    const user = userEvent.setup()
    await renderWidget()

    await user.click(screen.getByRole('button', { name: /ask an ai assistant/i }))
    await user.type(screen.getByLabelText(/your question/i), 'What has he built?')
    await user.click(screen.getByRole('button', { name: /send question/i }))

    expect(screen.getByText('What has he built?')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('He built DonorTrack.')).toBeInTheDocument()
    })

    const [, requestInit] = fetchMock.mock.calls[0]
    const body = JSON.parse(requestInit.body)
    expect(body.messages.at(-1)).toEqual({
      role: 'user',
      text: 'What has he built?',
    })
  })

  it('includes prior turns in the request, mapped to the API contract', async () => {
    const fetchMock = mockFetchOnce({ answer: 'Yes, three co-ops.' })
    const user = userEvent.setup()
    await renderWidget()

    await user.click(screen.getByRole('button', { name: /ask an ai assistant/i }))
    await user.type(screen.getByLabelText(/your question/i), 'Has he interned?')
    await user.click(screen.getByRole('button', { name: /send question/i }))
    await waitFor(() => expect(screen.getByText('Yes, three co-ops.')).toBeInTheDocument())

    await user.type(screen.getByLabelText(/your question/i), 'Where?')
    await user.click(screen.getByRole('button', { name: /send question/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    const secondCallBody = JSON.parse(fetchMock.mock.calls[1][1].body)
    // Greeting is not sent — it's local UI copy, not part of the conversation.
    expect(secondCallBody.messages).toEqual([
      { role: 'user', text: 'Has he interned?' },
      { role: 'assistant', text: 'Yes, three co-ops.' },
      { role: 'user', text: 'Where?' },
    ])
  })

  it('shows an error message and does not lose the typed question on failure', async () => {
    mockFetchOnce(null, false)
    const user = userEvent.setup()
    await renderWidget()

    await user.click(screen.getByRole('button', { name: /ask an ai assistant/i }))
    await user.type(screen.getByLabelText(/your question/i), 'test question')
    await user.click(screen.getByRole('button', { name: /send question/i }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/didn't go through/i)
    })
    // The question itself still appears as a sent user turn.
    expect(screen.getByText('test question')).toBeInTheDocument()
  })

  it('shows a not-configured error and never calls fetch when the API URL is unset', async () => {
    vi.stubEnv('VITE_ASSISTANT_API_URL', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    await renderWidget()

    await user.click(screen.getByRole('button', { name: /ask an ai assistant/i }))
    await user.type(screen.getByLabelText(/your question/i), 'test question')
    await user.click(screen.getByRole('button', { name: /send question/i }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/not configured/i)
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not submit a blank question', async () => {
    const fetchMock = mockFetchOnce({ answer: 'irrelevant' })
    const user = userEvent.setup()
    await renderWidget()

    await user.click(screen.getByRole('button', { name: /ask an ai assistant/i }))
    expect(screen.getByRole('button', { name: /send question/i })).toBeDisabled()

    await user.type(screen.getByLabelText(/your question/i), '   ')
    await user.click(screen.getByRole('button', { name: /send question/i }))

    expect(fetchMock).not.toHaveBeenCalled()
  })

  // A style-based "is it mid-animation" assertion was tried here and
  // dropped: jsdom's requestAnimationFrame runs on real wall-clock time via
  // setTimeout, so how far the tween has progressed by the time a
  // synchronous assertion runs depends on ambient test-runner timing, not on
  // `reduceMotion` — confirmed by mutation testing both branches away
  // without the assertion ever going red. Nav.test.tsx's structurally
  // identical dropdown doesn't attempt this either. The panel's
  // `initial`/`transition` branching matches that already-reviewed pattern
  // exactly; what's left reliably testable is that the reduced-motion path
  // doesn't crash and content stays reachable.
  it('still opens and shows content when reduced motion is preferred', async () => {
    setPrefersReducedMotion(true)
    const user = userEvent.setup()
    await renderWidget()

    await user.click(screen.getByRole('button', { name: /ask an ai assistant/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/ask me about his experience/i)).toBeInTheDocument()
  })
})
