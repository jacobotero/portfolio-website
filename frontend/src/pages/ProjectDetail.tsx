import { Link, useParams } from 'react-router'
import { PageHero } from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import { getProject } from '../data/projects'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { NotFound } from './NotFound'

export function ProjectDetail() {
  const { slug } = useParams()
  const project = slug ? getProject(slug) : undefined
  // Called unconditionally, before the early return below, so hook order
  // stays stable — NotFound sets its own title when actually rendered as
  // its own route, but ProjectDetail renders it inline for an unknown slug
  // rather than redirecting, so it needs the same title set here too.
  useDocumentTitle(
    project ? `${project.title} — Jacob Otero` : 'Page not found — Jacob Otero',
    project ? project.tagline : "The page you're looking for doesn't exist.",
  )

  if (!project) return <NotFound />

  return (
    <>
      <PageHero title={project.title} subtitle={project.tagline} />

      <article className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <img
              src={project.cover}
              alt=""
              className="w-full rounded-2xl border border-border"
            />
          </Reveal>

          <Reveal className="mt-8 flex flex-wrap gap-3">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 text-sm font-display rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors"
              >
                Live demo
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 text-sm font-display rounded-full border border-border text-text-dim hover:text-heading hover:border-border-strong transition-colors"
              >
                View source
              </a>
            )}
            <Link
              to="/projects"
              className="px-5 py-2.5 text-sm font-display rounded-full border border-border text-text-dim hover:text-heading hover:border-border-strong transition-colors"
            >
              All projects
            </Link>
          </Reveal>

          <Reveal className="mt-8 flex flex-wrap gap-1.5">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 text-xs rounded-full border border-border text-text-dim"
              >
                {tech}
              </span>
            ))}
          </Reveal>

          <Reveal className="mt-12">
            <h2 className="font-display font-bold text-2xl">The Problem</h2>
            <p className="mt-3 text-text-dim leading-relaxed">
              {project.detail.problem}
            </p>
          </Reveal>

          <Reveal className="mt-10">
            <h2 className="font-display font-bold text-2xl">Approach</h2>
            <ul className="mt-3 space-y-3">
              {project.detail.approach.map((item) => (
                <li key={item} className="flex gap-3 text-text-dim leading-relaxed">
                  <span className="text-accent shrink-0" aria-hidden="true">
                    →
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="mt-10">
            <h2 className="font-display font-bold text-2xl">Outcome</h2>
            <ul className="mt-3 space-y-3">
              {project.detail.outcome.map((item) => (
                <li key={item} className="flex gap-3 text-text-dim leading-relaxed">
                  <span className="text-accent shrink-0" aria-hidden="true">
                    →
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="mt-10">
            <h2 className="font-display font-bold text-2xl">Stack</h2>
            <dl className="mt-4 rounded-2xl border border-border divide-y divide-border overflow-hidden">
              {project.detail.stack.map((row) => (
                <div
                  key={row.layer}
                  className="grid sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4 px-5 py-4"
                >
                  <dt className="text-sm text-heading font-medium">{row.layer}</dt>
                  <dd className="text-sm text-text-dim">{row.tech}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </article>
    </>
  )
}
