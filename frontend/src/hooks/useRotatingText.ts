import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

const TYPE_MS = 70
const DELETE_MS = 35
const HOLD_MS = 1800

/**
 * Types each phrase in, holds it, deletes it, and moves to the next —
 * cycling forever. Returns the currently visible substring.
 *
 * Under `prefers-reduced-motion: reduce`, a perpetually typing-and-deleting
 * line is exactly the continuous motion the preference asks to avoid, so the
 * cycle never starts: the hook settles on the first phrase, fully typed, and
 * stops there.
 */
export function useRotatingText(phrases: string[]): string {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [output, setOutput] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (phrases.length === 0 || reduceMotion) return

    const phrase = phrases[index % phrases.length]

    if (!deleting && output === phrase) {
      const hold = setTimeout(() => setDeleting(true), HOLD_MS)
      return () => clearTimeout(hold)
    }

    if (deleting && output === '') {
      setDeleting(false)
      setIndex((i) => (i + 1) % phrases.length)
      return
    }

    const timer = setTimeout(
      () => {
        setOutput((current) =>
          deleting
            ? phrase.slice(0, current.length - 1)
            : phrase.slice(0, current.length + 1),
        )
      },
      deleting ? DELETE_MS : TYPE_MS,
    )

    return () => clearTimeout(timer)
  }, [phrases, index, output, deleting, reduceMotion])

  if (reduceMotion) {
    return phrases[0] ?? ''
  }

  return output
}
