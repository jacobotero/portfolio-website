import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { trackPageview } from '../lib/analytics'

/** Fires a GA4 pageview whenever the route changes. No-ops when analytics
 * was never initialised — see trackPageview(). */
export function useAnalyticsPageview() {
  const { pathname } = useLocation()

  useEffect(() => {
    trackPageview(pathname)
  }, [pathname])
}
