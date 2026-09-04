import { Reveal } from './Reveal'

export function AboutBlock() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="font-display font-extrabold text-[clamp(2rem,4.5vw,3rem)] text-center">
            Who I Am
          </h2>
        </Reveal>

        <Reveal delay={0.08} className="mt-8 space-y-4 leading-relaxed text-text-dim">
          <p>
            I'm a senior Computer Science student graduating soon and looking for
            full-time software engineering roles. I've completed three software
            engineering co-ops at Mercedes-Benz U.S. International, building tools
            that went into real use on the plant floor and across global trade
            operations.
          </p>
          <p>
            I like building things end to end: writing the code, designing the
            infrastructure it runs on, and shipping it somewhere real. DonorTrack,
            a multi-tenant SaaS I built and run in production, is the clearest
            example — and this site is another, deployed on the AWS services I'm
            studying for the Solutions Architect Associate certification.
          </p>
          <p>
            I'm especially interested in AI and where it intersects with
            well-architected backend systems.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
