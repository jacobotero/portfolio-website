import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGitHubStats } from './useGitHubStats'

const CACHE_KEY = 'github-stats-jacobotero'

function mockFetchSuccess() {
  return vi.fn((url: string) => {
    if (url.includes('/repos')) {
      return Promise.resolve({
        ok: true,
        json: async () => [
          {
            name: 'portfolio-website',
            html_url: 'https://github.com/jacobotero/portfolio-website',
            description: 'My portfolio site',
            language: 'TypeScript',
            stargazers_count: 3,
          },
        ],
      })
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({ public_repos: 12, followers: 4 }),
    })
  })
}

describe('useGitHubStats', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    sessionStorage.clear()
  })

  it('starts in loading and resolves to ready with mapped data', async () => {
    vi.stubGlobal('fetch', mockFetchSuccess())

    const { result } = renderHook(() => useGitHubStats())
    expect(result.current.status).toBe('loading')

    await waitFor(() => expect(result.current.status).toBe('ready'))
    if (result.current.status !== 'ready') throw new Error('unreachable')
    expect(result.current.data).toEqual({
      publicRepos: 12,
      followers: 4,
      repos: [
        {
          name: 'portfolio-website',
          htmlUrl: 'https://github.com/jacobotero/portfolio-website',
          description: 'My portfolio site',
          language: 'TypeScript',
          stars: 3,
        },
      ],
    })
  })

  it('resolves to error when the API responds not-ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false, json: async () => ({}) })),
    )

    const { result } = renderHook(() => useGitHubStats())
    await waitFor(() => expect(result.current.status).toBe('error'))
  })

  it('resolves to error when the request itself rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('network down'))),
    )

    const { result } = renderHook(() => useGitHubStats())
    await waitFor(() => expect(result.current.status).toBe('error'))
  })

  it('serves a fresh cache entry immediately without calling fetch', () => {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        fetchedAt: Date.now(),
        data: { publicRepos: 9, followers: 1, repos: [] },
      }),
    )
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useGitHubStats())

    expect(result.current).toEqual({
      status: 'ready',
      data: { publicRepos: 9, followers: 1, repos: [] },
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('ignores an expired cache entry and fetches fresh instead', async () => {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        fetchedAt: Date.now() - 31 * 60 * 1000, // 31 minutes old, past the 30m TTL
        data: { publicRepos: 999, followers: 999, repos: [] },
      }),
    )
    vi.stubGlobal('fetch', mockFetchSuccess())

    const { result } = renderHook(() => useGitHubStats())
    // Starts loading rather than serving the stale 999s straight from cache.
    expect(result.current.status).toBe('loading')

    await waitFor(() => expect(result.current.status).toBe('ready'))
    if (result.current.status !== 'ready') throw new Error('unreachable')
    expect(result.current.data.publicRepos).toBe(12)
  })
})
