interface SkillGroup {
  key: string
  items: string[]
}

const SKILL_GROUPS: SkillGroup[] = [
  { key: 'languages', items: ['Python', 'TypeScript', 'JavaScript', 'SQL'] },
  {
    key: 'cloudInfra',
    items: ['AWS', 'CDK', 'Lambda', 'S3', 'CloudFront', 'Docker'],
  },
  { key: 'web', items: ['React', 'Vite', 'Node.js', 'Tailwind CSS'] },
  { key: 'currentlyLearning', items: ['AI / ML', 'System Design'] },
]

function Punct({ children }: { children: React.ReactNode }) {
  return <span className="text-text-dim">{children}</span>
}

function JsonArray({ items }: { items: string[] }) {
  return (
    <>
      <Punct>[</Punct>
      {items.map((item, i) => (
        <span key={item}>
          <span className="text-accent">&quot;{item}&quot;</span>
          {i < items.length - 1 && <Punct>, </Punct>}
        </span>
      ))}
      <Punct>]</Punct>
    </>
  )
}

function Line({
  number,
  children,
}: {
  number: number
  children: React.ReactNode
}) {
  return (
    <div className="flex">
      <span className="w-8 shrink-0 text-right pr-4 text-text-dim/40 select-none">
        {number}
      </span>
      <span className="flex-1 pl-4">{children}</span>
    </div>
  )
}

export function SkillsCode() {
  const lastIndex = SKILL_GROUPS.length - 1

  return (
    <div className="border border-border bg-bg-raised/60 shadow-xl shadow-black/20 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-bg/40">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 text-xs text-text-dim">skills.json</span>
      </div>
      <div className="px-2 py-5 text-sm leading-relaxed overflow-x-auto">
        <Line number={1}>
          <Punct>{'{'}</Punct>
        </Line>
        {SKILL_GROUPS.map((group, i) => (
          <Line number={i + 2} key={group.key}>
            <span className="text-heading">&quot;{group.key}&quot;</span>
            <Punct>: </Punct>
            <JsonArray items={group.items} />
            {i < lastIndex && <Punct>,</Punct>}
          </Line>
        ))}
        <Line number={SKILL_GROUPS.length + 2}>
          <Punct>{'}'}</Punct>
        </Line>
      </div>
    </div>
  )
}
