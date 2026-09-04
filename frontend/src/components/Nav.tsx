import { useState } from 'react'

const LINKS = [
  { href: '#about', label: 'about' },
  { href: '#experience', label: 'experience' },
  { href: '#skills', label: 'skills' },
  { href: '#projects', label: 'projects' },
  { href: '#resume', label: 'resume' },
  { href: '#contact', label: 'contact' },
]

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-40 border-b border-border bg-bg/85 backdrop-blur-sm">
      <nav className="mx-auto max-w-4xl px-6 h-14 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 group">
          <span className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4b5263] group-hover:bg-red-400/70 transition-colors" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#4b5263] group-hover:bg-yellow-400/70 transition-colors" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#4b5263] group-hover:bg-accent/70 transition-colors" />
          </span>
          <span className="ml-2 text-sm text-text-dim">jacob@portfolio</span>
        </a>

        <ul className="hidden sm:flex items-center gap-6 text-sm">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-text-dim hover:text-accent transition-colors before:content-['./'] before:text-accent/50"
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
          className="sm:hidden p-2 -mr-2 text-text-dim hover:text-accent transition-colors"
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
      </nav>

      {menuOpen && (
        <ul
          id="mobile-nav-menu"
          className="sm:hidden border-t border-border bg-bg px-6 py-4 space-y-3 text-sm"
        >
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-text-dim hover:text-accent transition-colors before:content-['./'] before:text-accent/50"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
