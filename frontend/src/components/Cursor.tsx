export function Cursor({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block w-[0.55em] h-[1em] translate-y-[0.12em] bg-accent animate-blink ${className}`}
    />
  )
}
