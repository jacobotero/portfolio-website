import { Link } from 'react-router'
import type { Project } from '../data/projects'
import { Reveal } from './Reveal'

const MAX_VISIBLE_TECH = 4

export function ProjectCard({
  project,
  index = 0,
}: {
  project: Project
  index?: number
}) {
  const visibleTech = project.tech.slice(0, MAX_VISIBLE_TECH)
  const overflow = project.tech.length - visibleTech.length

  return (
    <Reveal
      delay={index * 0.08}
      className="h-full rounded-2xl border border-border bg-bg-raised overflow-hidden flex flex-col hover:border-border-strong transition-colors"
    >
      <img
        src={project.cover}
        alt=""
        loading="lazy"
        className="w-full aspect-[1200/630] object-cover border-b border-border"
      />

      <div className="p-6 flex flex-col grow">
        <h3 className="font-display font-bold text-lg text-heading">
          {project.title}
        </h3>
        <p className="mt-2 text-sm text-text-dim leading-relaxed">
          {project.description}
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {visibleTech.map((tech) => (
            <li
              key={tech}
              className="px-2.5 py-1 text-xs rounded-full border border-border text-text-dim"
            >
              {tech}
            </li>
          ))}
          {overflow > 0 && (
            <li className="px-2.5 py-1 text-xs rounded-full border border-border text-text-dim">
              +{overflow}
            </li>
          )}
        </ul>

        <ul className="mt-4 space-y-2">
          {project.highlights.slice(0, 2).map((highlight) => (
            <li key={highlight} className="flex gap-2 text-sm text-text-dim">
              <span className="text-accent shrink-0" aria-hidden="true">
                →
              </span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-4 flex items-center gap-3">
          <Link
            to={`/projects/${project.slug}`}
            className="px-4 py-2 text-sm font-display rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors"
          >
            View details
          </Link>
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-sm font-display rounded-full border border-border text-text-dim hover:text-heading hover:border-border-strong transition-colors"
            >
              Live demo
            </a>
          )}
        </div>
      </div>
    </Reveal>
  )
}
