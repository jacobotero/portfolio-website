import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GitHubActivity } from './GitHubActivity'

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

describe('GitHubActivity', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('always links out to the GitHub profile, even before data loads', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    ) // never resolves
    render(<GitHubActivity />)

    expect(screen.getByRole('link', { name: /view my github/i })).toHaveAttribute(
      'href',
      'https://github.com/jacobotero',
    )
  })

  it('shows live stats and recent repos once loaded', async () => {
    vi.stubGlobal('fetch', mockFetchSuccess())
    render(<GitHubActivity />)

    expect(await screen.findByText('12')).toBeInTheDocument() // public repos
    expect(screen.getByText('4')).toBeInTheDocument() // followers
    expect(
      screen.getByRole('link', { name: /portfolio-website/i }),
    ).toHaveAttribute('href', 'https://github.com/jacobotero/portfolio-website')
    expect(screen.getByText('My portfolio site')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('★ 3')).toBeInTheDocument()
  })

  it('degrades to just the GitHub link, without breaking the page, when the API fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('network down'))),
    )
    render(<GitHubActivity />)

    await waitFor(() =>
      expect(
        screen.queryByText(/loading recent activity/i),
      ).not.toBeInTheDocument(),
    )
    // No stats or repo cards rendered, but the page isn't broken — the
    // heading and the always-present GitHub link are both still there.
    expect(screen.getByText('GitHub Activity')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view my github/i })).toBeInTheDocument()
    expect(screen.queryByText('Public repos')).not.toBeInTheDocument()
  })
})
