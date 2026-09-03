declare global {
  interface Window {
    dataLayer?: unknown[]
  }
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
  function gtag(...args: unknown[]) {
    window.dataLayer!.push(args)
  }
  gtag('js', new Date())
  gtag('config', measurementId)
}
