import { TerminalHeading } from './TerminalHeading'

interface Role {
  title: string
  dates: string
  bullets: string[]
}

const COMPANY = 'Mercedes-Benz U.S. International'
const LOCATION = 'Tuscaloosa, AL'

const ROLES: Role[] = [
  {
    title: 'Software Engineering Co-op — GSP (Global Service & Parts)',
    dates: 'May 2026 – Present',
    bullets: [
      'Engineered end-to-end development of a compliance workflow application used by 18 different business units, from initial design through deployment, cutting average review/approval time from 10 hours/week to 2 hours',
      'Led a company-wide initiative to make an internal department tool available to international teams, coordinating departmental requirements and reducing app development time by 14 days per app',
    ],
  },
  {
    title: 'Software Engineering Co-op — Battery Plant',
    dates: 'Aug 2025 – Dec 2025',
    bullets: [
      'Identified a gap in real-time production tracking and independently drafted, built, and launched a full-stack solution now used by hundreds of engineers and operators across the plant, replacing a manual procedure that previously took between 30 minutes and 8 hours',
      'Created and prototyped 15 custom machine parts using CAD modeling and 3D printing, cutting part turnaround time from 2 hours to 10 minutes',
    ],
  },
  {
    title: 'Software Engineering Co-op — GSP (Global Service & Parts)',
    dates: 'Jan 2025 – May 2025',
    bullets: [
      'Partnered with the Dangerous Goods department to automate manual documentation steps, cutting errors and audit flags by 40% across global trade operations',
      'Digitalized a recurring administrative task that previously took 4 hours/week, saving the department roughly 16 hours per month',
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

        <div className="mb-6">
          <p className="text-heading font-medium">{COMPANY}</p>
          <p className="text-sm text-text-dim">{LOCATION}</p>
        </div>

        <div className="border-l border-border space-y-10">
          {ROLES.map((role) => (
            <div key={role.title + role.dates} className="relative pl-8">
              <span className="absolute left-0 top-1.5 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-accent" />
              <p className="text-heading font-medium">{role.title}</p>
              <p className="text-xs text-text-dim mb-3">{role.dates}</p>
              <ul className="space-y-1.5">
                {role.bullets.map((bullet) => (
                  <li key={bullet} className="text-sm text-text-dim flex gap-2">
                    <span className="text-accent shrink-0">▸</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
