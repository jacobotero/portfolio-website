declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

// Set only once initAnalytics() has actually wired up gtag — lets
// trackPageview() no-op with the same guard initAnalytics() uses instead of
// duplicating the measurement-ID/PROD check.
let analyticsEnabled = false

function gtag(...args: unknown[]) {
  window.dataLayer!.push(args)
}

/**
 * Loads Google Analytics (GA4) — only in production builds, and only if a
 * measurement ID is configured, so local dev/test traffic never pollutes
 * real analytics data.
 */
export function initAnalytics() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as
    | string
    | undefined
  if (!measurementId || !import.meta.env.PROD) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  gtag('js', new Date())
  // send_page_view: false — gtag('config', ...) sends its own page_view by
  // default, which would double-count the landing page: once from this
  // call (at module load, before React mounts) and once from the
  // route-change pageview event below firing for that same initial path.
  gtag('config', measurementId, { send_page_view: false })
  analyticsEnabled = true
}

/**
 * Sends a GA4 pageview for a client-side route change. `gtag('config', ...)`
 * has send_page_view disabled (see initAnalytics()), so this is the only
 * source of pageviews — otherwise, with BrowserRouter, a multi-page app
 * would only ever record the landing page of each session. No-ops when
 * analytics was never initialised (no measurement ID, or a non-production
 * build — dev and tests).
 */
export function trackPageview(path: string) {
  if (!analyticsEnabled) return
  // page_location/page_title (not page_path, a Universal Analytics field
  // GA4 doesn't read) — by the time this fires, the route change has
  // already committed, so window.location.href and document.title already
  // reflect `path`. Kept as a parameter so callers (and their tests) can
  // still name which route a call is for.
  void path
  gtag('event', 'page_view', {
    page_location: window.location.href,
    page_title: document.title,
  })
}
