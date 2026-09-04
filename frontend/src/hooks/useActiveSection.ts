import { useEffect, useState } from 'react'

const SECTION_IDS = [
  'top',
  'about',
  'experience',
  'skills',
  'projects',
  'resume',
  'contact',
]

/** Tracks which section is currently centered in the viewport, for nav highlighting. */
export function useActiveSection() {
  const [active, setActive] = useState('top')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (mostVisible) {
          setActive(mostVisible.target.id)
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    for (const id of SECTION_IDS) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  return active
}
