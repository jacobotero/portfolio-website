import { useState } from 'react'
import { useActiveSection } from '../hooks/useActiveSection'

const LINKS = [
  { href: '#about', id: 'about', label: 'about' },
  { href: '#experience', id: 'experience', label: 'experience' },
  { href: '#skills', id: 'skills', label: 'skills' },
  { href: '#projects', id: 'projects', label: 'projects' },
  { href: '#resume', id: 'resume', label: 'resume' },
  { href: '#contact', id: 'contact', label: 'contact' },
]

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const activeSection = useActiveSection()

  return (
    <header className="fixed top-4 inset-x-0 z-40 flex justify-center px-4">
      <nav className="relative flex items-center gap-1 pl-3 pr-2 py-2 rounded-full border border-border bg-bg/85 backdrop-blur-sm shadow-lg shadow-black/30 max-w-full">
        <a
          href="#top"
          aria-label="Back to top"
          className="flex items-center gap-1.5 px-2 shrink-0 group"
        >
          <span className="w-2 h-2 rounded-full bg-[#4b5263] group-hover:bg-red-400/70 transition-colors" />
          <span className="w-2 h-2 rounded-full bg-[#4b5263] group-hover:bg-yellow-400/70 transition-colors" />
          <span className="w-2 h-2 rounded-full bg-[#4b5263] group-hover:bg-accent/70 transition-colors" />
        </a>

        <ul className="hidden sm:flex items-center gap-1 text-sm">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`block px-3 py-1.5 rounded-full transition-colors ${
                  activeSection === link.id
                    ? 'bg-accent text-bg font-medium'
                    : 'text-text-dim hover:text-accent'
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden p-2 text-text-dim hover:text-accent transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        {menuOpen && (
          <ul
            id="mobile-nav-menu"
            className="sm:hidden absolute top-full mt-2 left-0 right-0 border border-border bg-bg rounded-2xl px-6 py-4 space-y-3 text-sm shadow-xl"
          >
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block transition-colors ${
                    activeSection === link.id ? 'text-accent' : 'text-text-dim hover:text-accent'
                  }`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  )
}
