import { Reveal } from './Reveal'
import { TerminalHeading } from './TerminalHeading'

interface Role {
  title: string
  department: string
  dates: string
  bullets: string[]
}

const COMPANY = 'Mercedes-Benz U.S. International'
const LOCATION = 'Tuscaloosa, AL'

const ROLES: Role[] = [
  {
    title: 'Software Engineering Co-op',
    department: 'Global Service & Parts',
    dates: 'May 2026 – Aug 2026',
    bullets: [
      'Engineered end-to-end development of a compliance workflow application used by 18 different business units, cutting average review/approval time from 10 hours/week to 2 hours',
      'Led a company-wide initiative to make an internal department tool available to international teams, reducing app development time by 14 days per app',
    ],
  },
  {
    title: 'Software Engineering Co-op',
    department: 'Battery Plant',
    dates: 'Aug 2025 – Dec 2025',
    bullets: [
      'Identified a gap in real-time production tracking and independently built a full-stack solution now used by hundreds of engineers and operators across the plant',
      'Created and prototyped 15 custom machine parts using CAD modeling and 3D printing, cutting part turnaround time from 2 hours to 10 minutes',
    ],
  },
  {
    title: 'Software Engineering Co-op',
    department: 'Global Service & Parts',
    dates: 'Jan 2025 – May 2025',
    bullets: [
      'Partnered with the Dangerous Goods department to automate manual documentation steps, cutting errors and audit flags by 40% across global trade operations',
      'Digitalized a recurring administrative task, saving the department roughly 16 hours per month',
    ],
  },
]

export function Experience() {
  return (
    <section
      id="experience"
      className="px-6 py-24 border-t border-border scroll-mt-20"
    >
      <div className="mx-auto max-w-4xl">
        <TerminalHeading command="cat experience.log" title="Experience" />

        <Reveal className="mb-6">
          <p className="text-heading font-medium">{COMPANY}</p>
          <p className="text-sm text-text-dim">{LOCATION}</p>
        </Reveal>

        <div className="space-y-4">
          {ROLES.map((role, i) => (
            <Reveal
              key={role.title + role.department + role.dates}
              delay={i * 100}
              className="border border-border rounded-2xl p-6"
            >
              <p className="text-heading font-medium">{role.title}</p>
              <p className="text-xs uppercase tracking-widest text-text-dim mt-1 mb-4">
                {role.department} · {role.dates}
              </p>
              <ul className="space-y-2">
                {role.bullets.map((bullet) => (
                  <li key={bullet} className="text-sm text-text-dim flex gap-2">
                    <span className="text-accent shrink-0">&gt;</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
