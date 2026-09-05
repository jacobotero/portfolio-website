import { useEffect, useState } from 'react'

const GITHUB_USERNAME = 'jacobotero'
const CACHE_KEY = `github-stats-${GITHUB_USERNAME}`
/** Navigating between pages within a visit shouldn't re-fetch — GitHub's
    unauthenticated REST API caps each visitor's own browser at 60
    requests/hour, and this data doesn't change fast enough to need fresher
    than this anyway. */
const CACHE_TTL_MS = 30 * 60 * 1000

export interface GitHubRepo {
  name: string
  htmlUrl: string
  description: string | null
  language: string | null
  stars: number
}

export interface GitHubStats {
  publicRepos: number
  followers: number
  repos: GitHubRepo[]
}

export type GitHubStatsState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: GitHubStats }

interface CacheEntry {
  fetchedAt: number
  data: GitHubStats
}

function readCache(): GitHubStats | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null
    return entry.data
  } catch {
    return null // Private browsing, corrupt entry, storage disabled, etc.
  }
}

function writeCache(data: GitHubStats) {
  try {
    const entry: CacheEntry = { fetchedAt: Date.now(), data }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch {
    // Storage unavailable — the widget still works, it just re-fetches next
    // time instead of failing anything now.
  }
}

interface RawGitHubUser {
  public_repos: number
  followers: number
}

interface RawGitHubRepo {
  name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
}

/**
 * Fetches live public GitHub activity — repo count, followers, and the 3
 * most recently pushed repos — directly from GitHub's public REST API. No
 * auth token (nothing to leak client-side; only public, unauthenticated
 * endpoints), and cached in sessionStorage so revisiting pages in the same
 * browser tab doesn't refetch. Never throws: callers get a plain 'error'
 * status to degrade gracefully instead of breaking the page.
 */
export function useGitHubStats(): GitHubStatsState {
  const [state, setState] = useState<GitHubStatsState>(() => {
    const cached = readCache()
    return cached ? { status: 'ready', data: cached } : { status: 'loading' }
  })

  useEffect(() => {
    // The lazy initializer above already served a fresh cache synchronously
    // — nothing to fetch. Deliberately empty deps: this must run exactly
    // once on mount, never again when the setState calls below change
    // `state`, or an error status would retrigger an immediate retry loop.
    if (readCache()) return
    let cancelled = false

    async function load() {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
          fetch(
            `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=3`,
          ),
        ])
        if (!userRes.ok || !reposRes.ok) {
          throw new Error('GitHub API request failed')
        }
        const user = (await userRes.json()) as RawGitHubUser
        const rawRepos = (await reposRes.json()) as RawGitHubRepo[]

        const data: GitHubStats = {
          publicRepos: user.public_repos,
          followers: user.followers,
          repos: rawRepos.map((r) => ({
            name: r.name,
            htmlUrl: r.html_url,
            description: r.description,
            language: r.language,
            stars: r.stargazers_count,
          })),
        }

        if (cancelled) return
        writeCache(data)
        setState({ status: 'ready', data })
      } catch {
        if (!cancelled) setState({ status: 'error' })
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
