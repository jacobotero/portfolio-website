import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Outlet, useLocation } from 'react-router'
import { useAnalyticsPageview } from '../hooks/useAnalyticsPageview'
import { BackToTop } from './BackToTop'
import { Footer } from './Footer'
import { Nav } from './Nav'
import { ScrollToTop } from './ScrollToTop'
import { SocialSidebar } from './SocialSidebar'

export function Layout() {
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()
  useAnalyticsPageview()

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
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <SocialSidebar />
      <BackToTop />
      <Footer />
    </>
  )
}
