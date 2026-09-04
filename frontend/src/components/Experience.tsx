import { Reveal } from './Reveal'
import { TerminalHeading } from './TerminalHeading'

interface Role {
  title: string
  department: string
  dates: string
  summary: string
}

const COMPANY = 'Mercedes-Benz U.S. International'
const LOCATION = 'Tuscaloosa, AL'

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
              <p className="text-xs uppercase tracking-widest text-text-dim mt-1 mb-3">
                {role.department} · {role.dates}
              </p>
              <p className="text-sm text-text-dim flex gap-2">
                <span className="text-accent shrink-0">&gt;</span>
                <span>{role.summary}</span>
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
