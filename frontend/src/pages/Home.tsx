import { Link } from 'react-router'
import { AboutBlock } from '../components/AboutBlock'
import { Certifications } from '../components/Certifications'
import { Hero } from '../components/Hero'
import { ProjectCard } from '../components/ProjectCard'
import { Reveal } from '../components/Reveal'
import { SkillTabs } from '../components/SkillTabs'
import { projects } from '../data/projects'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function Home() {
  useDocumentTitle(
    'Jacob Otero - Software Engineer',
    'Jacob Otero, a Computer Science senior building full-stack products and the AWS infrastructure they run on. Full-stack development, cloud architecture, and applied AI.',
  )

  return (
    <>
      <Hero />
      <AboutBlock />

      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="font-display font-extrabold text-[clamp(2rem,4.5vw,3rem)] text-center">
              Technical Skills
            </h2>
            <p className="mt-3 text-center text-text-dim">
              My expertise across various technologies and tools
            </p>
          </Reveal>
          <Reveal delay={0.08} className="mt-10">
            <SkillTabs />
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="font-display font-extrabold text-[clamp(2rem,4.5vw,3rem)] text-center">
              Featured Projects
            </h2>
            <p className="mt-3 text-center text-text-dim">
              Check out some of my recent work
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {projects
              .filter((project) => project.featured)
              .map((project, i) => (
                <ProjectCard key={project.slug} project={project} index={i} />
              ))}
          </div>

          <Reveal delay={0.24} className="mt-10 flex justify-center">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-display font-medium rounded-full border border-border bg-bg-raised text-text hover:text-heading hover:border-border-strong transition-colors"
            >
              View all projects
              <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <Certifications />
    </>
  )
}
