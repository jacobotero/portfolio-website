import { useMemo, useState } from 'react'
import { ProjectCard } from '../components/ProjectCard'
import { PageHero } from '../components/PageHero'
import { allTech, projects } from '../data/projects'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const ALL = 'All'

export function ProjectsPage() {
  useDocumentTitle('Projects — Jacob Otero')
  const [filter, setFilter] = useState(ALL)
  const filters = useMemo(() => [ALL, ...allTech()], [])

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
          <ul className="flex flex-wrap justify-center gap-2 mb-10">
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
