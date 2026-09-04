import { Reveal } from './Reveal'
import { TerminalHeading } from './TerminalHeading'

interface Role {
  title: string
  department: string
  dates: string
}

const COMPANY = 'Mercedes-Benz U.S. International'
const LOCATION = 'Tuscaloosa, AL'

const ROLES: Role[] = [
  {
    title: 'Software Engineering Co-op',
    department: 'Global Service & Parts',
    dates: 'May 2026 – Aug 2026',
  },
  {
    title: 'Software Engineering Co-op',
    department: 'Battery Plant',
    dates: 'Aug 2025 – Dec 2025',
  },
  {
    title: 'Software Engineering Co-op',
    department: 'Global Service & Parts',
    dates: 'Jan 2025 – May 2025',
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

        <div className="border-l border-border space-y-6">
          {ROLES.map((role, i) => (
            <Reveal
              key={role.title + role.department + role.dates}
              delay={i * 100}
              className="relative pl-8"
            >
              <span className="absolute left-0 top-1.5 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-accent" />
              <p className="text-heading font-medium">{role.title}</p>
              <p className="text-sm text-text-dim">{role.department}</p>
              <p className="text-xs text-text-dim mt-0.5">{role.dates}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
