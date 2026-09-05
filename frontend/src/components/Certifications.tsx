import awsBadge from '../assets/aws-saa-badge.png'
import googleAiBadge from '../assets/google-ai-badge.png'
import { Reveal } from './Reveal'

interface Certification {
  badge: string
  alt: string
  title: string
  description: string
  status: 'completed' | 'in-progress'
  link?: string
}

const CERTIFICATIONS: Certification[] = [
  {
    badge: awsBadge,
    alt: 'AWS Certified Solutions Architect - Associate badge',
    title: 'AWS Certified Solutions Architect - Associate',
    description:
      "This site's infrastructure (S3, CloudFront, Lambda, API Gateway) is built with what I'm learning along the way.",
    status: 'in-progress',
  },
  {
    badge: googleAiBadge,
    alt: 'Google AI Professional Certificate badge',
    title: 'Google AI Professional Certificate',
    description: 'Practical coursework on building and applying AI/ML tools.',
    status: 'completed',
    link: 'https://www.coursera.org/account/accomplishments/professional-cert/certificate/MFQ3BPXDSCLO',
  },
]

/** A colored badge rather than a word buried in the description — status is
    the first thing worth knowing about a cert, not a footnote. Both states
    reuse the existing accent token rather than introducing a new color, so
    "in progress" (outlined, pulsing dot: still moving) and "completed"
    (solid, checkmark: settled) read as two weights of the same brand color
    instead of an arbitrary traffic-light green/amber. */
function StatusPill({ status }: { status: Certification['status'] }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-contrast">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3 h-3"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        Completed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border border-accent text-accent">
      <span
        className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
        aria-hidden="true"
      />
      In Progress
    </span>
  )
}

export function Certifications() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="font-display font-extrabold text-[clamp(2rem,4.5vw,3rem)] text-center">
            Certifications
          </h2>
        </Reveal>

        <div className="mt-10 space-y-4">
          {CERTIFICATIONS.map((cert, i) => (
            <Reveal
              key={cert.title}
              delay={i * 0.08}
              className="rounded-2xl border border-border bg-bg-raised px-6 py-5 flex items-center gap-5"
            >
              <img
                src={cert.badge}
                alt={cert.alt}
                className="w-16 sm:w-20 shrink-0"
              />
              <div>
                <p className="text-heading font-medium flex flex-wrap items-center gap-2">
                  {cert.title}
                  <StatusPill status={cert.status} />
                  {cert.link && (
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`View credential: ${cert.title}`}
                      title="View credential"
                      className="text-text-dim hover:text-accent transition-colors"
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
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </a>
                  )}
                </p>
                <p className="text-sm text-text-dim mt-1">{cert.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.16} className="mt-10 flex justify-center">
          <a
            href="/resume.pdf"
            download="Jacob Otero - Resume.pdf"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-display font-medium rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors"
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
            Download my resume
          </a>
        </Reveal>
      </div>
    </section>
  )
}
