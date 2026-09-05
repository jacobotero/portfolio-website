import { Link } from 'react-router'
import { NAV_LINKS } from './Nav'

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto max-w-5xl grid gap-8 sm:grid-cols-3">
        <div>
          <Link
            to="/"
            className="font-display font-bold text-heading hover:text-accent transition-colors"
          >
            Jacob Otero
          </Link>
          <p className="mt-2 text-sm text-text-dim">
            Full-stack development · Database design · Cloud architecture · Applied AI
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="text-xs uppercase tracking-widest text-text-dim mb-3">
            Quick links
          </p>
          <ul className="space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-text-dim hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-xs uppercase tracking-widest text-text-dim mb-3">
            Connect
          </p>
          <ul className="space-y-2">
            <li>
              <a
                href="https://github.com/jacobotero"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-text-dim hover:text-accent transition-colors"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/jacob-otero"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-text-dim hover:text-accent transition-colors"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="mailto:jacobotero0313@gmail.com"
                className="text-sm text-text-dim hover:text-accent transition-colors"
              >
                Email
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p className="mx-auto max-w-5xl mt-10 pt-6 border-t border-border text-xs text-text-dim">
        © {new Date().getFullYear()} Jacob Otero · Built with React and deployed
        on AWS
      </p>
    </footer>
  )
}
