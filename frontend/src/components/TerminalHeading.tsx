interface TerminalHeadingProps {
  command: string
  title: string
}

export function TerminalHeading({ command, title }: TerminalHeadingProps) {
  return (
    <div className="mb-10">
      <p className="text-sm text-text-dim mb-2">
        <span className="text-accent">jacob@portfolio</span>
        <span className="text-text-dim">:~$ </span>
        {command}
      </p>
      <h2 className="font-display text-3xl sm:text-4xl text-heading font-medium tracking-tight">
        {title}
      </h2>
      <div className="mt-4 h-px w-16 bg-accent" />
    </div>
  )
}
