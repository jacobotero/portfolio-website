import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from '../App'
import { ThemeProvider } from '../context/ThemeProvider'

function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

/** The element AnimatePresence animates; its inline style carries the tween. */
function transitionWrapper() {
  return document.querySelector('main')?.firstElementChild ?? null
}

function opacityOf(el: Element | null) {
  const style = el?.getAttribute('style') ?? ''
  const match = style.match(/opacity:\s*([\d.]+)/)
  // No inline opacity means the tween finished and motion cleaned it up.
  return match ? Number(match[1]) : 1
}

async function clickNav(label: string, href: string) {
  const user = userEvent.setup()
  const link = screen
    .getAllByRole('link', { name: label })
    .find((el) => el.getAttribute('href') === href)
  if (!link) throw new Error(`No nav link ${label} -> ${href}`)
  await user.click(link)
}

describe('Layout page transitions', () => {
  it('leaves the destination page visible after navigating to Home', async () => {
    renderAt('/projects')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Projects/i,
    )

    await clickNav('Home', '/')

    // The outgoing element is mid-exit here, animating toward opacity 0. It
    // must still be showing the page it belongs to. The regression this
    // guards against is <Outlet /> being read inside AnimatePresence: Outlet
    // resolves the *current* route at render time, so the exiting element
    // swaps to the destination's content and then fades it to nothing. The
    // visible result is that the page you just navigated to goes blank.
    expect(opacityOf(transitionWrapper())).toBeLessThan(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Projects/i,
    )

    // And once the transition finishes, the destination is fully visible.
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          /Jacob Otero/i,
        )
        expect(opacityOf(transitionWrapper())).toBe(1)
      },
      { timeout: 3000 },
    )
  })

  it('leaves the destination page visible navigating away from Home', async () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Jacob Otero/i,
    )

    await clickNav('Experience', '/experience')

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
          /Experience/i,
        )
        expect(opacityOf(transitionWrapper())).toBe(1)
      },
      { timeout: 3000 },
    )
  })
})
