import { useGitHubStats } from '../hooks/useGitHubStats'
import { Reveal } from './Reveal'

const GITHUB_URL = 'https://github.com/jacobotero'

// Official brand colors (simple-icons hex), same sourcing approach as
// SkillTabs — GitHub's own language-color list is much longer, but these
// cover what's actually in the repos this pulls from.
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  HTML: '#E34F26',
  CSS: '#663399',
  Java: '#ED8B00',
}

export function GitHubActivity() {
  const stats = useGitHubStats()

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <Reveal>
          <h2 className="font-display font-extrabold text-[clamp(2rem,4.5vw,3rem)] text-center">
            GitHub Activity
          </h2>
          <p className="mt-3 text-center text-text-dim">
            Live from my public repos, not just a claim
          </p>
        </Reveal>

        {stats.status === 'loading' && (
          <p className="mt-10 text-center text-sm text-text-dim">
            Loading recent activity…
          </p>
        )}

        {stats.status === 'ready' && (
          <>
            <Reveal
              delay={0.08}
              className="mt-10 flex justify-center gap-10 text-center"
            >
              <div>
                <p className="text-3xl font-display font-bold text-heading">
                  {stats.data.publicRepos}
                </p>
                <p className="text-sm text-text-dim mt-1">Public repos</p>
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-heading">
                  {stats.data.followers}
                </p>
                <p className="text-sm text-text-dim mt-1">Followers</p>
              </div>
            </Reveal>

            {stats.data.repos.length > 0 && (
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {stats.data.repos.map((repo, i) => (
                  <Reveal
                    key={repo.name}
                    delay={0.14 + i * 0.06}
                    className="rounded-2xl border border-border bg-bg-raised p-5"
                  >
                    <a
                      href={repo.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                    >
                      <p className="font-display font-medium text-heading truncate hover:text-accent transition-colors">
                        {repo.name}
                      </p>
                      {repo.description && (
                        <p className="mt-1.5 text-sm text-text-dim line-clamp-2">
                          {repo.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-xs text-text-dim">
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{
                                background:
                                  LANGUAGE_COLORS[repo.language] ??
                                  'var(--c-accent)',
                              }}
                              aria-hidden="true"
                            />
                            {repo.language}
                          </span>
                        )}
                        {repo.stars > 0 && <span>★ {repo.stars}</span>}
                      </div>
                    </a>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}

        <Reveal delay={0.3} className="mt-10 flex justify-center">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-display font-medium rounded-full border border-border bg-bg-raised text-text hover:text-heading hover:border-border-strong transition-colors"
          >
            View my GitHub
            <span aria-hidden="true">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
