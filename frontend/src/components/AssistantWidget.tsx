import { type FormEvent, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

interface Message {
  role: 'user' | 'assistant'
  text: string
}

type Status = 'idle' | 'sending' | 'error'

const API_URL = import.meta.env.VITE_ASSISTANT_API_URL as string | undefined
const MAX_MESSAGE_LENGTH = 500
// Keeps the request small and bounds Gemini's per-call cost; the server
// enforces the same limit independently, so a tampered client can't exceed it.
const MAX_HISTORY = 20

// Rendered as the first bubble but deliberately kept out of `messages`
// state: it's static UI copy, not something Gemini ever said, so it must
// never be sent back to the API as if it were a real assistant turn.
const GREETING = "Hi, I'm an AI assistant trained on Jacob's background. Ask me about his experience, skills, or projects."

export function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const reduceMotion = useReducedMotion()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, status])

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const question = input.trim()
    if (!question) return
    if (question.length > MAX_MESSAGE_LENGTH) {
      setError('that question is a bit long — try trimming it')
      setStatus('error')
      return
    }
    if (!API_URL) {
      setError('assistant is not configured yet')
      setStatus('error')
      return
    }

    const nextMessages = [...messages, { role: 'user', text: question } as Message].slice(
      -MAX_HISTORY,
    )
    setMessages(nextMessages)
    setInput('')
    setStatus('sending')

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      })
      if (!res.ok) throw new Error('request failed')
      const data = (await res.json()) as { answer: string }
      setMessages((current) =>
        [...current, { role: 'assistant', text: data.answer } as Message].slice(
          -MAX_HISTORY,
        ),
      )
      setStatus('idle')
    } catch {
      setError("that didn't go through. Try again in a moment")
      setStatus('error')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close AI assistant' : 'Ask an AI assistant about Jacob'}
        // transition-all (not transition-colors) so the glow and scale below
        // animate in too, not just the background color. The 300ms duration
        // and the hover states themselves collapse to near-instant under
        // prefers-reduced-motion via the global rule in index.css, so no
        // extra reduced-motion handling is needed for a plain CSS hover.
        className="fixed bottom-6 right-6 z-40 w-14 h-14 flex items-center justify-center rounded-full bg-accent text-accent-contrast shadow-lg hover:bg-accent-strong hover:shadow-[0_0_32px_8px_var(--c-glow)] hover:scale-105 transition-all duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
          aria-hidden="true"
        >
          {open ? (
            <path d="M18 6 6 18M6 6l12 12" />
          ) : (
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          )}
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Ask about Jacob"
            initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
            // bottom-40, not bottom-24: both share right-6, and BackToTop
            // occupies bottom-24 through ~bottom-35 (96-140px from the
            // bottom edge) once it's visible. At bottom-24 the panel's own
            // corner sat exactly on top of that button — most visible on
            // mobile, where the panel is nearly full width. bottom-40
            // (160px) clears it with a 20px margin.
            className="fixed bottom-40 right-6 z-40 w-[calc(100vw-3rem)] max-w-sm rounded-2xl border border-border bg-bg-raised shadow-2xl flex flex-col overflow-hidden"
            // Reduced from 28rem/70vh now that the panel sits 64px higher
            // (bottom-40 instead of bottom-24): with the old, taller budget,
            // a short mobile viewport (browser chrome visible, no keyboard)
            // could push the panel's top edge up under the nav pill.
            style={{ height: 'min(26rem, 60vh)' }}
          >
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-display font-medium text-heading">
                Ask about Jacob
              </p>
              <p className="text-xs text-text-dim">AI-generated, may be imperfect</p>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              <div className="bg-bg-elevated text-text text-sm rounded-xl px-3 py-2 max-w-[85%]">
                {GREETING}
              </div>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`text-sm rounded-xl px-3 py-2 max-w-[85%] ${
                    msg.role === 'user'
                      ? 'ml-auto bg-accent text-accent-contrast'
                      : 'bg-bg-elevated text-text'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {status === 'sending' && (
                <div className="bg-bg-elevated text-text-dim text-sm rounded-xl px-3 py-2 max-w-[85%]">
                  Thinking…
                </div>
              )}
              {/* Always present so the live region exists before text lands
                  in it — see the same pattern on the contact form. */}
              <div role="status" aria-live="polite">
                {status === 'error' && (
                  <p className="text-sm text-danger">✗ {error}</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-border flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What's he built?"
                maxLength={MAX_MESSAGE_LENGTH}
                aria-label="Your question"
                className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'sending' || !input.trim()}
                aria-label="Send question"
                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors disabled:opacity-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
