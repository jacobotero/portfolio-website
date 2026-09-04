import { Reveal } from './Reveal'

interface Role {
  title: string
  department: string
  dates: string
  summary: string
}

const COMPANY = 'Mercedes-Benz U.S. International'
const LOCATION = 'Tuscaloosa, AL'
const TENURE = 'Jan 2025 – Aug 2026 · 3 terms'

const ROLES: Role[] = [
  {
    title: 'Software Engineering Co-op',
    department: 'Global Service & Parts',
    dates: 'May 2026 – Aug 2026',
    summary:
      'Built a compliance workflow tool adopted by 18 business units, cutting review time 80%.',
  },
  {
    title: 'Software Engineering Co-op',
    department: 'Battery Plant',
    dates: 'Aug 2025 – Dec 2025',
    summary:
      'Built a real-time production tracking system now used plant-wide by hundreds of engineers and operators.',
  },
  {
    title: 'Software Engineering Co-op',
    department: 'Global Service & Parts',
    dates: 'Jan 2025 – May 2025',
    summary:
      'Automated dangerous-goods documentation, cutting audit errors 40% across global trade operations.',
  },
]

export function CompanyTimeline() {
  return (
    <Reveal className="rounded-2xl border border-border bg-bg-raised p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2 pb-6 border-b border-border">
        <div>
          <h2 className="font-display font-bold text-xl text-heading">
            {COMPANY}
          </h2>
          <p className="text-sm text-text-dim mt-1">{LOCATION}</p>
        </div>
        <p className="text-xs uppercase tracking-widest text-accent">{TENURE}</p>
      </div>

      {/*
        The vertical spine is a `before:` pseudo-element on this <ol>, which
        is the positioned ancestor (`relative`) both the spine and the dot
        markers resolve against.

        Each dot marker is a direct child of its <li> — a plain, unanimated
        span, deliberately kept OUTSIDE the per-role <Reveal>. Motion sets an
        inline `transform` on the elements it animates (Reveal's `initial`
        prop starts at `y: 16`), and per the CSS spec any element with a
        transform becomes a new containing block for `position: absolute`
        descendants. If the dot lived inside Reveal's div, it would resolve
        `left-0` against that per-role box instead of the <ol>, landing it
        ~32px too far right (inside the padding gutter reserved for the
        text, not on the spine). Keeping <li> itself unpositioned lets the
        dot's containing block skip up to the <ol>, so `left-0` lines up
        with the spine's `left-[5px]` in the same coordinate space, and
        leaving `top` unset (only a small `marginTop` nudge) lets the
        browser's static-position fallback place it at the top of its own
        <li> in flow — which is what keeps every dot level with its role's
        first line regardless of how tall the previous role's text is.
      */}
      <ol className="relative mt-8 pl-8 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-border">
        {ROLES.map((role, i) => (
          <li key={role.department + role.dates} className={i > 0 ? 'mt-8' : ''}>
            <span
              aria-hidden="true"
              className="absolute left-0 w-[11px] h-[11px] rounded-full bg-accent ring-4 ring-bg-raised"
              style={{ marginTop: '0.4rem' }}
            />
            <Reveal delay={i * 0.1}>
              <p className="text-heading font-medium">{role.title}</p>
              <p className="text-xs uppercase tracking-widest text-text-dim mt-1">
                {role.department} · {role.dates}
              </p>
              <p className="mt-3 text-sm text-text-dim flex gap-2">
                <span className="text-accent shrink-0" aria-hidden="true">
                  →
                </span>
                <span>{role.summary}</span>
              </p>
            </Reveal>
          </li>
        ))}
      </ol>
    </Reveal>
  )
}
