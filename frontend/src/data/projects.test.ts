import { describe, expect, it } from 'vitest'
import { allTech, getProject, projects } from './projects'

describe('projects data', () => {
  it('has five projects', () => {
    expect(projects).toHaveLength(5)
  })

  it('has three featured projects for the home page', () => {
    expect(projects.filter((p) => p.featured)).toHaveLength(3)
  })

  it('gives every project a unique slug', () => {
    const slugs = projects.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('looks up a project by slug', () => {
    expect(getProject('donortrack')?.title).toBe('DonorTrack')
  })

  it('returns undefined for an unknown slug', () => {
    expect(getProject('nope')).toBeUndefined()
  })

  it('exposes a live URL only for DonorTrack and the portfolio site itself', () => {
    const withLive = projects.filter((p) => p.live)
    expect(withLive.map((p) => p.slug).sort()).toEqual([
      'donortrack',
      'portfolio-infrastructure',
    ])
  })

  it('returns a sorted, deduplicated tech list', () => {
    const tech = allTech()
    expect(new Set(tech).size).toBe(tech.length)
    expect([...tech].sort()).toEqual(tech)
  })

  it('gives every project a cover path and at least two highlights', () => {
    for (const project of projects) {
      expect(project.cover).toMatch(/^\/covers\/.+\.svg$/)
      expect(project.highlights.length).toBeGreaterThanOrEqual(2)
    }
  })
})
