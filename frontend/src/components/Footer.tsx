export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto max-w-4xl flex flex-col sm:flex-row justify-between gap-2 text-xs text-text-dim">
        <p>
          <span className="text-accent">$</span> echo "© {year} Jacob Otero"
        </p>
        <p>built with React, Tailwind & AWS</p>
      </div>
    </footer>
  )
}
