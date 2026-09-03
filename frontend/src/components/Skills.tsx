import awsBadge from '../assets/aws-saa-badge.png'
import googleAiBadge from '../assets/google-ai-badge.png'
import { TerminalHeading } from './TerminalHeading'

const SKILL_GROUPS: { label: string; items: string[] }[] = [
  { label: 'languages', items: ['Python', 'TypeScript', 'JavaScript', 'SQL'] },
  { label: 'cloud / infra', items: ['AWS', 'CDK', 'Lambda', 'S3', 'CloudFront', 'Docker'] },
  { label: 'web', items: ['React', 'Vite', 'Node.js', 'Tailwind CSS'] },
  { label: 'currently learning', items: ['AI / ML', 'System Design'] },
]

interface Certification {
  badge: string
  alt: string
  title: string
  description: string
  link?: string
}

const CERTIFICATIONS: Certification[] = [
  {
    badge: awsBadge,
    alt: 'AWS Certified Solutions Architect — Associate badge',
    title: 'AWS Certified Solutions Architect — Associate',
    description:
      "In progress — this site's infrastructure (S3, CloudFront, Lambda, API Gateway) is built with what I'm learning along the way.",
  },
  {
    badge: googleAiBadge,
    alt: 'Google AI Professional Certificate badge',
    title: 'Google AI Professional Certificate',
    description:
      'Completed — practical coursework on building and applying AI/ML tools.',
    link: 'https://www.coursera.org/account/accomplishments/professional-cert/certificate/MFQ3BPXDSCLO',
  },
]

export function Skills() {
  return (
    <section id="skills" className="px-6 py-24 border-t border-border scroll-mt-20">
      <div className="mx-auto max-w-4xl">
        <TerminalHeading command="ls -la skills/" title="Skills" />

        <div className="grid sm:grid-cols-2 gap-x-10 gap-y-8 mb-12">
          {SKILL_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs uppercase tracking-widest text-text-dim mb-3">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 text-sm border border-border text-text hover:border-accent-dim hover:text-accent transition-colors"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-10 mt-2 border-t border-border">
          <p className="text-xs uppercase tracking-widest text-text-dim mb-4">
            certifications
          </p>
          <div className="space-y-4">
            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert.title}
                className="border border-accent-dim bg-accent/5 px-6 py-5 flex items-center gap-5"
              >
                <img
                  src={cert.badge}
                  alt={cert.alt}
                  className="w-16 sm:w-20 shrink-0 drop-shadow-[0_4px_16px_rgba(57,217,138,0.15)]"
                />
                <div>
                  <p className="text-heading font-medium flex items-center gap-2">
                    {cert.title}
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
