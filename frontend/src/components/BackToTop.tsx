import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

const SHOW_AFTER_PX = 400

export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: reduceMotion ? 'auto' : 'smooth',
        })
      }
      // bottom-24, not bottom-6: AssistantWidget's toggle button now
      // occupies bottom-6 right-6, so this stacks directly above it.
      className="fixed bottom-24 right-6 z-40 w-11 h-11 flex items-center justify-center rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors"
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
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}
