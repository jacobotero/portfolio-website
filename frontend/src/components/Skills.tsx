import awsBadge from '../assets/aws-saa-badge.png'
import { TerminalHeading } from './TerminalHeading'

const SKILL_GROUPS: { label: string; items: string[] }[] = [
  { label: 'languages', items: ['Python', 'TypeScript', 'JavaScript', 'SQL'] },
  { label: 'cloud / infra', items: ['AWS', 'CDK', 'Lambda', 'S3', 'CloudFront', 'Docker'] },
  { label: 'web', items: ['React', 'Vite', 'Node.js', 'Tailwind CSS'] },
  { label: 'currently learning', items: ['AI / ML', 'System Design'] },
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

        <div className="border border-accent-dim bg-accent/5 px-6 py-5 flex items-center gap-5">
          <img
            src={awsBadge}
            alt="AWS Certified Solutions Architect — Associate badge"
            className="w-16 sm:w-20 shrink-0 drop-shadow-[0_4px_16px_rgba(57,217,138,0.15)]"
            width={447}
            height={447}
          />
          <div>
            <p className="text-heading font-medium">
              AWS Certified Solutions Architect — Associate
            </p>
            <p className="text-sm text-text-dim mt-1">
              In progress — this site's infrastructure (S3, CloudFront,
              Lambda, API Gateway) is built with what I'm learning along the
              way.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
