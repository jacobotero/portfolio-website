import { Outlet } from 'react-router'
import { ScrollToTop } from './ScrollToTop'

export function Layout() {
  return (
    <>
      <ScrollToTop />
      <main>
        <Outlet />
      </main>
    </>
  )
}
