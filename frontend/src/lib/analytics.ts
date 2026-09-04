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
  gtag('config', measurementId)
  analyticsEnabled = true
}

/**
 * Sends a GA4 pageview for a client-side route change. `gtag('config', ...)`
 * only fires once, at module load, so with BrowserRouter a multi-page app
 * otherwise only ever records the landing page of each session. No-ops when
 * analytics was never initialised (no measurement ID, or a non-production
 * build — dev and tests).
 */
export function trackPageview(path: string) {
  if (!analyticsEnabled) return
  gtag('event', 'page_view', { page_path: path })
}
