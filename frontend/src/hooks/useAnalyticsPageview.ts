import { useEffect } from 'react'
import { trackPageview } from '../lib/analytics'

/**
 * Fires a GA4 pageview for `path`. No-ops when analytics was never
 * initialised — see trackPageview().
 *
 * Takes the path as an argument rather than reading it from the router,
 * because the caller lives inside AnimatePresence: an outgoing wrapper is
 * still mounted during the exit transition and would re-read the router
 * context, firing a pageview for the incoming route before that route has
 * mounted and set its title. Passing the path in freezes each wrapper to the
 * route it belongs to.
 */
export function useAnalyticsPageview(path: string) {
  useEffect(() => {
    trackPageview(path)
  }, [path])
}
