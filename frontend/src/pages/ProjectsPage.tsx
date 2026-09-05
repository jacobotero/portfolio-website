import { useMemo, useState } from 'react'
import { ProjectCard } from '../components/ProjectCard'
import { PageHero } from '../components/PageHero'
import { allTech, projects } from '../data/projects'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const ALL = 'All'
// Every project's combined tech list runs well past what fits on one line —
// show this many up front and fold the rest behind a "+N more" toggle
// rather than letting the filter bar sprawl across several cramped rows.
const DEFAULT_VISIBLE_TECH = 10

export function ProjectsPage() {
  useDocumentTitle(
    'Projects - Jacob Otero',
    'A showcase of full-stack and cloud projects by Jacob Otero, spanning React, Node.js, and AWS infrastructure.',
  )
  const [filter, setFilter] = useState(ALL)
  const [showAllTech, setShowAllTech] = useState(false)
  const allTechList = useMemo(() => allTech(), [])
  const hiddenTechCount = allTechList.length - DEFAULT_VISIBLE_TECH
  const visibleTech = showAllTech
    ? allTechList
    : allTechList.slice(0, DEFAULT_VISIBLE_TECH)
  const filters = [ALL, ...visibleTech]

  const visible = useMemo(
    () =>
      filter === ALL
        ? projects
        : projects.filter((project) => project.tech.includes(filter)),
    [filter],
  )

  return (
    <>
      <PageHero
        title="My Projects"
        subtitle="A showcase of my work across various technologies"
      />

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <ul className="flex flex-wrap justify-center gap-x-2 gap-y-3 mb-10">
            {filters.map((tech) => {
              const selected = tech === filter
              return (
                <li key={tech}>
                  <button
                    type="button"
                    onClick={() => setFilter(tech)}
                    aria-pressed={selected}
                    className={`px-3.5 py-1.5 text-xs rounded-full border transition-colors ${
                      selected
                        ? 'bg-accent text-accent-contrast border-accent'
                        : 'border-border text-text-dim hover:text-heading hover:border-border-strong'
                    }`}
                  >
                    {tech}
                  </button>
                </li>
              )
            })}
            {hiddenTechCount > 0 && (
              <li>
                <button
                  type="button"
                  onClick={() => setShowAllTech((v) => !v)}
                  aria-expanded={showAllTech}
                  className="px-3.5 py-1.5 text-xs rounded-full border border-border bg-bg-elevated text-accent hover:border-border-strong transition-colors"
                >
                  {showAllTech ? 'Show less' : `+${hiddenTechCount} more`}
                </button>
              </li>
            )}
          </ul>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {visible.map((project, i) => (
              <ProjectCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
