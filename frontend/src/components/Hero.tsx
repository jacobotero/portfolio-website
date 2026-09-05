import { Link } from 'react-router'
import profile from '../assets/profile.jpg'
import { PageHero } from './PageHero'
import { useRotatingText } from '../hooks/useRotatingText'

// Domains worked in, deliberately not job titles: "Cloud architecture" is
// something a student can honestly claim to work on, "Cloud Engineer" is a
// role. The blurb below already does the positioning.
const ROLES = [
  'Full-stack development',
  'Database design',
  'System design',
  'Cloud architecture',
  'Applied AI',
]

/** Set to null to fall back to the "JO" monogram placeholder. */
const PROFILE_IMAGE: string | null = profile

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/jacobotero',
    path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.679.919.679 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/jacob-otero',
    path: 'M6.94 8.5H3.56V21h3.38V8.5ZM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM21 21h-3.38v-6.5c0-1.55-.03-3.55-2.17-3.55-2.17 0-2.5 1.7-2.5 3.44V21H9.57V8.5h3.24v1.7h.05c.45-.86 1.56-1.77 3.2-1.77 3.42 0 4.94 2.25 4.94 6.03V21Z',
  },
  {
    label: 'Email',
    href: 'mailto:jacobotero0313@gmail.com',
    path: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.7 2 7.3 5.5L19.3 7H4.7ZM4 8.2V17h16V8.2l-8 6-8-6Z',
  },
]

export function Hero() {
  const role = useRotatingText(ROLES)

  return (
    <PageHero fullHeight>
      <div className="grid lg:grid-cols-[1.1fr_auto] gap-12 lg:gap-16 items-center py-24">
        <div>
          <h1 className="font-display font-extrabold tracking-tight text-[clamp(2.75rem,7vw,4.5rem)] leading-[1.05]">
            Hi, I'm Jacob Otero
          </h1>

          {/*
            Not aria-live: a perpetually typing-and-deleting line would have a
            screen reader announce every single character change, which is
            noise rather than information. The static role list already
            appears in the paragraph below for assistive tech; this line is
            treated as decorative animation and hidden from the accessibility
            tree instead.
          */}
          <p
            className="mt-2 font-display font-bold text-accent text-[clamp(1.25rem,3vw,1.75rem)] min-h-[1.6em]"
            aria-hidden="true"
          >
            {role}
            <span className="animate-pulse">|</span>
          </p>
          <p className="sr-only">{ROLES.join(', ')}</p>

          <p className="mt-5 max-w-xl text-text-dim leading-relaxed">
            Computer Science senior building full-stack products and the cloud
            infrastructure they run on. Most drawn to applied AI, AWS
            architecture, and taking a project from first commit to something
            deployed and running.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-display font-medium rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors"
            >
              View my work
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href="/resume.pdf"
              download="Jacob Otero - Resume.pdf"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-display font-medium rounded-full border border-border bg-bg-raised text-text hover:text-heading hover:border-border-strong transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M12 3v12M7 12l5 5 5-5M5 21h14" />
              </svg>
              Resume
            </a>
          </div>

          <ul className="mt-8 flex gap-3">
            {SOCIALS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-bg-raised text-text-dim hover:text-accent hover:border-accent transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="justify-self-center lg:justify-self-end">
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-full blur-2xl"
              style={{ background: 'var(--c-glow)' }}
            />
            {PROFILE_IMAGE ? (
              <img
                src={PROFILE_IMAGE}
                alt="Jacob Otero"
                className="relative w-full h-full rounded-full object-cover border border-border-strong"
              />
            ) : (
              <div className="relative w-full h-full rounded-full border border-border-strong bg-bg-raised flex items-center justify-center">
                <span className="font-display font-extrabold text-6xl text-accent">
                  JO
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageHero>
  )
}
