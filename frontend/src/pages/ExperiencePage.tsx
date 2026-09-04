import { CompanyTimeline } from '../components/CompanyTimeline'
import { PageHero } from '../components/PageHero'

export function ExperiencePage() {
  return (
    <>
      <PageHero
        title="Experience"
        subtitle="My professional journey in software engineering"
      />

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <CompanyTimeline />
        </div>
      </section>
    </>
  )
}
