import { Link } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function NotFound() {
  useDocumentTitle(
    'Page not found — Jacob Otero',
    "The page you're looking for doesn't exist.",
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-accent font-display text-sm tracking-widest">404</p>
      <h1 className="text-4xl">Page not found</h1>
      <p className="text-text-dim">That page doesn't exist.</p>
      <Link
        to="/"
        className="mt-2 px-5 py-2.5 text-sm font-display rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors"
      >
        Back home
      </Link>
    </div>
  )
}
