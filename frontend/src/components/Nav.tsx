import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link, NavLink, useLocation } from 'react-router'
import { ThemeToggle } from './ThemeToggle'

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Experience', to: '/experience' },
  { label: 'Contact', to: '/contact' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const { pathname } = useLocation()

  return (
    <header className="fixed top-4 inset-x-0 z-40 px-4">
      <nav className="mx-auto max-w-4xl rounded-full border border-border bg-bg-raised/80 backdrop-blur-md px-4 sm:px-5 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="font-display font-bold text-heading tracking-tight hover:text-accent transition-colors"
        >
          Jacob Otero
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active =
              link.to === '/' ? pathname === '/' : pathname.startsWith(link.to)
            return (
              <li key={link.to} className="relative">
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={`relative z-10 block px-3.5 py-1.5 text-sm rounded-full transition-colors ${
                    active
                      ? 'text-heading'
                      : 'text-text-dim hover:text-heading'
                  }`}
                >
                  {link.label}
                </NavLink>
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-bg-elevated"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 350, damping: 30 }
                    }
                  />
                )}
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-text-dim hover:text-accent hover:bg-bg-elevated transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              {open ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden mx-auto max-w-4xl mt-2 rounded-2xl border border-border bg-bg-raised/95 backdrop-blur-md p-2"
          >
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 text-sm rounded-xl transition-colors ${
                      isActive
                        ? 'text-heading bg-bg-elevated'
                        : 'text-text-dim hover:text-heading hover:bg-bg-elevated'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}
