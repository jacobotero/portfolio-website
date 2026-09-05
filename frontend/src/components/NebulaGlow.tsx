/**
 * Two large, blurred, slowly-drifting radial gradients behind the starfield.
 * Replaces PageHero's old single static glow div — same two theme tokens
 * (`--c-glow` warm violet, `--c-glow-2` cooler indigo) it used before, just
 * given depth and motion instead of sitting flat.
 *
 * The drift is plain CSS `animation`, so it's automatically collapsed to a
 * static frame by the sitewide `prefers-reduced-motion` rule in index.css —
 * no JS guard needed here.
 */
export function NebulaGlow() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute left-1/2 top-0 w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, var(--c-glow), transparent 70%)',
          animation: 'nebula-drift-a 70s ease-in-out infinite',
        }}
      />
      <div
        className="absolute left-1/2 top-0 w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] -translate-x-[35%] -translate-y-1/4 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 50%, var(--c-glow-2), transparent 70%)',
          animation: 'nebula-drift-b 95s ease-in-out infinite',
        }}
      />
    </div>
  )
}
