import { projects } from '../data/projects'
import { Reveal } from './Reveal'
import { TerminalHeading } from './TerminalHeading'

export function Projects() {
  return (
    <section id="projects" className="px-6 py-24 border-t border-border scroll-mt-20">
      <div className="mx-auto max-w-4xl">
        <TerminalHeading command="ls projects/" title="Projects" />

        {projects.length === 0 ? (
          <Reveal className="border border-dashed border-border rounded-2xl px-6 py-10 text-sm text-text-dim">
            <p className="text-accent">ls: projects/: directory empty</p>
            <p className="mt-3 max-w-md">
              Nothing published here yet — projects get added as they're
              built. Check back soon, or see everything in progress on{' '}
              <a
                href="https://github.com/jacobotero"
                target="_blank"
                rel="noreferrer"
                className="text-accent underline underline-offset-4 decoration-accent-dim hover:decoration-accent"
              >
                GitHub
              </a>
              .
            </p>
          </Reveal>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {projects.map((project, i) => (
              <Reveal key={project.name} delay={i * 80}>
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group block border border-border rounded-2xl p-6 hover:border-accent-dim transition-colors"
                >
                  <p className="text-xs tracking-widest text-accent">
                    {String(i + 1).padStart(2, '0')} — {project.category.toUpperCase()}
                  </p>
                  <p className="mt-2 text-xl text-heading font-semibold group-hover:text-accent transition-colors">
                    {project.name}
                  </p>
                  <p className="mt-2 text-sm text-text-dim">
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-2 py-0.5 border border-border rounded-full text-text-dim"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
