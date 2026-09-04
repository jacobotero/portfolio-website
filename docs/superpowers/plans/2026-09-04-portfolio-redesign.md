# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark-terminal single-page portfolio with a violet starfield multi-page site modeled on achyutkatiyar.com, with light/dark theming and four project case-study pages.

**Architecture:** Stay on Vite 8 + React 19 + Tailwind v4. Add `react-router` v7 for real routes (CloudFront already falls back to `/index.html` on 404) and `motion` for the sliding nav indicator, page transitions, and scroll reveals. Colors are plain CSS custom properties swapped by a `data-theme` attribute on `<html>` and mapped into Tailwind via `@theme inline`, so no component hardcodes a color. The starfield is a canvas scoped to each page's hero band, not the viewport, so it stops costing anything once scrolled past.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS v4, react-router 7, motion (Framer Motion), Vitest + React Testing Library, @fontsource-variable (Outfit, Inter)

**Spec:** `docs/superpowers/specs/2026-09-04-portfolio-redesign-design.md`

## Global Constraints

- **No infrastructure or CI/CD changes.** `infra/` and `.github/workflows/` are not touched by any task in this plan.
- **Contact form logic is preserved verbatim.** The email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, the empty-field check, the `VITE_CONTACT_API_URL` guard, the POST body shape `{name, email, message}`, and the four status states (`idle | submitting | success | error`) are copied unchanged from `frontend/src/components/Contact.tsx`. Only markup and classes change.
- **No color is hardcoded in a component.** Every color comes from a Tailwind utility backed by a CSS variable. A literal hex in a `.tsx` file is a defect.
- **Dark palette:** `--bg #0b0a12`, `--bg-raised #14121d`, `--bg-elevated #1b1826`, `--border #232030`, `--border-strong #322e42`, `--text #c4c1cf`, `--text-dim #8b8794`, `--heading #f5f3ff`, `--accent #a78bfa`, `--accent-strong #8b5cf6`, `--accent-contrast #0b0a12`.
- **Light palette:** `--bg #f7f7fa`, `--bg-raised #ffffff`, `--bg-elevated #f2f1f6`, `--border #e5e3ec`, `--border-strong #d3d0dd`, `--text #45414f`, `--text-dim #6f6b7c`, `--heading #16141d`, `--accent #7c3aed`, `--accent-strong #6d28d9`, `--accent-contrast #ffffff`.
- **Fonts:** Outfit for headings/buttons/brand, Inter for body/labels/pills. Self-hosted via `@fontsource-variable`. Never link fonts.googleapis.com.
- **Radii:** cards `rounded-2xl`, pills/nav/icon-buttons `rounded-full`, inputs `rounded-xl`.
- **`prefers-reduced-motion: reduce` must resolve every animation to its end state instantly.** Content is never left hidden from a reduced-motion visitor.
- **All `localStorage` access is wrapped in try/catch.** Blocked storage must not break rendering.
- **Every task ends with `npm run build`, `npm run lint`, and `npm test` passing**, run from `frontend/`.
- Commit messages use plain sentence case and carry the trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

---

### Task 1: Dependencies, fonts, and the design token system

Foundation for everything else. No component changes yet — this task only establishes that the tokens exist and both themes resolve.

**Files:**
- Modify: `frontend/package.json` (via npm install)
- Rewrite: `frontend/src/index.css`
- Modify: `frontend/index.html`
- Modify: `frontend/src/main.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: Tailwind utilities `bg-bg`, `bg-bg-raised`, `bg-bg-elevated`, `border-border`, `border-border-strong`, `text-text`, `text-text-dim`, `text-heading`, `text-accent`, `bg-accent`, `text-accent-strong`, `text-accent-contrast`, plus `font-display` (Outfit) and `font-sans` (Inter). CSS variables `--c-star` (an "R, G, B" triplet string) and `--c-glow` (a full rgba color) for Task 5.

- [ ] **Step 1: Install dependencies**

```bash
cd frontend
npm install react-router motion @fontsource-variable/outfit @fontsource-variable/inter
```

- [ ] **Step 2: Verify the installed versions and import paths**

```bash
npm ls react-router motion @fontsource-variable/outfit @fontsource-variable/inter
```

Expected: `react-router@7.x`, `motion@12.x` or later, both fontsource packages resolved. If `motion` resolves below 11, stop — the `motion/react` import path used throughout this plan requires 11+. If `react-router` resolves below 7, stop — v6 requires the separate `react-router-dom` package and the imports in Task 3 will not resolve.

- [ ] **Step 3: Replace `frontend/src/index.css` entirely**

```css
@import "tailwindcss";
@import "@fontsource-variable/outfit";
@import "@fontsource-variable/inter";

/* Dark is the default. The inline script in index.html always sets an
   explicit data-theme before paint, so neither state depends on the other. */
:root {
  --c-bg: #0b0a12;
  --c-bg-raised: #14121d;
  --c-bg-elevated: #1b1826;
  --c-border: #232030;
  --c-border-strong: #322e42;
  --c-text: #c4c1cf;
  --c-text-dim: #8b8794;
  --c-heading: #f5f3ff;
  --c-accent: #a78bfa;
  --c-accent-strong: #8b5cf6;
  --c-accent-contrast: #0b0a12;
  --c-star: 255, 255, 255;
  --c-glow: rgba(167, 139, 250, 0.15);
  color-scheme: dark;
}

[data-theme="light"] {
  --c-bg: #f7f7fa;
  --c-bg-raised: #ffffff;
  --c-bg-elevated: #f2f1f6;
  --c-border: #e5e3ec;
  --c-border-strong: #d3d0dd;
  --c-text: #45414f;
  --c-text-dim: #6f6b7c;
  --c-heading: #16141d;
  --c-accent: #7c3aed;
  --c-accent-strong: #6d28d9;
  --c-accent-contrast: #ffffff;
  --c-star: 90, 80, 120;
  --c-glow: rgba(124, 58, 237, 0.10);
  color-scheme: light;
}

/* `inline` makes the generated utilities emit var(--c-*) rather than baking
   in the value, which is what lets the data-theme swap work at runtime. */
@theme inline {
  --color-bg: var(--c-bg);
  --color-bg-raised: var(--c-bg-raised);
  --color-bg-elevated: var(--c-bg-elevated);
  --color-border: var(--c-border);
  --color-border-strong: var(--c-border-strong);
  --color-text: var(--c-text);
  --color-text-dim: var(--c-text-dim);
  --color-heading: var(--c-heading);
  --color-accent: var(--c-accent);
  --color-accent-strong: var(--c-accent-strong);
  --color-accent-contrast: var(--c-accent-contrast);

  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Outfit Variable", "Inter Variable", ui-sans-serif, sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: var(--c-bg);
  color: var(--c-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  color: var(--c-heading);
}

::selection {
  background: var(--c-accent);
  color: var(--c-accent-contrast);
}

::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: var(--c-bg);
}
::-webkit-scrollbar-thumb {
  background: var(--c-border-strong);
  border-radius: 999px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--c-accent);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Replace the `<head>` of `frontend/index.html`**

Remove the two `fonts.googleapis.com`/`fonts.gstatic.com` preconnects and the stylesheet `<link>` entirely. Add the pre-paint theme script as the first element inside `<head>` after the charset meta. Update the copy to match the new hero.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script>
      // Runs before first paint so the page never flashes the wrong theme.
      (function () {
        try {
          var stored = localStorage.getItem('theme');
          if (stored !== 'light' && stored !== 'dark') {
            stored = window.matchMedia('(prefers-color-scheme: light)').matches
              ? 'light'
              : 'dark';
          }
          document.documentElement.setAttribute('data-theme', stored);
        } catch (e) {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
      })();
    </script>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="Jacob Otero — Software Engineer, AI Engineer, Cloud Engineer. CS senior building full-stack products and the AWS infrastructure they run on."
    />
    <title>Jacob Otero — Software Engineer</title>

    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://jacobotero.dev" />
    <meta property="og:title" content="Jacob Otero — Software Engineer" />
    <meta
      property="og:description"
      content="Software Engineer · AI Engineer · Cloud Engineer"
    />
    <meta property="og:image" content="https://jacobotero.dev/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Jacob Otero — Software Engineer" />
    <meta
      name="twitter:description"
      content="Software Engineer · AI Engineer · Cloud Engineer"
    />
    <meta name="twitter:image" content="https://jacobotero.dev/og-image.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Verify the build compiles and both themes resolve**

```bash
cd frontend && npm run build
```

Expected: build succeeds. Then confirm the token system actually emitted variable-backed utilities rather than baked values:

```bash
grep -o "var(--c-bg)" dist/assets/*.css | head -1
```

Expected: at least one match. An empty result means `@theme inline` was written as plain `@theme` — fix before continuing.

- [ ] **Step 6: Verify the font files were bundled and no Google Fonts request survives**

```bash
ls dist/assets/*.woff2 | head -4
grep -c "fonts.googleapis.com" dist/index.html
```

Expected: woff2 files present; the grep count is `0`.

- [ ] **Step 7: Commit**

```bash
git add frontend/package.json frontend/package-lock.json frontend/src/index.css frontend/index.html
git commit -m "Add violet design tokens, self-hosted fonts, and theme bootstrap

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Theme provider, hook, and toggle

**Files:**
- Create: `frontend/src/context/ThemeProvider.tsx`
- Create: `frontend/src/hooks/useTheme.ts`
- Create: `frontend/src/components/ThemeToggle.tsx`
- Create: `frontend/src/components/ThemeToggle.test.tsx`
- Modify: `frontend/src/test/setup.ts`

**Interfaces:**
- Consumes: color utilities from Task 1
- Produces: `<ThemeProvider>` (wraps the app in Task 3), `useTheme(): { theme: 'light' | 'dark'; toggleTheme: () => void }`, `<ThemeToggle />`

- [ ] **Step 1: Add jsdom stubs to `frontend/src/test/setup.ts`**

jsdom implements none of `matchMedia`, `IntersectionObserver`, or a canvas 2D context. Stub all three once here so every test file gets them.

```ts
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

if (typeof window.matchMedia !== 'function') {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

if (typeof globalThis.IntersectionObserver === 'undefined') {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
}

// jsdom has no canvas implementation; components must tolerate a null context.
HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never
```

- [ ] **Step 2: Write the failing test `frontend/src/components/ThemeToggle.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../context/ThemeProvider'
import { ThemeToggle } from './ThemeToggle'

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  )
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.setAttribute('data-theme', 'dark')
  })

  it('flips data-theme on the document when clicked', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(screen.getByRole('button', { name: /theme/i }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')

    await user.click(screen.getByRole('button', { name: /theme/i }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('persists the chosen theme to localStorage', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(screen.getByRole('button', { name: /theme/i }))
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('honors a theme already stored in localStorage', () => {
    localStorage.setItem('theme', 'light')
    renderToggle()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('still renders when localStorage throws', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => renderToggle()).not.toThrow()
    expect(screen.getByRole('button', { name: /theme/i })).toBeInTheDocument()
    spy.mockRestore()
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
cd frontend && npx vitest run src/components/ThemeToggle.test.tsx
```

Expected: FAIL — cannot resolve `../context/ThemeProvider` and `./ThemeToggle`.

- [ ] **Step 4: Create `frontend/src/context/ThemeProvider.tsx`**

```tsx
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Storage can be blocked (private mode, browser setting) — fall through.
  }
  try {
    if (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    ) {
      return 'light'
    }
  } catch {
    // matchMedia unavailable — fall through to the dark default.
  }
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readStoredTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // Persisting is best-effort; the in-memory theme still applies.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
```

- [ ] **Step 5: Create `frontend/src/hooks/useTheme.ts`**

```ts
import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeProvider'

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used inside a ThemeProvider')
  }
  return context
}
```

- [ ] **Step 6: Create `frontend/src/components/ThemeToggle.tsx`**

```tsx
import { useTheme } from '../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} theme`}
      title={`Switch to ${nextTheme} theme`}
      className="w-9 h-9 flex items-center justify-center rounded-full text-text-dim hover:text-accent hover:bg-bg-elevated transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden="true"
      >
        {theme === 'dark' ? (
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        ) : (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </>
        )}
      </svg>
    </button>
  )
}
```

- [ ] **Step 7: Run the test to verify it passes**

```bash
cd frontend && npx vitest run src/components/ThemeToggle.test.tsx
```

Expected: PASS, 4 tests.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/context frontend/src/hooks/useTheme.ts frontend/src/components/ThemeToggle.tsx frontend/src/components/ThemeToggle.test.tsx frontend/src/test/setup.ts
git commit -m "Add theme provider, useTheme hook, and toggle

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: Router shell and stub pages

Establishes routing and the persistent layout. Pages are stubs here; later tasks fill them in. The site is intentionally ugly at the end of this task but fully navigable.

**Files:**
- Rewrite: `frontend/src/App.tsx`
- Modify: `frontend/src/main.tsx`
- Create: `frontend/src/components/Layout.tsx`
- Create: `frontend/src/components/ScrollToTop.tsx`
- Create: `frontend/src/pages/Home.tsx`, `ProjectsPage.tsx`, `ProjectDetail.tsx`, `ExperiencePage.tsx`, `ContactPage.tsx`, `NotFound.tsx`
- Create: `frontend/src/App.test.tsx`

**Interfaces:**
- Consumes: `ThemeProvider` from Task 2
- Produces: routes `/`, `/projects`, `/projects/:slug`, `/experience`, `/contact`, `*`. `<Layout />` renders `<Outlet />` between the nav and footer slots.

- [ ] **Step 1: Write the failing test `frontend/src/App.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AppRoutes } from './App'
import { ThemeProvider } from './context/ThemeProvider'

function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('routing', () => {
  it('renders the home page at /', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Jacob Otero/i)
  })

  it('renders the projects page at /projects', () => {
    renderAt('/projects')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Projects/i)
  })

  it('renders the experience page at /experience', () => {
    renderAt('/experience')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Experience/i)
  })

  it('renders the contact page at /contact', () => {
    renderAt('/contact')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/touch|Contact/i)
  })

  it('renders a not-found page for an unknown route', () => {
    renderAt('/nope')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/not found/i)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd frontend && npx vitest run src/App.test.tsx
```

Expected: FAIL — `AppRoutes` is not exported from `./App`.

- [ ] **Step 3: Create the six stub pages**

Each is a placeholder that later tasks replace. `frontend/src/pages/Home.tsx`:

```tsx
export function Home() {
  return <h1>Jacob Otero</h1>
}
```

`frontend/src/pages/ProjectsPage.tsx`:

```tsx
export function ProjectsPage() {
  return <h1>My Projects</h1>
}
```

`frontend/src/pages/ProjectDetail.tsx`:

```tsx
import { useParams } from 'react-router'

export function ProjectDetail() {
  const { slug } = useParams()
  return <h1>{slug}</h1>
}
```

`frontend/src/pages/ExperiencePage.tsx`:

```tsx
export function ExperiencePage() {
  return <h1>Experience</h1>
}
```

`frontend/src/pages/ContactPage.tsx`:

```tsx
export function ContactPage() {
  return <h1>Get in touch</h1>
}
```

`frontend/src/pages/NotFound.tsx`:

```tsx
import { Link } from 'react-router'

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-accent font-display text-sm tracking-widest">404</p>
      <h1 className="text-4xl">Page not found</h1>
      <p className="text-text-dim">That page doesn't exist.</p>
      <Link
        to="/"
        className="mt-2 px-5 py-2.5 text-sm font-display rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors"
      >
        Back home
      </Link>
    </div>
  )
}
```

- [ ] **Step 4: Create `frontend/src/components/ScrollToTop.tsx`**

Route changes must land at the top of the new page, which react-router does not do on its own.

```tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router'

export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return null
}
```

- [ ] **Step 5: Create `frontend/src/components/Layout.tsx`**

Nav, sidebar, back-to-top, and footer are added in Tasks 4 and 15. This is the slot structure they land in.

```tsx
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
```

- [ ] **Step 6: Rewrite `frontend/src/App.tsx`**

`AppRoutes` is exported separately from the default `App` so tests can supply their own `MemoryRouter`.

```tsx
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { ContactPage } from './pages/ContactPage'
import { ExperiencePage } from './pages/ExperiencePage'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { ProjectDetail } from './pages/ProjectDetail'
import { ProjectsPage } from './pages/ProjectsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
```

- [ ] **Step 7: Update `frontend/src/main.tsx` to wrap in ThemeProvider**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeProvider'
import { initAnalytics } from './lib/analytics'

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
```

- [ ] **Step 8: Run the routing test**

```bash
cd frontend && npx vitest run src/App.test.tsx
```

Expected: PASS, 5 tests. The old `Nav.test.tsx` and `Contact.test.tsx` will now fail because their components still reference deleted styling; leave them failing until Tasks 4 and 14 rewrite them, and do not run the full suite as a gate for this task.

- [ ] **Step 9: Verify the build**

```bash
cd frontend && npm run build && npm run lint
```

Expected: both succeed.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/App.tsx frontend/src/App.test.tsx frontend/src/main.tsx frontend/src/pages frontend/src/components/Layout.tsx frontend/src/components/ScrollToTop.tsx
git commit -m "Add react-router shell with five routes and stub pages

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 4: Floating pill nav with sliding active indicator

**Files:**
- Rewrite: `frontend/src/components/Nav.tsx`
- Rewrite: `frontend/src/components/Nav.test.tsx`
- Modify: `frontend/src/components/Layout.tsx`

**Interfaces:**
- Consumes: `ThemeToggle` from Task 2, routes from Task 3
- Produces: `<Nav />`, and the exported constant `NAV_LINKS: { label: string; to: string }[]` reused by the footer in Task 15

- [ ] **Step 1: Replace `frontend/src/components/Nav.test.tsx` entirely**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '../context/ThemeProvider'
import { Nav } from './Nav'

function renderNav(path = '/') {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <Nav />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('Nav', () => {
  it('renders every top-level link', () => {
    renderNav()
    for (const label of ['Home', 'Projects', 'Experience', 'Contact']) {
      expect(
        screen.getAllByRole('link', { name: label }).length,
      ).toBeGreaterThan(0)
    }
  })

  it('marks the current route as the active page', () => {
    renderNav('/projects')
    const active = screen
      .getAllByRole('link', { name: 'Projects' })
      .find((el) => el.getAttribute('aria-current') === 'page')
    expect(active).toBeDefined()
  })

  it('does not mark a non-current route as active', () => {
    renderNav('/projects')
    const home = screen
      .getAllByRole('link', { name: 'Home' })
      .find((el) => el.getAttribute('aria-current') === 'page')
    expect(home).toBeUndefined()
  })

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup()
    renderNav()

    const trigger = screen.getByRole('button', { name: /open menu/i })
    await user.click(trigger)
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close menu/i }))
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
  })

  it('renders the brand as a link home', () => {
    renderNav('/contact')
    expect(screen.getByRole('link', { name: /jacob otero/i })).toHaveAttribute(
      'href',
      '/',
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd frontend && npx vitest run src/components/Nav.test.tsx
```

Expected: FAIL — the current `Nav` renders anchor links, not router links, and has no menu button with that label.

- [ ] **Step 3: Replace `frontend/src/components/Nav.tsx` entirely**

The active pill is a `motion.span` sharing a `layoutId` across links, which is what produces the slide. `useReducedMotion` disables the spring so it snaps instead.

```tsx
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Link, NavLink, useLocation } from 'react-router'
import { ThemeToggle } from './ThemeToggle'

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Experience', to: '/experience' },
  { label: 'Contact', to: '/contact' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const { pathname } = useLocation()

  return (
    <header className="fixed top-4 inset-x-0 z-40 px-4">
      <nav className="mx-auto max-w-4xl rounded-full border border-border bg-bg-raised/80 backdrop-blur-md px-4 sm:px-5 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="font-display font-bold text-heading tracking-tight hover:text-accent transition-colors"
        >
          Jacob Otero
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active =
              link.to === '/' ? pathname === '/' : pathname.startsWith(link.to)
            return (
              <li key={link.to} className="relative">
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={`relative z-10 block px-3.5 py-1.5 text-sm rounded-full transition-colors ${
                    active
                      ? 'text-heading'
                      : 'text-text-dim hover:text-heading'
                  }`}
                >
                  {link.label}
                </NavLink>
                {active && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-bg-elevated"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 350, damping: 30 }
                    }
                  />
                )}
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-text-dim hover:text-accent hover:bg-bg-elevated transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              {open ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden mx-auto max-w-4xl mt-2 rounded-2xl border border-border bg-bg-raised/95 backdrop-blur-md p-2"
          >
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 text-sm rounded-xl transition-colors ${
                      isActive
                        ? 'text-heading bg-bg-elevated'
                        : 'text-text-dim hover:text-heading hover:bg-bg-elevated'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  )
}
```

- [ ] **Step 4: Mount the nav in `frontend/src/components/Layout.tsx`**

```tsx
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
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
cd frontend && npx vitest run src/components/Nav.test.tsx
```

Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/Nav.tsx frontend/src/components/Nav.test.tsx frontend/src/components/Layout.tsx
git commit -m "Rebuild nav as floating pill with sliding active indicator

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Starfield canvas and PageHero

**Files:**
- Create: `frontend/src/components/Starfield.tsx`
- Create: `frontend/src/components/Starfield.test.tsx`
- Create: `frontend/src/components/PageHero.tsx`

**Interfaces:**
- Consumes: `--c-star` and `--c-glow` from Task 1
- Produces: `<Starfield />`, and `<PageHero title subtitle fullHeight? children? />` used by every page in Tasks 8-14

- [ ] **Step 1: Write the failing test `frontend/src/components/Starfield.test.tsx`**

```tsx
import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Starfield } from './Starfield'

describe('Starfield', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders without throwing when the 2D context is unavailable', () => {
    expect(() => render(<Starfield />)).not.toThrow()
  })

  it('starts no animation frame loop when reduced motion is preferred', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    )
    const raf = vi.spyOn(window, 'requestAnimationFrame')

    render(<Starfield />)

    expect(raf).not.toHaveBeenCalled()
  })

  it('renders when IntersectionObserver is unavailable', () => {
    const original = globalThis.IntersectionObserver
    // @ts-expect-error deliberately removing the global for this case
    delete globalThis.IntersectionObserver
    expect(() => render(<Starfield />)).not.toThrow()
    globalThis.IntersectionObserver = original
  })

  it('cleans up its listeners on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Starfield />)
    unmount()
    expect(remove).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd frontend && npx vitest run src/components/Starfield.test.tsx
```

Expected: FAIL — cannot resolve `./Starfield`.

- [ ] **Step 3: Create `frontend/src/components/Starfield.tsx`**

```tsx
import { useEffect, useRef } from 'react'

interface Star {
  x: number // normalized 0-1
  y: number // normalized 0-1
  r: number // radius in CSS px
  alpha: number // base alpha
  phase: number // twinkle offset
  speed: number // twinkle rate
  depth: number // 0-1, drives parallax strength
}

const MAX_STARS = 260
const DRIFT_PER_FRAME = 0.006 // px, a pan measured in minutes
const PARALLAX_PX = 12
const PARALLAX_EASE = 0.06

function createStars(width: number, height: number): Star[] {
  const count = Math.min(MAX_STARS, Math.round((width * height) / 6000))
  const stars: Star[] = []
  for (let i = 0; i < count; i += 1) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random(),
      alpha: 0.15 + Math.random() * 0.75,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
      depth: Math.random(),
    })
  }
  return stars
}

/**
 * Star canvas scoped to the hero band it sits in — not the viewport. It stops
 * animating when scrolled out of view or when the tab is hidden, and draws a
 * single static frame under prefers-reduced-motion.
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let ctx: CanvasRenderingContext2D | null = null
    try {
      ctx = canvas.getContext('2d')
    } catch {
      return // No canvas support (jsdom, exotic browsers) — render nothing.
    }
    if (!ctx) return
    const context = ctx

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let stars: Star[] = []
    let width = 0
    let height = 0
    let drift = 0
    let raf = 0
    let running = false

    // Pointer parallax: target is where the mouse says we should be, current
    // eases toward it so the field glides rather than snaps.
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    function starColor(alpha: number) {
      const triplet =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--c-star')
          .trim() || '255, 255, 255'
      return `rgba(${triplet}, ${alpha})`
    }

    function resize() {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      if (width === 0 || height === 0) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      stars = createStars(width, height)
    }

    function draw(time: number) {
      context.clearRect(0, 0, width, height)
      currentX += (targetX - currentX) * PARALLAX_EASE
      currentY += (targetY - currentY) * PARALLAX_EASE

      for (const star of stars) {
        const twinkle =
          reduceMotion ? 1 : 0.65 + 0.35 * Math.sin(time * 0.001 * star.speed + star.phase)
        let x = star.x * width + drift + currentX * star.depth
        const y = star.y * height + currentY * star.depth
        // Wrap horizontally so the drift never runs out of sky.
        x = ((x % width) + width) % width

        context.beginPath()
        context.arc(x, y, star.r, 0, Math.PI * 2)
        context.fillStyle = starColor(star.alpha * twinkle)
        context.fill()
      }
    }

    function frame(time: number) {
      drift += DRIFT_PER_FRAME
      draw(time)
      raf = window.requestAnimationFrame(frame)
    }

    function start() {
      if (running || reduceMotion) return
      running = true
      raf = window.requestAnimationFrame(frame)
    }

    function stop() {
      if (!running) return
      running = false
      window.cancelAnimationFrame(raf)
    }

    function handlePointer(event: MouseEvent) {
      const rect = canvas.getBoundingClientRect()
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * PARALLAX_PX
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * PARALLAX_PX
    }

    function handleVisibility() {
      if (document.hidden) stop()
      else start()
    }

    resize()
    if (reduceMotion) {
      draw(0) // One static frame — the sky is there, it just doesn't move.
    } else {
      start()
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handlePointer)
    document.addEventListener('visibilitychange', handleVisibility)

    let observer: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== 'undefined' && !reduceMotion) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) start()
          else stop()
        },
        { threshold: 0 },
      )
      observer.observe(canvas)
    }

    return () => {
      stop()
      observer?.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handlePointer)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        maskImage:
          'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
      }}
    />
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd frontend && npx vitest run src/components/Starfield.test.tsx
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Create `frontend/src/components/PageHero.tsx`**

```tsx
import type { ReactNode } from 'react'
import { Starfield } from './Starfield'

interface PageHeroProps {
  title?: string
  subtitle?: string
  /** Home uses the full viewport; inner pages use a shorter band. */
  fullHeight?: boolean
  children?: ReactNode
}

export function PageHero({
  title,
  subtitle,
  fullHeight = false,
  children,
}: PageHeroProps) {
  return (
    <section
      className={`relative overflow-hidden px-6 ${
        fullHeight ? 'min-h-screen flex items-center' : 'pt-36 pb-16'
      }`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, var(--c-glow), transparent 70%)',
        }}
      />
      <Starfield />
      <div className="relative mx-auto max-w-5xl w-full">
        {title && (
          <h1 className="text-center font-display font-extrabold tracking-tight text-[clamp(2.5rem,6vw,4rem)]">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-3 text-center text-text-dim text-[1.0625rem]">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Verify build and lint**

```bash
cd frontend && npm run build && npm run lint
```

Expected: both succeed.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/Starfield.tsx frontend/src/components/Starfield.test.tsx frontend/src/components/PageHero.tsx
git commit -m "Add drifting starfield canvas and shared page hero

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Motion-based Reveal and page transitions

**Files:**
- Rewrite: `frontend/src/components/Reveal.tsx`
- Create: `frontend/src/components/Reveal.test.tsx`
- Modify: `frontend/src/components/Layout.tsx`
- Delete: `frontend/src/hooks/useRevealOnScroll.ts`

**Interfaces:**
- Consumes: `motion` from Task 1
- Produces: `<Reveal delay? className?>` — the single scroll-reveal wrapper used by every section in Tasks 8-15

- [ ] **Step 1: Write the failing test `frontend/src/components/Reveal.test.tsx`**

The point of this test is that content is present in the DOM regardless of animation state — a reveal that hides content from assistive tech or from a reduced-motion visitor is a bug.

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Reveal } from './Reveal'

describe('Reveal', () => {
  it('renders its children', () => {
    render(
      <Reveal>
        <p>visible content</p>
      </Reveal>,
    )
    expect(screen.getByText('visible content')).toBeInTheDocument()
  })

  it('passes through a className', () => {
    const { container } = render(
      <Reveal className="custom-class">
        <p>content</p>
      </Reveal>,
    )
    expect(container.querySelector('.custom-class')).not.toBeNull()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd frontend && npx vitest run src/components/Reveal.test.tsx
```

Expected: PASS against the current `Reveal` — these two assertions describe behavior that must survive the rewrite, not new behavior. They exist as a regression guard: the motion rewrite in Step 3 must not leave content hidden at `opacity: 0` or drop the `className` passthrough. Re-run them after Step 3 and confirm they still pass.

- [ ] **Step 3: Replace `frontend/src/components/Reveal.tsx` entirely**

```tsx
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface RevealProps {
  children: ReactNode
  /** Seconds of stagger; callers pass index * 0.08 for a card grid. */
  delay?: number
  className?: string
}

export function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

- [ ] **Step 4: Delete the superseded hook**

```bash
cd frontend && rm src/hooks/useRevealOnScroll.ts
```

- [ ] **Step 5: Add page transitions in `frontend/src/components/Layout.tsx`**

```tsx
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Outlet, useLocation } from 'react-router'
import { Nav } from './Nav'
import { ScrollToTop } from './ScrollToTop'

export function Layout() {
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()

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
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  )
}
```

- [ ] **Step 6: Run the tests**

```bash
cd frontend && npx vitest run src/components/Reveal.test.tsx src/App.test.tsx
```

Expected: PASS. If `App.test.tsx` now fails on missing route content, the `AnimatePresence` key is wrong — it must be `pathname`, not `location.key`.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/Reveal.tsx frontend/src/components/Reveal.test.tsx frontend/src/components/Layout.tsx
git rm --cached frontend/src/hooks/useRevealOnScroll.ts
git commit -m "Replace reveal hook with motion-based Reveal and add page transitions

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 7: Project data model and generated cover art

Content task. All copy below is drawn from each repository's README — do not add claims that are not in this plan.

**Files:**
- Rewrite: `frontend/src/data/projects.ts`
- Create: `frontend/public/covers/donortrack.svg`, `agv-fault-tracker.svg`, `fanatiq.svg`, `resume-analyzer.svg`
- Create: `frontend/src/data/projects.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `interface Project`, `projects: Project[]`, `getProject(slug: string): Project | undefined`, `allTech(): string[]`

- [ ] **Step 1: Write the failing test `frontend/src/data/projects.test.ts`**

```ts
import { describe, expect, it } from 'vitest'
import { allTech, getProject, projects } from './projects'

describe('projects data', () => {
  it('has four projects', () => {
    expect(projects).toHaveLength(4)
  })

  it('has three featured projects for the home page', () => {
    expect(projects.filter((p) => p.featured)).toHaveLength(3)
  })

  it('gives every project a unique slug', () => {
    const slugs = projects.map((p) => p.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('looks up a project by slug', () => {
    expect(getProject('donortrack')?.title).toBe('DonorTrack')
  })

  it('returns undefined for an unknown slug', () => {
    expect(getProject('nope')).toBeUndefined()
  })

  it('exposes a live URL only for DonorTrack', () => {
    const withLive = projects.filter((p) => p.live)
    expect(withLive).toHaveLength(1)
    expect(withLive[0].slug).toBe('donortrack')
  })

  it('returns a sorted, deduplicated tech list', () => {
    const tech = allTech()
    expect(new Set(tech).size).toBe(tech.length)
    expect([...tech].sort()).toEqual(tech)
  })

  it('gives every project a cover path and at least two highlights', () => {
    for (const project of projects) {
      expect(project.cover).toMatch(/^\/covers\/.+\.svg$/)
      expect(project.highlights.length).toBeGreaterThanOrEqual(2)
    }
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd frontend && npx vitest run src/data/projects.test.ts
```

Expected: FAIL — `allTech` and `getProject` are not exported.

- [ ] **Step 3: Replace `frontend/src/data/projects.ts` entirely**

```ts
export interface Project {
  slug: string
  title: string
  tagline: string
  description: string
  tech: string[]
  highlights: string[]
  cover: string
  github?: string
  live?: string
  featured: boolean
  detail: {
    problem: string
    approach: string[]
    outcome: string[]
    stack: { layer: string; tech: string }[]
  }
}

export const projects: Project[] = [
  {
    slug: 'donortrack',
    title: 'DonorTrack',
    tagline: 'Multi-tenant SaaS for nonprofit donor management',
    description:
      'A production SaaS that replaces spreadsheets for small nonprofits and churches — donor and donation records, IRS-compliant year-end tax letters, and CSV import/export, all inside an isolated per-organization account.',
    tech: [
      'React',
      'TypeScript',
      'Node.js',
      'PostgreSQL',
      'Prisma',
      'Stripe',
      'Tailwind CSS',
      'Docker',
    ],
    highlights: [
      'Live in production, handling the full SaaS lifecycle from free trial through Stripe subscription to cancellation',
      'Multi-tenant architecture with per-organization data isolation enforced by foreign-key scoping at the database level',
      'Server-side PDF generation for IRS-compliant year-end tax letters, downloadable individually or as a batch ZIP',
    ],
    cover: '/covers/donortrack.svg',
    github: 'https://github.com/jacobotero/DonorTrack',
    live: 'https://www.donortrackapp.com',
    featured: true,
    detail: {
      problem:
        'Small nonprofits and churches typically track donors and donations in spreadsheets. That falls apart at year end, when every donor needs an IRS-compliant acknowledgment letter, and it offers no access control, no audit trail, and no safe way for more than one person to work at once.',
      approach: [
        'Built a multi-tenant data model where every record is scoped to an organization by foreign key, so one account can never read another account’s data.',
        'Integrated Stripe for billing — checkout sessions plus subscription lifecycle webhooks, with signature verification against the raw request body.',
        'Added a transactional email pipeline over Resend, driven by a node-cron daily job that checks trial expirations and sends 3-day and 1-day reminders.',
        'Implemented stateless JWT authentication with bcrypt password hashing and middleware-enforced route protection.',
        'Built CSV import and export with validation, per-row error reporting, and donor matching by email.',
        'Generated year-end tax letters server-side with PDFKit, individually or batched into a ZIP.',
        'Added an internal admin panel behind email-gated middleware for extending trials and managing accounts.',
      ],
      outcome: [
        'Running in production at donortrackapp.com with real organizations onboarded.',
        'Sentry error monitoring wired into both frontend and backend with environment-aware initialization.',
        'API-level rate limiting across all routes.',
        'sitemap.xml and robots.txt served and submitted to Google Search Console.',
      ],
      stack: [
        { layer: 'Frontend', tech: 'React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Recharts' },
        { layer: 'Backend', tech: 'Node.js, Prisma 7, PostgreSQL 18' },
        { layer: 'Billing', tech: 'Stripe checkout and subscription webhooks' },
        { layer: 'Email', tech: 'Resend, node-cron' },
        { layer: 'Monitoring', tech: 'Sentry' },
        { layer: 'Deployment', tech: 'Vercel and Railway' },
      ],
    },
  },
  {
    slug: 'agv-fault-tracker',
    title: 'AGV Fault Tracker',
    tagline: 'Fault reporting for automated guided vehicles on the plant floor',
    description:
      'A full-stack web application for tracking and managing faults on automated guided vehicles in a manufacturing environment, built to be reported from a phone at the vehicle rather than from a desk.',
    tech: ['Python', 'Flask', 'MongoDB', 'JavaScript', 'Docker'],
    highlights: [
      'Organizes fault reports by department and resolves them with automatic status updates',
      'Duplicate detection prevents multiple open reports against the same AGV',
      'Supports air-gapped deployment for offline and network-isolated plant environments',
    ],
    cover: '/covers/agv-fault-tracker.svg',
    github: 'https://github.com/jacobotero/agv-fault-tracker',
    featured: true,
    detail: {
      problem:
        'When an automated guided vehicle faults on a manufacturing floor, the person who finds it is standing next to it — not at a computer. Reporting that fault needed to be fast and mobile, and the same vehicle often gets reported repeatedly by different people before anyone resolves it.',
      approach: [
        'Built a Flask backend over MongoDB storing fault reports keyed by AGV number and department.',
        'Added duplicate detection so a second report against an AGV with an open fault is caught rather than creating a parallel ticket.',
        'Built a responsive vanilla-JavaScript frontend that works on a phone held in front of the vehicle.',
        'Added search and filtering by AGV number so maintenance can find a vehicle’s history quickly.',
        'Supported an air-gapped deployment path, since plant networks are frequently isolated from the internet.',
      ],
      outcome: [
        'Fault reporting moved from a desk-bound process to something done at the vehicle.',
        'Duplicate open reports against the same AGV are prevented at the data layer.',
        'Deployable in both standard and air-gapped environments.',
      ],
      stack: [
        { layer: 'Backend', tech: 'Python 3.7+, Flask, Flask-CORS' },
        { layer: 'Database', tech: 'MongoDB (local, Docker, or Atlas)' },
        { layer: 'Frontend', tech: 'Vanilla JavaScript, HTML5, CSS3' },
        { layer: 'Deployment', tech: 'Standard and air-gapped environments' },
      ],
    },
  },
  {
    slug: 'fanatiq',
    title: 'FanatIQ',
    tagline: 'Daily sports trivia with server-authoritative scoring',
    description:
      'A daily sports trivia game across MLB, NFL, and NBA. One attempt per sport per day, eight questions, scored on speed — with XP, leveling, leaderboards, and friends.',
    tech: [
      'Next.js',
      'TypeScript',
      'PostgreSQL',
      'Prisma',
      'NextAuth',
      'Zod',
      'Tailwind CSS',
    ],
    highlights: [
      'Deterministic daily question sets generated by a seeded shuffle, so every player gets the same eight questions with no cron job required',
      'Scoring happens exclusively server-side — the client submits a choice, never a score, so results cannot be manipulated from the browser',
      'Mid-quiz forfeits still award earned XP via navigator.sendBeacon, which fires even as the page unloads',
    ],
    cover: '/covers/fanatiq.svg',
    github: 'https://github.com/jacobotero/Sports-Trivia',
    featured: true,
    detail: {
      problem:
        'A daily quiz game has two hard requirements that pull against each other: every player must get the same questions on the same day, and no player may be able to influence their own score. A naive implementation needs a scheduled job to publish each day’s set, and leaks scoring logic to the client.',
      approach: [
        'Generated each day’s question set with a seeded linear congruential shuffle keyed on "YYYY-MM-DD-SPORT", so the set is identical for every player and reproducible without a scheduler. The result is cached after the first request, making later loads a single database read.',
        'Graded answers exclusively in server Route Handlers — the client posts its choice and the server computes the score.',
        'Enforced the one-attempt-per-sport-per-day rule at the database level rather than in application code.',
        'Handled mid-quiz abandonment with a pagehide listener firing navigator.sendBeacon to a forfeit endpoint, so XP for answered questions is awarded even if the player never returns. A ref guard prevents double-awarding across the SPA-navigation and unload paths.',
        'Computed account level from total XP across all sports using a closed-form formula, and animated the level-up across level boundaries client-side.',
      ],
      outcome: [
        'Playable end to end with accounts, guest mode, friends, and per-sport and overall leaderboards.',
        'No scheduled job in the system — daily sets are derived, not published.',
        'Scores cannot be forged from the browser.',
      ],
      stack: [
        { layer: 'Framework', tech: 'Next.js 16 App Router, TypeScript' },
        { layer: 'Styling', tech: 'Tailwind CSS v4, shadcn/ui' },
        { layer: 'Database', tech: 'PostgreSQL, Prisma 7' },
        { layer: 'Auth', tech: 'NextAuth v4, credentials provider, JWT sessions' },
        { layer: 'Validation', tech: 'Zod v4' },
        { layer: 'Deployment', tech: 'Vercel, Neon serverless Postgres' },
      ],
    },
  },
  {
    slug: 'resume-analyzer',
    title: 'Resume & Job Description Analyzer',
    tagline: 'AI-powered resume-to-job-description match scoring',
    description:
      'Upload a resume and a job description and get a compatibility score plus specific feedback on what is strong, what is missing, and which keywords and skills would improve alignment.',
    tech: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Supabase'],
    highlights: [
      'Scores resume-to-posting fit using semantic similarity, keyword density, and contextual relevance',
      'Surfaces missing keywords and skills as actionable feedback rather than just a number',
      'Accepts PDF, DOCX, and plain-text uploads',
    ],
    cover: '/covers/resume-analyzer.svg',
    github: 'https://github.com/jacobotero/resume-anaylzer',
    featured: false,
    detail: {
      problem:
        'Applicants are told to tailor their resume to each posting, but rarely get told what specifically is missing. Generic advice does not survive contact with a particular job description.',
      approach: [
        'Built an upload flow accepting resumes and job descriptions as PDF, DOCX, or plain text.',
        'Compared the two documents using natural language processing rather than plain keyword matching, combining semantic similarity, keyword density, and contextual relevance.',
        'Produced a percentage match score alongside a breakdown of strengths, weaknesses, and missing terms.',
      ],
      outcome: [
        'Turns "tailor your resume" into a specific, per-posting list of gaps.',
        'Returns a score and feedback in a single pass after upload.',
      ],
      stack: [
        { layer: 'Frontend', tech: 'Next.js, React, Tailwind CSS' },
        { layer: 'Backend', tech: 'Node.js, Supabase' },
      ],
    },
  },
]

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}

export function allTech(): string[] {
  return [...new Set(projects.flatMap((project) => project.tech))].sort()
}
```

- [ ] **Step 4: Create the four cover SVGs**

Each is 1200x630. Create `frontend/public/covers/donortrack.svg` with this content, then repeat for the other three, changing only the `<text>` values noted below.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="DonorTrack project cover">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1030" />
      <stop offset="55%" stop-color="#2a1b4d" />
      <stop offset="100%" stop-color="#0b0a12" />
    </linearGradient>
    <radialGradient id="glow" cx="20%" cy="15%" r="70%">
      <stop offset="0%" stop-color="#a78bfa" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#a78bfa" stop-opacity="0" />
    </radialGradient>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.4" fill="#ffffff" fill-opacity="0.07" />
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#g)" />
  <rect width="1200" height="630" fill="url(#dots)" />
  <rect width="1200" height="630" fill="url(#glow)" />
  <text x="80" y="300" font-family="Outfit, Inter, system-ui, sans-serif" font-size="82" font-weight="800" fill="#f5f3ff">DonorTrack</text>
  <text x="80" y="360" font-family="Inter, system-ui, sans-serif" font-size="30" fill="#a78bfa">React · TypeScript · PostgreSQL · Stripe</text>
</svg>
```

For the remaining three, copy the file and change the `aria-label` and the two `<text>` contents:

- `agv-fault-tracker.svg` — title `AGV Fault Tracker` (font-size 72 so it fits), subtitle `Python · Flask · MongoDB · Docker`
- `fanatiq.svg` — title `FanatIQ`, subtitle `Next.js · TypeScript · PostgreSQL · Prisma`
- `resume-analyzer.svg` — title `Resume Analyzer` (font-size 72), subtitle `Next.js · React · Supabase`

- [ ] **Step 5: Run the test to verify it passes**

```bash
cd frontend && npx vitest run src/data/projects.test.ts
```

Expected: PASS, 8 tests.

- [ ] **Step 6: Verify the covers are valid SVG and were copied into the build**

```bash
cd frontend && npm run build && ls dist/covers/
```

Expected: four `.svg` files listed.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/data/projects.ts frontend/src/data/projects.test.ts frontend/public/covers
git commit -m "Add four-project data model with case study content and cover art

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Project card and projects index page

**Files:**
- Create: `frontend/src/components/ProjectCard.tsx`
- Rewrite: `frontend/src/pages/ProjectsPage.tsx`
- Create: `frontend/src/pages/ProjectsPage.test.tsx`

**Interfaces:**
- Consumes: `Project`, `projects`, `allTech` from Task 7; `PageHero` from Task 5; `Reveal` from Task 6
- Produces: `<ProjectCard project={project} index={number} />`, reused by the home page in Task 12

- [ ] **Step 1: Write the failing test `frontend/src/pages/ProjectsPage.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ProjectsPage } from './ProjectsPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <ProjectsPage />
    </MemoryRouter>,
  )
}

describe('ProjectsPage', () => {
  it('renders every project by default', () => {
    renderPage()
    expect(screen.getByText('DonorTrack')).toBeInTheDocument()
    expect(screen.getByText('AGV Fault Tracker')).toBeInTheDocument()
    expect(screen.getByText('FanatIQ')).toBeInTheDocument()
    expect(
      screen.getByText('Resume & Job Description Analyzer'),
    ).toBeInTheDocument()
  })

  it('narrows the list when a tech filter is selected', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Flask' }))

    expect(screen.getByText('AGV Fault Tracker')).toBeInTheDocument()
    expect(screen.queryByText('DonorTrack')).not.toBeInTheDocument()
  })

  it('restores the full list when All is selected', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Flask' }))
    await user.click(screen.getByRole('button', { name: 'All' }))

    expect(screen.getByText('DonorTrack')).toBeInTheDocument()
    expect(screen.getByText('AGV Fault Tracker')).toBeInTheDocument()
  })

  it('links each card to its detail page', () => {
    renderPage()
    const links = screen.getAllByRole('link', { name: /view details/i })
    expect(links[0]).toHaveAttribute('href', '/projects/donortrack')
  })

  it('marks the selected filter as pressed', async () => {
    const user = userEvent.setup()
    renderPage()

    const flask = screen.getByRole('button', { name: 'Flask' })
    await user.click(flask)
    expect(flask).toHaveAttribute('aria-pressed', 'true')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd frontend && npx vitest run src/pages/ProjectsPage.test.tsx
```

Expected: FAIL — the stub page renders only a heading.

- [ ] **Step 3: Create `frontend/src/components/ProjectCard.tsx`**

```tsx
import { Link } from 'react-router'
import type { Project } from '../data/projects'
import { Reveal } from './Reveal'

const MAX_VISIBLE_TECH = 4

export function ProjectCard({
  project,
  index = 0,
}: {
  project: Project
  index?: number
}) {
  const visibleTech = project.tech.slice(0, MAX_VISIBLE_TECH)
  const overflow = project.tech.length - visibleTech.length

  return (
    <Reveal
      delay={index * 0.08}
      className="h-full rounded-2xl border border-border bg-bg-raised overflow-hidden flex flex-col hover:border-border-strong transition-colors"
    >
      <img
        src={project.cover}
        alt=""
        loading="lazy"
        className="w-full aspect-[1200/630] object-cover border-b border-border"
      />

      <div className="p-6 flex flex-col grow">
        <h3 className="font-display font-bold text-lg text-heading">
          {project.title}
        </h3>
        <p className="mt-2 text-sm text-text-dim leading-relaxed">
          {project.description}
        </p>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {visibleTech.map((tech) => (
            <li
              key={tech}
              className="px-2.5 py-1 text-xs rounded-full border border-border text-text-dim"
            >
              {tech}
            </li>
          ))}
          {overflow > 0 && (
            <li className="px-2.5 py-1 text-xs rounded-full border border-border text-text-dim">
              +{overflow}
            </li>
          )}
        </ul>

        <ul className="mt-4 space-y-2">
          {project.highlights.slice(0, 2).map((highlight) => (
            <li key={highlight} className="flex gap-2 text-sm text-text-dim">
              <span className="text-accent shrink-0" aria-hidden="true">
                →
              </span>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-4 flex items-center gap-3">
          <Link
            to={`/projects/${project.slug}`}
            className="px-4 py-2 text-sm font-display rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors"
          >
            View details
          </Link>
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-sm font-display rounded-full border border-border text-text-dim hover:text-heading hover:border-border-strong transition-colors"
            >
              Live demo
            </a>
          )}
        </div>
      </div>
    </Reveal>
  )
}
```

- [ ] **Step 4: Replace `frontend/src/pages/ProjectsPage.tsx`**

```tsx
import { useMemo, useState } from 'react'
import { ProjectCard } from '../components/ProjectCard'
import { PageHero } from '../components/PageHero'
import { allTech, projects } from '../data/projects'

const ALL = 'All'

export function ProjectsPage() {
  const [filter, setFilter] = useState(ALL)
  const filters = useMemo(() => [ALL, ...allTech()], [])

  const visible = useMemo(
    () =>
      filter === ALL
        ? projects
        : projects.filter((project) => project.tech.includes(filter)),
    [filter],
  )

  return (
    <>
      <PageHero
        title="My Projects"
        subtitle="A showcase of my work across various technologies"
      />

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <ul className="flex flex-wrap justify-center gap-2 mb-10">
            {filters.map((tech) => {
              const selected = tech === filter
              return (
                <li key={tech}>
                  <button
                    type="button"
                    onClick={() => setFilter(tech)}
                    aria-pressed={selected}
                    className={`px-3.5 py-1.5 text-xs rounded-full border transition-colors ${
                      selected
                        ? 'bg-accent text-accent-contrast border-accent'
                        : 'border-border text-text-dim hover:text-heading hover:border-border-strong'
                    }`}
                  >
                    {tech}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {visible.map((project, i) => (
              <ProjectCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
cd frontend && npx vitest run src/pages/ProjectsPage.test.tsx
```

Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/ProjectCard.tsx frontend/src/pages/ProjectsPage.tsx frontend/src/pages/ProjectsPage.test.tsx
git commit -m "Add project cards and filterable projects index

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 9: Project detail pages

**Files:**
- Rewrite: `frontend/src/pages/ProjectDetail.tsx`
- Create: `frontend/src/pages/ProjectDetail.test.tsx`

**Interfaces:**
- Consumes: `getProject` from Task 7, `NotFound` from Task 3, `PageHero`/`Reveal`
- Produces: nothing consumed downstream

- [ ] **Step 1: Write the failing test `frontend/src/pages/ProjectDetail.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ProjectDetail } from './ProjectDetail'

function renderAt(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/projects/${slug}`]}>
      <Routes>
        <Route path="/projects/:slug" element={<ProjectDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProjectDetail', () => {
  it('renders the project title for a known slug', () => {
    renderAt('donortrack')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'DonorTrack',
    )
  })

  it('renders the three case study sections', () => {
    renderAt('donortrack')
    expect(screen.getByText(/the problem/i)).toBeInTheDocument()
    expect(screen.getByText(/^approach$/i)).toBeInTheDocument()
    expect(screen.getByText(/^outcome$/i)).toBeInTheDocument()
  })

  it('shows a live demo link only when the project has one', () => {
    renderAt('donortrack')
    expect(screen.getByRole('link', { name: /live demo/i })).toHaveAttribute(
      'href',
      'https://www.donortrackapp.com',
    )
  })

  it('omits the live demo link when there is no live URL', () => {
    renderAt('fanatiq')
    expect(screen.queryByRole('link', { name: /live demo/i })).toBeNull()
  })

  it('renders the not-found page for an unknown slug', () => {
    renderAt('does-not-exist')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /not found/i,
    )
  })

  it('renders the stack table', () => {
    renderAt('agv-fault-tracker')
    expect(screen.getByText('MongoDB (local, Docker, or Atlas)')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd frontend && npx vitest run src/pages/ProjectDetail.test.tsx
```

Expected: FAIL — the stub renders only the slug.

- [ ] **Step 3: Replace `frontend/src/pages/ProjectDetail.tsx`**

```tsx
import { Link, useParams } from 'react-router'
import { PageHero } from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import { getProject } from '../data/projects'
import { NotFound } from './NotFound'

export function ProjectDetail() {
  const { slug } = useParams()
  const project = slug ? getProject(slug) : undefined

  if (!project) return <NotFound />

  return (
    <>
      <PageHero title={project.title} subtitle={project.tagline} />

      <article className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <img
              src={project.cover}
              alt=""
              className="w-full rounded-2xl border border-border"
            />
          </Reveal>

          <Reveal className="mt-8 flex flex-wrap gap-3">
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 text-sm font-display rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors"
              >
                Live demo
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 text-sm font-display rounded-full border border-border text-text-dim hover:text-heading hover:border-border-strong transition-colors"
              >
                View source
              </a>
            )}
            <Link
              to="/projects"
              className="px-5 py-2.5 text-sm font-display rounded-full border border-border text-text-dim hover:text-heading hover:border-border-strong transition-colors"
            >
              All projects
            </Link>
          </Reveal>

          <Reveal className="mt-8 flex flex-wrap gap-1.5">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 text-xs rounded-full border border-border text-text-dim"
              >
                {tech}
              </span>
            ))}
          </Reveal>

          <Reveal className="mt-12">
            <h2 className="font-display font-bold text-2xl">The Problem</h2>
            <p className="mt-3 text-text-dim leading-relaxed">
              {project.detail.problem}
            </p>
          </Reveal>

          <Reveal className="mt-10">
            <h2 className="font-display font-bold text-2xl">Approach</h2>
            <ul className="mt-3 space-y-3">
              {project.detail.approach.map((item) => (
                <li key={item} className="flex gap-3 text-text-dim leading-relaxed">
                  <span className="text-accent shrink-0" aria-hidden="true">
                    →
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="mt-10">
            <h2 className="font-display font-bold text-2xl">Outcome</h2>
            <ul className="mt-3 space-y-3">
              {project.detail.outcome.map((item) => (
                <li key={item} className="flex gap-3 text-text-dim leading-relaxed">
                  <span className="text-accent shrink-0" aria-hidden="true">
                    →
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="mt-10">
            <h2 className="font-display font-bold text-2xl">Stack</h2>
            <dl className="mt-4 rounded-2xl border border-border divide-y divide-border overflow-hidden">
              {project.detail.stack.map((row) => (
                <div
                  key={row.layer}
                  className="grid sm:grid-cols-[10rem_1fr] gap-1 sm:gap-4 px-5 py-4"
                >
                  <dt className="text-sm text-heading font-medium">{row.layer}</dt>
                  <dd className="text-sm text-text-dim">{row.tech}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </article>
    </>
  )
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd frontend && npx vitest run src/pages/ProjectDetail.test.tsx
```

Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ProjectDetail.tsx frontend/src/pages/ProjectDetail.test.tsx
git commit -m "Add project case study detail pages

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Hero with rotating role text

**Files:**
- Create: `frontend/src/hooks/useRotatingText.ts`
- Create: `frontend/src/hooks/useRotatingText.test.ts`
- Rewrite: `frontend/src/components/Hero.tsx`
- Delete: `frontend/src/hooks/useTypewriter.ts`, `frontend/src/components/Cursor.tsx`

**Interfaces:**
- Consumes: `PageHero` from Task 5
- Produces: `useRotatingText(phrases: string[]): string`, `<Hero />`

Note: the existing `useTypewriter` types one fixed string and cannot cycle, so this task replaces it rather than reusing it. `Hero.tsx` and `Cursor.tsx` are its only consumers and both are rewritten or deleted here.

- [ ] **Step 1: Write the failing test `frontend/src/hooks/useRotatingText.test.ts`**

```ts
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRotatingText } from './useRotatingText'

describe('useRotatingText', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts empty and types the first phrase in', () => {
    const { result } = renderHook(() => useRotatingText(['abc', 'xyz']))
    expect(result.current).toBe('')

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect('abc').toContain(result.current)
    expect(result.current.length).toBeGreaterThan(0)
  })

  it('eventually reaches the full first phrase', () => {
    const { result } = renderHook(() => useRotatingText(['abc', 'xyz']))
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current).toBe('abc')
  })

  it('returns an empty string for an empty phrase list', () => {
    const { result } = renderHook(() => useRotatingText([]))
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current).toBe('')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd frontend && npx vitest run src/hooks/useRotatingText.test.ts
```

Expected: FAIL — cannot resolve `./useRotatingText`.

- [ ] **Step 3: Create `frontend/src/hooks/useRotatingText.ts`**

```ts
import { useEffect, useState } from 'react'

const TYPE_MS = 70
const DELETE_MS = 35
const HOLD_MS = 1800

/**
 * Types each phrase in, holds it, deletes it, and moves to the next —
 * cycling forever. Returns the currently visible substring.
 */
export function useRotatingText(phrases: string[]): string {
  const [index, setIndex] = useState(0)
  const [output, setOutput] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (phrases.length === 0) return

    const phrase = phrases[index % phrases.length]

    if (!deleting && output === phrase) {
      const hold = setTimeout(() => setDeleting(true), HOLD_MS)
      return () => clearTimeout(hold)
    }

    if (deleting && output === '') {
      setDeleting(false)
      setIndex((i) => (i + 1) % phrases.length)
      return
    }

    const timer = setTimeout(
      () => {
        setOutput((current) =>
          deleting
            ? phrase.slice(0, current.length - 1)
            : phrase.slice(0, current.length + 1),
        )
      },
      deleting ? DELETE_MS : TYPE_MS,
    )

    return () => clearTimeout(timer)
  }, [phrases, index, output, deleting])

  return output
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd frontend && npx vitest run src/hooks/useRotatingText.test.ts
```

Expected: PASS, 3 tests.

- [ ] **Step 5: Replace `frontend/src/components/Hero.tsx` entirely**

`PROFILE_IMAGE` is the single-line swap point for the real photo: change `null` to an imported image and the monogram disappears.

```tsx
import { Link } from 'react-router'
import { PageHero } from './PageHero'
import { useRotatingText } from '../hooks/useRotatingText'

const ROLES = ['Software Engineer', 'AI Engineer', 'Cloud Engineer']

/**
 * Set to an imported image to replace the monogram placeholder, e.g.
 *   import profile from '../assets/profile.jpg'
 *   const PROFILE_IMAGE: string | null = profile
 */
const PROFILE_IMAGE: string | null = null

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/jacobotero',
    path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.679.919.679 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/jacob-otero',
    path: 'M6.94 8.5H3.56V21h3.38V8.5ZM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM21 21h-3.38v-6.5c0-1.55-.03-3.55-2.17-3.55-2.17 0-2.5 1.7-2.5 3.44V21H9.57V8.5h3.24v1.7h.05c.45-.86 1.56-1.77 3.2-1.77 3.42 0 4.94 2.25 4.94 6.03V21Z',
  },
  {
    label: 'Email',
    href: 'mailto:jacobotero0313@gmail.com',
    path: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.7 2 7.3 5.5L19.3 7H4.7ZM4 8.2V17h16V8.2l-8 6-8-6Z',
  },
]

export function Hero() {
  const role = useRotatingText(ROLES)

  return (
    <PageHero fullHeight>
      <div className="grid lg:grid-cols-[1.1fr_auto] gap-12 lg:gap-16 items-center py-24">
        <div>
          <h1 className="font-display font-extrabold tracking-tight text-[clamp(2.75rem,7vw,4.5rem)] leading-[1.05]">
            Hi, I'm Jacob Otero
          </h1>

          <p
            className="mt-2 font-display font-bold text-accent text-[clamp(1.25rem,3vw,1.75rem)] min-h-[1.6em]"
            aria-live="polite"
          >
            {role}
            <span className="animate-pulse" aria-hidden="true">
              |
            </span>
          </p>

          <p className="mt-5 max-w-xl text-text-dim leading-relaxed">
            Computer Science senior building full-stack products and the cloud
            infrastructure they run on. Three software engineering co-ops at
            Mercedes-Benz U.S. International, and a production SaaS of my own.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-display font-medium rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors"
            >
              View my work
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href="/resume.pdf"
              download="Jacob Otero - Resume.pdf"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-display font-medium rounded-full border border-border bg-bg-raised text-text hover:text-heading hover:border-border-strong transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M12 3v12M7 12l5 5 5-5M5 21h14" />
              </svg>
              Resume
            </a>
          </div>

          <ul className="mt-8 flex gap-3">
            {SOCIALS.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-border bg-bg-raised text-text-dim hover:text-accent hover:border-accent transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4"
                    aria-hidden="true"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="justify-self-center lg:justify-self-end">
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-full blur-2xl"
              style={{ background: 'var(--c-glow)' }}
            />
            {PROFILE_IMAGE ? (
              <img
                src={PROFILE_IMAGE}
                alt="Jacob Otero"
                className="relative w-full h-full rounded-full object-cover border border-border-strong"
              />
            ) : (
              <div className="relative w-full h-full rounded-full border border-border-strong bg-bg-raised flex items-center justify-center">
                <span className="font-display font-extrabold text-6xl text-accent">
                  JO
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageHero>
  )
}
```

- [ ] **Step 6: Mount the hero on the home page**

Replace `frontend/src/pages/Home.tsx`:

```tsx
import { Hero } from '../components/Hero'

export function Home() {
  return <Hero />
}
```

- [ ] **Step 7: Delete the superseded files**

```bash
cd frontend && rm src/hooks/useTypewriter.ts src/components/Cursor.tsx
```

- [ ] **Step 8: Run the tests and build**

```bash
cd frontend && npx vitest run src/hooks/useRotatingText.test.ts src/App.test.tsx && npm run build
```

Expected: PASS and a successful build. If `App.test.tsx` fails on the `<h1>` assertion, confirm `PageHero` is not also rendering a `title` prop on the home route — the hero supplies its own `<h1>`.

- [ ] **Step 9: Commit**

```bash
git add frontend/src/hooks/useRotatingText.ts frontend/src/hooks/useRotatingText.test.ts frontend/src/components/Hero.tsx frontend/src/pages/Home.tsx
git rm --cached frontend/src/hooks/useTypewriter.ts frontend/src/components/Cursor.tsx
git commit -m "Rebuild hero with rotating role text and monogram photo slot

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: About block and tabbed technical skills

**Files:**
- Create: `frontend/src/components/AboutBlock.tsx`
- Create: `frontend/src/components/SkillTabs.tsx`
- Create: `frontend/src/components/SkillTabs.test.tsx`
- Modify: `frontend/src/pages/Home.tsx`

**Interfaces:**
- Consumes: `Reveal` from Task 6
- Produces: `<AboutBlock />`, `<SkillTabs />`

- [ ] **Step 1: Read the icon path data to carry forward**

```bash
cd frontend && cat src/components/SkillsIconGrid.tsx
```

The `ICONS` object maps a skill name to an SVG path string, and `SKILL_GROUPS` groups skills into categories. Copy both structures into `SkillTabs.tsx` verbatim in Step 4 — do not redraw the icons. `SkillsIconGrid.tsx` is deleted in Task 16 once this component replaces it.

**Note the exact field names on the `Skill` and `SkillGroup` interfaces before continuing.** The test in Step 2 and the component in Step 4 both assume a group exposes `name` and `skills`, and that each skill exposes `name` and an icon key. If the existing interfaces use different names, adapt the test and component to the existing data — do not rename the data to fit this plan.

- [ ] **Step 2: Write the failing test `frontend/src/components/SkillTabs.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SkillTabs, SKILL_GROUPS } from './SkillTabs'

describe('SkillTabs', () => {
  it('renders a tab for every category', () => {
    render(<SkillTabs />)
    for (const group of SKILL_GROUPS) {
      expect(screen.getByRole('tab', { name: group.name })).toBeInTheDocument()
    }
  })

  it('selects the first category by default', () => {
    render(<SkillTabs />)
    expect(screen.getByRole('tab', { name: SKILL_GROUPS[0].name })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('shows the skills of the selected category', () => {
    render(<SkillTabs />)
    expect(screen.getByText(SKILL_GROUPS[0].skills[0].name)).toBeInTheDocument()
  })

  it('switches the visible skills when another tab is chosen', async () => {
    const user = userEvent.setup()
    render(<SkillTabs />)

    await user.click(screen.getByRole('tab', { name: SKILL_GROUPS[1].name }))

    expect(screen.getByText(SKILL_GROUPS[1].skills[0].name)).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: SKILL_GROUPS[1].name })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
cd frontend && npx vitest run src/components/SkillTabs.test.tsx
```

Expected: FAIL — cannot resolve `./SkillTabs`.

- [ ] **Step 4: Create `frontend/src/components/SkillTabs.tsx`**

Copy the `ICONS` object and the `SKILL_GROUPS` array from `SkillsIconGrid.tsx` into the top of this file unchanged, exporting `SKILL_GROUPS`. Ensure the four category names are `Languages`, `Frameworks & Libraries`, `Cloud & DevOps`, and `AI & Data`, renaming the existing groups to match if they differ. Then the component:

```tsx
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

// ICONS and SKILL_GROUPS are copied verbatim from the former
// SkillsIconGrid.tsx. SKILL_GROUPS is exported for the test suite.

export function SkillTabs() {
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()
  const group = SKILL_GROUPS[active]

  return (
    <div>
      <div role="tablist" className="flex flex-wrap justify-center gap-1 mb-8">
        {SKILL_GROUPS.map((item, i) => {
          const selected = i === active
          return (
            <button
              key={item.name}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(i)}
              className={`relative px-3.5 py-1.5 text-sm rounded-full transition-colors ${
                selected ? 'text-heading' : 'text-text-dim hover:text-heading'
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="skill-tab-pill"
                  className="absolute inset-0 rounded-full bg-bg-elevated border border-border"
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 350, damping: 30 }
                  }
                />
              )}
              <span className="relative z-10">{item.name}</span>
            </button>
          )
        })}
      </div>

      <div className="rounded-2xl border border-border bg-bg-raised p-6">
        <AnimatePresence mode="wait">
          <motion.ul
            key={group.name}
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {group.skills.map((skill) => (
              <li
                key={skill.name}
                className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-border bg-bg text-sm text-text"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-accent"
                  aria-hidden="true"
                >
                  <path d={ICONS[skill.icon]} />
                </svg>
                {skill.name}
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </div>
  )
}
```

If the copied `Skill` interface names its icon field something other than `icon`, adjust the `ICONS[skill.icon]` lookup to match rather than renaming the data.

- [ ] **Step 5: Create `frontend/src/components/AboutBlock.tsx`**

Copy carries over from the old `About.tsx`, lightly updated because the projects are now on the site.

```tsx
import { Reveal } from './Reveal'

export function AboutBlock() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="font-display font-extrabold text-[clamp(2rem,4.5vw,3rem)] text-center">
            Who I Am
          </h2>
        </Reveal>

        <Reveal delay={0.08} className="mt-8 space-y-4 leading-relaxed text-text-dim">
          <p>
            I'm a senior Computer Science student graduating soon and looking for
            full-time software engineering roles. I've completed three software
            engineering co-ops at Mercedes-Benz U.S. International, building tools
            that went into real use on the plant floor and across global trade
            operations.
          </p>
          <p>
            I like building things end to end: writing the code, designing the
            infrastructure it runs on, and shipping it somewhere real. DonorTrack,
            a multi-tenant SaaS I built and run in production, is the clearest
            example — and this site is another, deployed on the AWS services I'm
            studying for the Solutions Architect Associate certification.
          </p>
          <p>
            I'm especially interested in AI and where it intersects with
            well-architected backend systems.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Add both blocks to `frontend/src/pages/Home.tsx`**

```tsx
import { AboutBlock } from '../components/AboutBlock'
import { Hero } from '../components/Hero'
import { Reveal } from '../components/Reveal'
import { SkillTabs } from '../components/SkillTabs'

export function Home() {
  return (
    <>
      <Hero />
      <AboutBlock />

      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2 className="font-display font-extrabold text-[clamp(2rem,4.5vw,3rem)] text-center">
              Technical Skills
            </h2>
            <p className="mt-3 text-center text-text-dim">
              My expertise across various technologies and tools
            </p>
          </Reveal>
          <Reveal delay={0.08} className="mt-10">
            <SkillTabs />
          </Reveal>
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 7: Run the test to verify it passes**

```bash
cd frontend && npx vitest run src/components/SkillTabs.test.tsx && npm run build
```

Expected: PASS, 4 tests, and a successful build.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/AboutBlock.tsx frontend/src/components/SkillTabs.tsx frontend/src/components/SkillTabs.test.tsx frontend/src/pages/Home.tsx
git commit -m "Add about block and tabbed technical skills to home page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 12: Featured projects and certifications on the home page

**Files:**
- Create: `frontend/src/components/Certifications.tsx`
- Modify: `frontend/src/pages/Home.tsx`
- Create: `frontend/src/pages/Home.test.tsx`

**Interfaces:**
- Consumes: `ProjectCard` from Task 8, badge images in `frontend/src/assets/`
- Produces: `<Certifications />`

- [ ] **Step 1: Write the failing test `frontend/src/pages/Home.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { Home } from './Home'

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )
}

describe('Home', () => {
  it('shows exactly the three featured projects', () => {
    renderHome()
    expect(screen.getByText('DonorTrack')).toBeInTheDocument()
    expect(screen.getByText('AGV Fault Tracker')).toBeInTheDocument()
    expect(screen.getByText('FanatIQ')).toBeInTheDocument()
    expect(
      screen.queryByText('Resume & Job Description Analyzer'),
    ).not.toBeInTheDocument()
  })

  it('links to the full projects page', () => {
    renderHome()
    expect(
      screen.getByRole('link', { name: /view all projects/i }),
    ).toHaveAttribute('href', '/projects')
  })

  it('renders both certifications', () => {
    renderHome()
    expect(
      screen.getByText(/AWS Certified Solutions Architect/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Google AI Professional Certificate/i),
    ).toBeInTheDocument()
  })

  it('links the Google certificate to its credential', () => {
    renderHome()
    expect(
      screen.getByRole('link', { name: /view credential/i }),
    ).toHaveAttribute(
      'href',
      'https://www.coursera.org/account/accomplishments/professional-cert/certificate/MFQ3BPXDSCLO',
    )
  })

  it('offers a resume download', () => {
    renderHome()
    const links = screen.getAllByRole('link', { name: /resume/i })
    expect(links.some((l) => l.getAttribute('href') === '/resume.pdf')).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd frontend && npx vitest run src/pages/Home.test.tsx
```

Expected: FAIL — no featured projects or certifications are rendered yet.

- [ ] **Step 3: Create `frontend/src/components/Certifications.tsx`**

The `CERTIFICATIONS` array and the link-icon SVG are carried over from the old `Skills.tsx` unchanged; only the wrapper styling is new.

```tsx
import awsBadge from '../assets/aws-saa-badge.png'
import googleAiBadge from '../assets/google-ai-badge.png'
import { Reveal } from './Reveal'

interface Certification {
  badge: string
  alt: string
  title: string
  description: string
  link?: string
}

const CERTIFICATIONS: Certification[] = [
  {
    badge: awsBadge,
    alt: 'AWS Certified Solutions Architect — Associate badge',
    title: 'AWS Certified Solutions Architect — Associate',
    description:
      "In progress — this site's infrastructure (S3, CloudFront, Lambda, API Gateway) is built with what I'm learning along the way.",
  },
  {
    badge: googleAiBadge,
    alt: 'Google AI Professional Certificate badge',
    title: 'Google AI Professional Certificate',
    description:
      'Completed — practical coursework on building and applying AI/ML tools.',
    link: 'https://www.coursera.org/account/accomplishments/professional-cert/certificate/MFQ3BPXDSCLO',
  },
]

export function Certifications() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <h2 className="font-display font-extrabold text-[clamp(2rem,4.5vw,3rem)] text-center">
            Certifications
          </h2>
        </Reveal>

        <div className="mt-10 space-y-4">
          {CERTIFICATIONS.map((cert, i) => (
            <Reveal
              key={cert.title}
              delay={i * 0.08}
              className="rounded-2xl border border-border bg-bg-raised px-6 py-5 flex items-center gap-5"
            >
              <img
                src={cert.badge}
                alt={cert.alt}
                className="w-16 sm:w-20 shrink-0"
              />
              <div>
                <p className="text-heading font-medium flex items-center gap-2">
                  {cert.title}
                  {cert.link && (
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`View credential: ${cert.title}`}
                      title="View credential"
                      className="text-text-dim hover:text-accent transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                        aria-hidden="true"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    </a>
                  )}
                </p>
                <p className="text-sm text-text-dim mt-1">{cert.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.16} className="mt-10 flex justify-center">
          <a
            href="/resume.pdf"
            download="Jacob Otero - Resume.pdf"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-display font-medium rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path d="M12 3v12M7 12l5 5 5-5M5 21h14" />
            </svg>
            Download my resume
          </a>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Add featured projects and certifications to `frontend/src/pages/Home.tsx`**

Insert these two sections after the Technical Skills section and add the imports.

```tsx
import { Link } from 'react-router'
import { Certifications } from '../components/Certifications'
import { ProjectCard } from '../components/ProjectCard'
import { projects } from '../data/projects'
```

```tsx
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="font-display font-extrabold text-[clamp(2rem,4.5vw,3rem)] text-center">
              Featured Projects
            </h2>
            <p className="mt-3 text-center text-text-dim">
              Check out some of my recent work
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {projects
              .filter((project) => project.featured)
              .map((project, i) => (
                <ProjectCard key={project.slug} project={project} index={i} />
              ))}
          </div>

          <Reveal delay={0.24} className="mt-10 flex justify-center">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-display font-medium rounded-full border border-border bg-bg-raised text-text hover:text-heading hover:border-border-strong transition-colors"
            >
              View all projects
              <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <Certifications />
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
cd frontend && npx vitest run src/pages/Home.test.tsx
```

Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/Certifications.tsx frontend/src/pages/Home.tsx frontend/src/pages/Home.test.tsx
git commit -m "Add featured projects and certifications to home page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 13: Experience page with company block timeline

**Files:**
- Create: `frontend/src/components/CompanyTimeline.tsx`
- Rewrite: `frontend/src/pages/ExperiencePage.tsx`
- Create: `frontend/src/pages/ExperiencePage.test.tsx`

**Interfaces:**
- Consumes: `PageHero`, `Reveal`
- Produces: `<CompanyTimeline />`

Role content is carried over from the existing `Experience.tsx` unchanged.

- [ ] **Step 1: Write the failing test `frontend/src/pages/ExperiencePage.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ExperiencePage } from './ExperiencePage'

describe('ExperiencePage', () => {
  it('names the company once as a heading', () => {
    render(<ExperiencePage />)
    expect(
      screen.getByRole('heading', { name: /Mercedes-Benz U\.S\. International/i }),
    ).toBeInTheDocument()
  })

  it('renders all three roles', () => {
    render(<ExperiencePage />)
    expect(screen.getAllByText('Software Engineering Co-op')).toHaveLength(3)
  })

  it('renders each role department and dates', () => {
    render(<ExperiencePage />)
    expect(screen.getByText(/May 2026 – Aug 2026/)).toBeInTheDocument()
    expect(screen.getByText(/Aug 2025 – Dec 2025/)).toBeInTheDocument()
    expect(screen.getByText(/Jan 2025 – May 2025/)).toBeInTheDocument()
    expect(screen.getAllByText(/Global Service & Parts/).length).toBe(2)
    expect(screen.getByText(/Battery Plant/)).toBeInTheDocument()
  })

  it('shows the combined tenure summary', () => {
    render(<ExperiencePage />)
    expect(screen.getByText(/3 terms/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd frontend && npx vitest run src/pages/ExperiencePage.test.tsx
```

Expected: FAIL — the stub renders only a heading.

- [ ] **Step 3: Create `frontend/src/components/CompanyTimeline.tsx`**

```tsx
import { Reveal } from './Reveal'

interface Role {
  title: string
  department: string
  dates: string
  summary: string
}

const COMPANY = 'Mercedes-Benz U.S. International'
const LOCATION = 'Tuscaloosa, AL'
const TENURE = 'Jan 2025 – Aug 2026 · 3 terms'

const ROLES: Role[] = [
  {
    title: 'Software Engineering Co-op',
    department: 'Global Service & Parts',
    dates: 'May 2026 – Aug 2026',
    summary:
      'Built a compliance workflow tool adopted by 18 business units, cutting review time 80%.',
  },
  {
    title: 'Software Engineering Co-op',
    department: 'Battery Plant',
    dates: 'Aug 2025 – Dec 2025',
    summary:
      'Built a real-time production tracking system now used plant-wide by hundreds of engineers and operators.',
  },
  {
    title: 'Software Engineering Co-op',
    department: 'Global Service & Parts',
    dates: 'Jan 2025 – May 2025',
    summary:
      'Automated dangerous-goods documentation, cutting audit errors 40% across global trade operations.',
  },
]

export function CompanyTimeline() {
  return (
    <Reveal className="rounded-2xl border border-border bg-bg-raised p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2 pb-6 border-b border-border">
        <div>
          <h2 className="font-display font-bold text-xl text-heading">
            {COMPANY}
          </h2>
          <p className="text-sm text-text-dim mt-1">{LOCATION}</p>
        </div>
        <p className="text-xs uppercase tracking-widest text-accent">{TENURE}</p>
      </div>

      {/* The vertical spine sits behind the dot markers. */}
      <ol className="relative mt-8 pl-8 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-px before:bg-border">
        {ROLES.map((role, i) => (
          <li key={role.department + role.dates} className={i > 0 ? 'mt-8' : ''}>
            <Reveal delay={i * 0.1}>
              <span
                aria-hidden="true"
                className="absolute left-0 w-[11px] h-[11px] rounded-full bg-accent ring-4 ring-bg-raised"
                style={{ marginTop: '0.4rem' }}
              />
              <p className="text-heading font-medium">{role.title}</p>
              <p className="text-xs uppercase tracking-widest text-text-dim mt-1">
                {role.department} · {role.dates}
              </p>
              <p className="mt-3 text-sm text-text-dim flex gap-2">
                <span className="text-accent shrink-0" aria-hidden="true">
                  →
                </span>
                <span>{role.summary}</span>
              </p>
            </Reveal>
          </li>
        ))}
      </ol>
    </Reveal>
  )
}
```

- [ ] **Step 4: Replace `frontend/src/pages/ExperiencePage.tsx`**

```tsx
import { CompanyTimeline } from '../components/CompanyTimeline'
import { PageHero } from '../components/PageHero'

export function ExperiencePage() {
  return (
    <>
      <PageHero
        title="Experience"
        subtitle="My professional journey in software engineering"
      />

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <CompanyTimeline />
        </div>
      </section>
    </>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
cd frontend && npx vitest run src/pages/ExperiencePage.test.tsx
```

Expected: PASS, 4 tests. The `App.test.tsx` assertion that `/experience` has an `<h1>` reading "Experience" still holds because `PageHero` supplies it.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/CompanyTimeline.tsx frontend/src/pages/ExperiencePage.tsx frontend/src/pages/ExperiencePage.test.tsx
git commit -m "Add experience page with nested company role timeline

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 14: Contact page

The submit handler is a verbatim port. Do not "improve" the validation — the current behavior is deployed and working against the live Lambda.

**Files:**
- Rewrite: `frontend/src/pages/ContactPage.tsx`
- Rewrite: `frontend/src/components/Contact.test.tsx` → `frontend/src/pages/ContactPage.test.tsx`

**Interfaces:**
- Consumes: `PageHero`, `Reveal`
- Produces: nothing consumed downstream

- [ ] **Step 1: Read the existing test to preserve its cases**

```bash
cd frontend && cat src/components/Contact.test.tsx
```

Every assertion in that file must survive into the new test, with only the import path and rendered component name changed. If it asserts on placeholder or label text that this task changes, update the query — never delete the case.

- [ ] **Step 2: Create `frontend/src/pages/ContactPage.test.tsx`**

Port every case from the old file, then add these two. The full file must contain both the ported cases and these.

```tsx
it('rejects an invalid email address', async () => {
  const user = userEvent.setup()
  render(<ContactPage />)

  await user.type(screen.getByLabelText(/name/i), 'Jacob')
  await user.type(screen.getByLabelText(/email/i), 'not-an-email')
  await user.type(screen.getByLabelText(/message/i), 'Hello')
  await user.click(screen.getByRole('button', { name: /send/i }))

  expect(await screen.findByText(/valid email/i)).toBeInTheDocument()
})

it('rejects empty fields', async () => {
  const user = userEvent.setup()
  render(<ContactPage />)

  await user.click(screen.getByRole('button', { name: /send/i }))

  expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument()
})
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
cd frontend && npx vitest run src/pages/ContactPage.test.tsx
```

Expected: FAIL — cannot resolve `./ContactPage` as a form component.

- [ ] **Step 4: Replace `frontend/src/pages/ContactPage.tsx`**

```tsx
import { type FormEvent, useState } from 'react'
import { PageHero } from '../components/PageHero'
import { Reveal } from '../components/Reveal'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const API_URL = import.meta.env.VITE_CONTACT_API_URL as string | undefined

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/jacobotero' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jacob-otero' },
  { label: 'Email', href: 'mailto:jacobotero0313@gmail.com' },
]

export function ContactPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  // Ported verbatim from the previous Contact.tsx — this is live against the
  // deployed Lambda, so the validation and request shape must not change.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      message: (
        form.elements.namedItem('message') as HTMLTextAreaElement
      ).value.trim(),
    }

    if (!data.name || !data.email || !data.message) {
      setError('all fields are required')
      setStatus('error')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError('enter a valid email address')
      setStatus('error')
      return
    }
    if (!API_URL) {
      setError('contact endpoint not configured yet')
      setStatus('error')
      return
    }

    setStatus('submitting')
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('request failed')
      setStatus('success')
      form.reset()
    } catch {
      setError('message failed to send — try again or email me directly')
      setStatus('error')
    }
  }

  return (
    <>
      <PageHero
        title="Get in touch"
        subtitle="Open to full-time software engineering roles"
      />

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl grid md:grid-cols-[1fr_auto] gap-12">
          <Reveal>
            <form onSubmit={handleSubmit} noValidate className="space-y-5 max-w-lg">
              <Field label="Name" id="name" name="name" type="text" />
              <Field label="Email" id="email" name="email" type="email" />

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs text-text-dim mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full bg-bg-raised border border-border rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-5 py-2.5 text-sm font-display font-medium rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors disabled:opacity-50"
              >
                {status === 'submitting' ? 'Sending…' : 'Send message'}
              </button>

              {status === 'success' && (
                <p className="text-sm text-accent">
                  ✓ message sent — I'll get back to you soon.
                </p>
              )}
              {status === 'error' && (
                <p className="text-sm text-red-400">✗ {error}</p>
              )}
            </form>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="text-xs uppercase tracking-widest text-text-dim mb-4">
              Elsewhere
            </p>
            <ul className="space-y-2">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-text hover:text-accent transition-colors"
                  >
                    <span className="text-accent" aria-hidden="true">
                      →{' '}
                    </span>
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  )
}

function Field({
  label,
  id,
  name,
  type,
}: {
  label: string
  id: string
  name: string
  type: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs text-text-dim mb-1.5">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className="w-full bg-bg-raised border border-border rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  )
}
```

- [ ] **Step 5: Delete the superseded test and component**

```bash
cd frontend && rm src/components/Contact.test.tsx src/components/Contact.tsx
```

- [ ] **Step 6: Run the test to verify it passes**

```bash
cd frontend && npx vitest run src/pages/ContactPage.test.tsx
```

Expected: PASS — every ported case plus the two added ones.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/ContactPage.tsx frontend/src/pages/ContactPage.test.tsx
git rm --cached frontend/src/components/Contact.tsx frontend/src/components/Contact.test.tsx
git commit -m "Rebuild contact page, preserving submit and validation logic

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 15: Social sidebar, back-to-top, and footer

**Files:**
- Rewrite: `frontend/src/components/SocialSidebar.tsx`
- Create: `frontend/src/components/BackToTop.tsx`
- Create: `frontend/src/components/BackToTop.test.tsx`
- Rewrite: `frontend/src/components/Footer.tsx`
- Modify: `frontend/src/components/Layout.tsx`

**Interfaces:**
- Consumes: `NAV_LINKS` from Task 4
- Produces: `<SocialSidebar />`, `<BackToTop />`, `<Footer />`

- [ ] **Step 1: Write the failing test `frontend/src/components/BackToTop.test.tsx`**

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BackToTop } from './BackToTop'

describe('BackToTop', () => {
  it('is hidden near the top of the page', () => {
    render(<BackToTop />)
    expect(screen.queryByRole('button', { name: /back to top/i })).toBeNull()
  })

  it('appears once the page is scrolled down', () => {
    render(<BackToTop />)
    Object.defineProperty(window, 'scrollY', { value: 800, writable: true })
    fireEvent.scroll(window)
    expect(
      screen.getByRole('button', { name: /back to top/i }),
    ).toBeInTheDocument()
  })

  it('scrolls to the top when clicked', () => {
    const scrollTo = vi.fn()
    window.scrollTo = scrollTo as never
    render(<BackToTop />)
    Object.defineProperty(window, 'scrollY', { value: 800, writable: true })
    fireEvent.scroll(window)

    fireEvent.click(screen.getByRole('button', { name: /back to top/i }))
    expect(scrollTo).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
cd frontend && npx vitest run src/components/BackToTop.test.tsx
```

Expected: FAIL — cannot resolve `./BackToTop`.

- [ ] **Step 3: Create `frontend/src/components/BackToTop.tsx`**

```tsx
import { useEffect, useState } from 'react'

const SHOW_AFTER_PX = 400

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 w-11 h-11 flex items-center justify-center rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}
```

- [ ] **Step 4: Replace `frontend/src/components/SocialSidebar.tsx`**

Keep the `LINKS` array exactly as it is today — only the wrapper classes change, moving it from the left edge to the right and restyling to the new tokens.

```tsx
const LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/jacobotero',
    path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.679.919.679 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/jacob-otero',
    path: 'M6.94 8.5H3.56V21h3.38V8.5ZM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM21 21h-3.38v-6.5c0-1.55-.03-3.55-2.17-3.55-2.17 0-2.5 1.7-2.5 3.44V21H9.57V8.5h3.24v1.7h.05c.45-.86 1.56-1.77 3.2-1.77 3.42 0 4.94 2.25 4.94 6.03V21Z',
  },
  {
    label: 'Email',
    href: 'mailto:jacobotero0313@gmail.com',
    path: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.7 2 7.3 5.5L19.3 7H4.7ZM4 8.2V17h16V8.2l-8 6-8-6Z',
  },
]

export function SocialSidebar() {
  return (
    <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col items-center gap-3">
      {LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={link.label}
          title={link.label}
          className="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-bg-raised/80 backdrop-blur-sm text-text-dim hover:text-accent hover:border-accent transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path d={link.path} />
          </svg>
        </a>
      ))}
      <div className="w-px h-16 bg-border mt-2" />
    </div>
  )
}
```

- [ ] **Step 5: Replace `frontend/src/components/Footer.tsx`**

```tsx
import { Link } from 'react-router'
import { NAV_LINKS } from './Nav'

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto max-w-5xl grid gap-8 sm:grid-cols-3">
        <div>
          <Link
            to="/"
            className="font-display font-bold text-heading hover:text-accent transition-colors"
          >
            Jacob Otero
          </Link>
          <p className="mt-2 text-sm text-text-dim">
            Software Engineer · AI Engineer · Cloud Engineer
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="text-xs uppercase tracking-widest text-text-dim mb-3">
            Quick links
          </p>
          <ul className="space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm text-text-dim hover:text-accent transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-xs uppercase tracking-widest text-text-dim mb-3">
            Connect
          </p>
          <ul className="space-y-2">
            <li>
              <a
                href="https://github.com/jacobotero"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-text-dim hover:text-accent transition-colors"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/jacob-otero"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-text-dim hover:text-accent transition-colors"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="mailto:jacobotero0313@gmail.com"
                className="text-sm text-text-dim hover:text-accent transition-colors"
              >
                Email
              </a>
            </li>
          </ul>
        </div>
      </div>

      <p className="mx-auto max-w-5xl mt-10 pt-6 border-t border-border text-xs text-text-dim">
        © {new Date().getFullYear()} Jacob Otero · Built with React and deployed
        on AWS
      </p>
    </footer>
  )
}
```

- [ ] **Step 6: Mount all three in `frontend/src/components/Layout.tsx`**

```tsx
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Outlet, useLocation } from 'react-router'
import { BackToTop } from './BackToTop'
import { Footer } from './Footer'
import { Nav } from './Nav'
import { ScrollToTop } from './ScrollToTop'
import { SocialSidebar } from './SocialSidebar'

export function Layout() {
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()

  return (
    <>
      <ScrollToTop />
      <Nav />
      <SocialSidebar />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BackToTop />
      <Footer />
    </>
  )
}
```

- [ ] **Step 7: Run the test to verify it passes**

```bash
cd frontend && npx vitest run src/components/BackToTop.test.tsx
```

Expected: PASS, 3 tests.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/SocialSidebar.tsx frontend/src/components/BackToTop.tsx frontend/src/components/BackToTop.test.tsx frontend/src/components/Footer.tsx frontend/src/components/Layout.tsx
git commit -m "Add social sidebar, back-to-top, and footer to layout

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 16: Remove dead code and verify the whole site

**Files:**
- Delete: `frontend/src/components/CustomCursor.tsx`, `TerminalHeading.tsx`, `About.tsx`, `Skills.tsx`, `SkillsIconGrid.tsx`, `Projects.tsx`, `Experience.tsx`, `Resume.tsx`
- Delete: `frontend/src/hooks/useActiveSection.ts`, `frontend/src/hooks/useScrollFlash.ts`

**Interfaces:**
- Consumes: everything from Tasks 1-15
- Produces: a clean tree with no unreferenced components

- [ ] **Step 1: Confirm nothing still imports the files being removed**

```bash
cd frontend
grep -rn "CustomCursor\|TerminalHeading\|SkillsIconGrid\|useActiveSection\|useScrollFlash\|components/About\|components/Skills\|components/Projects\|components/Experience\|components/Resume" src/ || echo "NO REFERENCES"
```

Expected: `NO REFERENCES`. If anything matches, fix that import before deleting — do not delete a file that is still referenced.

- [ ] **Step 2: Delete the dead files**

```bash
cd frontend
rm src/components/CustomCursor.tsx src/components/TerminalHeading.tsx \
   src/components/About.tsx src/components/Skills.tsx \
   src/components/SkillsIconGrid.tsx src/components/Projects.tsx \
   src/components/Experience.tsx src/components/Resume.tsx
rm src/hooks/useActiveSection.ts src/hooks/useScrollFlash.ts
```

- [ ] **Step 3: Run the full verification gate**

```bash
cd frontend && npm run build && npm run lint && npm test
```

Expected: all three succeed, with no test failures anywhere in the suite.

- [ ] **Step 4: Confirm no terminal-theme remnants survive**

```bash
cd frontend
grep -rn "39d98a\|JetBrains\|IBM Plex\|scanline\|cursor-ring\|font-mono" src/ index.html || echo "CLEAN"
```

Expected: `CLEAN`. Any hit is a leftover from the old theme and must be removed.

- [ ] **Step 5: Verify visually in the dev server**

```bash
cd frontend && npm run dev
```

Walk through, in both themes (toggle in the nav):

- `/` — hero rotates through the three roles; monogram circle renders with its glow; starfield drifts and reacts to the mouse; skills tabs switch; three featured cards; certifications and resume download.
- `/projects` — four cards; filter pills narrow and restore the list.
- `/projects/donortrack` — case study renders with both a Live demo and a View source button.
- `/projects/nope` — the not-found page.
- `/experience` — company block with three nested roles.
- `/contact` — form validates on empty submit and on a malformed email.
- Nav pill slides between routes; page content cross-fades; back-to-top appears after scrolling and works.
- Scroll past a hero and confirm the page below sits on flat background with no starfield.

- [ ] **Step 6: Verify reduced-motion behavior**

In Chrome DevTools, open the Command Menu (Ctrl+Shift+P), run "Emulate CSS prefers-reduced-motion: reduce", then reload. Confirm: all content is visible (nothing stuck at opacity 0), the starfield renders as a static sky, and the nav pill snaps rather than slides.

- [ ] **Step 7: Commit**

```bash
git add -A frontend/src
git commit -m "Remove terminal-theme components superseded by the redesign

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Post-implementation

Not tasks — these need Jacob, or are follow-up work he has already been told about.

- **Deploy.** Push to `main` and let the workflow run. If `npm ci` hangs (a recurring issue on this repo), cancel with `gh run cancel <id>` and deploy manually. Before any manual `aws s3 sync`, grep the built JS for the API URL and GA measurement ID to confirm the build had its env vars, and follow the sync with an explicit `aws s3 cp dist/index.html s3://<bucket>/index.html`.
- **Profile photo.** Jacob supplies it; set `PROFILE_IMAGE` in `Hero.tsx`.
- **Real screenshots.** Replace generated covers one at a time. DonorTrack is live and easiest to capture.
- **`og-image.png`** is stale against the new design.
- **`resume-anaylzer`** is misspelled on GitHub; if renamed, update `projects.ts`.
- **Case study copy.** Jacob should read all four detail pages before they go live — they are written from his READMEs, but they are not his words.
