import { afterEach, describe, expect, it, vi } from 'vitest'

// `analyticsEnabled` is module-level state, flipped only by a successful
// initAnalytics() call — each test gets a fresh module instance so one
// test's init doesn't leak into another's.
afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
  delete (window as unknown as { dataLayer?: unknown[] }).dataLayer
})

describe('trackPageview', () => {
  it('no-ops when analytics was never initialised (no measurement ID / non-prod)', async () => {
    const { trackPageview } = await import('./analytics')
    expect(() => trackPageview('/projects')).not.toThrow()
    expect(window.dataLayer).toBeUndefined()
  })

  it('no-ops even if initAnalytics() ran but had no measurement ID configured', async () => {
    vi.stubEnv('PROD', true)
    const { initAnalytics, trackPageview } = await import('./analytics')
    initAnalytics()
    trackPageview('/projects')
    expect(window.dataLayer).toBeUndefined()
  })

  it('pushes a page_view event once analytics has actually been initialised', async () => {
    vi.stubEnv('PROD', true)
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123')
    const { initAnalytics, trackPageview } = await import('./analytics')

    initAnalytics()
    trackPageview('/projects/donortrack')

    // page_location/page_title, not page_path — page_path is a Universal
    // Analytics field GA4 doesn't read (FIX C). gtag auto-populates
    // page_location from document.location if omitted, but the event sends
    // it explicitly rather than relying on that.
    expect(window.dataLayer).toEqual(
      expect.arrayContaining([
        [
          'event',
          'page_view',
          { page_location: window.location.href, page_title: document.title },
        ],
      ]),
    )
  })

  it('disables gtag config\'s automatic page_view so the landing page is not double-counted', async () => {
    vi.stubEnv('PROD', true)
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123')
    const { initAnalytics } = await import('./analytics')

    initAnalytics()

    // Without send_page_view: false, gtag('config', ...) fires its own
    // page_view for the landing path, and the route-change hook then fires
    // a second page_view for that same path when Layout mounts (FIX B).
    expect(window.dataLayer).toEqual(
      expect.arrayContaining([
        ['config', 'G-TEST123', { send_page_view: false }],
      ]),
    )
  })
})
