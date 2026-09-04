import { Outlet } from 'react-router'
import { Nav } from './Nav'
import { ScrollToTop } from './ScrollToTop'

export function Layout() {
  return (
    <>
      <ScrollToTop />
      <Nav />
      <main>
        <Outlet />
      </main>
    </>
  )
}
