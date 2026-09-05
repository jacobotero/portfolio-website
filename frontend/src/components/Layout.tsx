import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useLocation, useOutlet } from 'react-router'
import { useAnalyticsPageview } from '../hooks/useAnalyticsPageview'
import { AssistantWidget } from './AssistantWidget'
import { BackToTop } from './BackToTop'
import { Footer } from './Footer'
import { Nav } from './Nav'
import { ScrollToTop } from './ScrollToTop'
import { SocialSidebar } from './SocialSidebar'

/**
 * Reports the pageview for one route. Lives inside the keyed transition
 * wrapper and is rendered after the page itself, so it mounts only once the
 * incoming page is on screen and its own useDocumentTitle effect has already
 * run — a pageview should count when the page is actually displayed, and its
 * title should be the one the visitor sees.
 */
function PageviewReporter({ path }: { path: string }) {
  useAnalyticsPageview(path)
  return null
}

export function Layout() {
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()

  // useOutlet() resolves the current route to an element *value*, whereas
  // <Outlet /> is a component that re-reads the router context whenever it
  // renders. That difference matters inside AnimatePresence: the exiting
  // wrapper is a retained React element, so with <Outlet /> it would re-read
  // the context, swap to the destination's content, and then animate that
  // content to opacity 0 — the page you navigated to visibly fading to blank.
  // Capturing the element here freezes each wrapper to the route it belongs
  // to, so the outgoing one keeps showing the page it is actually leaving.
  const outlet = useOutlet()

  return (
    <>
      <ScrollToTop />
      <Nav />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
            }
          >
            {outlet}
            <PageviewReporter path={pathname} />
          </motion.div>
        </AnimatePresence>
      </main>
      <SocialSidebar />
      <BackToTop />
      <Footer />
      {/* Outside AnimatePresence/the keyed page wrapper deliberately: it's
          persistent chrome, not page content — mounting it inside would
          remount it (and lose the conversation) on every route change. */}
      <AssistantWidget />
    </>
  )
}
