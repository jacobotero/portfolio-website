import { AboutBlock } from '../components/AboutBlock'
import { Hero } from '../components/Hero'
import { Reveal } from '../components/Reveal'
import { SkillTabs } from '../components/SkillTabs'

export function Home() {
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
    </>
  )
}
