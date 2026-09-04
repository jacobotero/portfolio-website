import { Reveal } from './Reveal'
import { TerminalHeading } from './TerminalHeading'

export function About() {
  return (
    <section id="about" className="px-6 py-24 border-t border-border scroll-mt-20">
      <div className="mx-auto max-w-4xl">
        <TerminalHeading command="cat about.md" title="About" />
        <Reveal className="space-y-4 text-sm sm:text-base leading-relaxed text-text max-w-2xl">
          <p>
            I'm a senior Computer Science student graduating soon and looking
            for full-time software engineering roles. I spend most of my time
            in Python, and I'm currently digging into cloud architecture —
            working toward the AWS Solutions Architect Associate
            certification and building this site on the services it covers.
          </p>
          <p>
            Outside of coursework, I like building things end to end: writing
            the code, designing the infrastructure it runs on, and shipping
            it somewhere real. I'm especially interested in AI/ML and where
            it intersects with well-architected backend systems.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
