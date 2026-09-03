const LINKS = [
  { href: '#about', label: 'about' },
  { href: '#skills', label: 'skills' },
  { href: '#projects', label: 'projects' },
  { href: '#resume', label: 'resume' },
  { href: '#contact', label: 'contact' },
]

export function Nav() {
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
      </nav>
    </header>
  )
}
