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
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        // The blobs below fade out over their own fixed pixel size (~600px),
        // which comfortably fits inside Home's full-viewport hero but is
        // taller than an inner page's short title-only band — there,
        // overflow-hidden was clipping the blob mid-fade instead of letting
        // it finish, reading as a hard edge. Masking here instead ties the
        // fade to this container's *actual* rendered height on either page,
        // same technique Starfield's canvas uses for its own bottom fade.
        maskImage: 'linear-gradient(to bottom, black 0%, black 45%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, black 0%, black 45%, transparent 100%)',
      }}
    >
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
