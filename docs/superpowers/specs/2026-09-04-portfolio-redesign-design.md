# Portfolio Redesign — Design Spec

Date: 2026-09-04
Status: Approved for planning

## Context

The portfolio at jacobotero.dev currently uses a dark terminal theme (green accent,
monospace throughout, `cat experience.log` section headings, scanline texture) as a
single page with anchor-scrolled sections. Jacob wants a complete visual and
structural redesign modeled on https://www.achyutkatiyar.com/ — a dark purple
starfield aesthetic with real multi-page routing.

The reference site is Next.js + Tailwind v4 + shadcn/ui. This redesign stays on the
existing Vite stack; see "Stack decision" below.

Everything below the frontend is unchanged. The S3 bucket, CloudFront distribution,
contact-form Lambda, SES wiring, Route53 records, GitHub Actions workflows, and
environment variables are all untouched by this work.

## Goals

- Replace the terminal identity entirely with the reference site's dark violet look.
- Convert the single page into four real routes plus per-project detail pages.
- Add a light/dark theme toggle, defaulting to dark.
- Add a drifting starfield background scoped to each page's hero band.
- Surface all four public projects, with case-study detail pages.

## Non-goals

- No blog. No AI assistant widget. No custom cursor.
- No infrastructure changes. No CI/CD changes.
- No changes to contact-form submission logic (validation and fetch are preserved
  verbatim; only the styling changes).
- No migration to Next.js.

## Stack decision

Stay on Vite 8 + React 19 + Tailwind v4. Add two dependencies:

- `react-router` (v7) for routing. CloudFront already serves `/index.html` for 404s
  (`infra/infra/infra_stack.py:94-101`), so client-side deep links work with no
  infra change.
- `motion` (the current package name for Framer Motion; imports from `motion/react`)
  for the sliding nav indicator (`layoutId`), page transitions (`AnimatePresence`),
  and scroll reveals.

Next.js was considered and rejected: a static-export migration would require
rebuilding the Vite config, Vitest setup, GitHub Actions build step, and env var
plumbing, for a fully static site that gains nothing. Two of the four featured
projects are already Next.js, so the framework is demonstrated elsewhere.

Verify exact package names and React 19 peer compatibility at install time.

## Design system

### Color tokens

Defined once as CSS custom properties on `:root`, overridden under
`[data-theme="light"]`. No color is hardcoded in a component.

Dark (default):

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b0a12` | page background |
| `--bg-raised` | `#14121d` | cards, nav pill, inputs |
| `--bg-elevated` | `#1b1826` | hover states on raised surfaces |
| `--border` | `#232030` | default card/input borders |
| `--border-strong` | `#322e42` | hover/focus borders |
| `--text` | `#c4c1cf` | body copy |
| `--text-dim` | `#8b8794` | secondary copy, labels |
| `--heading` | `#f5f3ff` | headings |
| `--accent` | `#a78bfa` | primary accent |
| `--accent-strong` | `#8b5cf6` | accent hover |
| `--accent-contrast` | `#0b0a12` | text on accent-filled surfaces |
| `--star` | `255, 255, 255` | starfield RGB triplet |
| `--glow` | `rgba(167, 139, 250, 0.15)` | hero radial glow |

Light:

| Token | Value |
|---|---|
| `--bg` | `#f7f7fa` |
| `--bg-raised` | `#ffffff` |
| `--bg-elevated` | `#f2f1f6` |
| `--border` | `#e5e3ec` |
| `--border-strong` | `#d3d0dd` |
| `--text` | `#45414f` |
| `--text-dim` | `#6f6b7c` |
| `--heading` | `#16141d` |
| `--accent` | `#7c3aed` |
| `--accent-strong` | `#6d28d9` |
| `--accent-contrast` | `#ffffff` |
| `--star` | `90, 80, 120` |
| `--glow` | `rgba(124, 58, 237, 0.10)` |

Light-mode accent is darkened from `#a78bfa` to `#7c3aed` to hold WCAG AA contrast
against white surfaces. The dark accent would fail on white.

### Typography

Two variable fonts, self-hosted as latin-subset woff2 in `frontend/public/fonts/`
with `font-display: swap`. Self-hosting rather than linking Google Fonts avoids a
third-party request, avoids any interaction with CloudFront's security headers
policy, and removes an extra DNS/TLS round trip.

- **Outfit** (variable weight) — headings, nav brand, buttons, card titles.
- **Inter** (variable weight) — body copy, labels, pills.

Scale:

| Role | Size | Font / weight |
|---|---|---|
| Hero name | `clamp(2.75rem, 7vw, 4.5rem)` | Outfit 800 |
| Page title | `clamp(2.5rem, 6vw, 4rem)` | Outfit 800 |
| Section heading | `clamp(2rem, 4.5vw, 3rem)` | Outfit 800 |
| Section subtitle | `1.0625rem` | Inter 400, `--text-dim` |
| Card title | `1.125rem` | Outfit 700 |
| Body | `0.9375rem / 1.7` | Inter 400 |
| Pill / label | `0.75rem` | Inter 500 |

### Shape

Cards `rounded-2xl` (1rem). Pills, nav container, and icon buttons `rounded-full`.
Inputs and textareas `rounded-xl` (0.75rem). Borders are 1px `--border`.

## Theme switching

`<html>` carries `data-theme="dark" | "light"`.

To prevent a flash of the wrong theme, a small inline script in `index.html`'s
`<head>` runs before first paint:

1. Read `localStorage.getItem('theme')`.
2. If absent, fall back to `matchMedia('(prefers-color-scheme: light)')`.
3. Set the attribute on `document.documentElement`.

A `ThemeProvider` context then owns the value at runtime, exposing `theme` and
`toggleTheme()` via a `useTheme()` hook. `toggleTheme` updates the attribute and
writes to `localStorage`. All storage access is wrapped in try/catch — private
browsing and blocked-storage settings must not break the page.

## App shell

A `Layout` component wraps every route and renders, in order:

- **Nav** — floating centered pill, fixed at top with a slight top offset. Brand
  "Jacob Otero" on the left, links (Home / Projects / Experience / Contact) center,
  theme toggle right. The active link sits behind a filled pill that slides between
  items via a shared `layoutId`. Below `md`, links collapse into a hamburger
  dropdown; the theme toggle stays visible.
- **Outlet** — the routed page, wrapped in `AnimatePresence mode="wait"` for
  cross-fade transitions.
- **SocialSidebar** — fixed vertical column of circular icon buttons (GitHub,
  LinkedIn, email) on the right edge. `hidden lg:flex`.
- **BackToTop** — circular FAB, bottom right, fades in past 400px of scroll.
- **Footer** — brand, quick links, contact links, copyright.

### Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/projects` | Projects index |
| `/projects/:slug` | Project detail |
| `/experience` | Experience |
| `/contact` | Contact |
| `*` | NotFound |

Route changes scroll to top. `/projects/:slug` with an unknown slug renders
NotFound rather than crashing.

## Starfield background

A `<Starfield />` canvas rendered inside `<PageHero>`, which every page's top band
uses. It is scoped to the hero — absolutely positioned, `inset-0`, at the hero's
height — not fixed to the viewport. It scrolls away with the hero, leaving the rest
of the page on flat `--bg`. This matches the reference and is the main reason the
effect is cheap.

`PageHero` has two heights: the Home hero fills the viewport (`min-h-screen`), and
the four inner pages use a shorter band (~55vh) holding just a title and subtitle.
Both get their own starfield instance.

Behind the canvas sits a radial glow div:
`radial-gradient(ellipse 60% 50% at 50% 0%, var(--glow), transparent 70%)`.

The canvas is masked so it fades out toward the hero's bottom edge:
`mask-image: linear-gradient(to bottom, black 0%, black 55%, transparent 100%)`.

### Star generation

Star count: `Math.min(260, Math.round((width * height) / 6000))`.

Each star holds normalized `x`/`y` in `[0,1]`, radius `0.4–1.4px`, base alpha
`0.15–0.9`, a random twinkle phase, twinkle speed `0.4–1.2`, and a `depth` in
`[0,1]` used for parallax. Positions are generated once per size from a seeded RNG,
so a re-render does not reshuffle the sky. Regenerate on resize (debounced).

### Animation

One `requestAnimationFrame` loop applying three effects:

1. **Twinkle** — per-star alpha oscillates around its base via its own phase/speed.
2. **Drift** — a global x-offset advances ~0.006px per frame and wraps at the
   canvas width, producing a pan measured in minutes rather than seconds.
3. **Mouse parallax** — pointer position offsets each star by
   `delta * depth * 12px`, eased toward the target at 0.06 per frame so it glides
   rather than snaps.

Device pixel ratio is capped at 2.

### Performance and safety guards

All four are required:

- **Off-screen** — an IntersectionObserver on the canvas cancels the rAF loop when
  the hero scrolls out of view and restarts it on re-entry.
- **Hidden tab** — a `visibilitychange` listener cancels the loop when the document
  is hidden.
- **Reduced motion** — under `prefers-reduced-motion: reduce`, draw one static
  frame and never start a loop.
- **jsdom** — `canvas.getContext('2d')` returns `null` in jsdom without the
  optional `canvas` package, and `IntersectionObserver` is undefined. Both must be
  guarded so tests and any non-browser render degrade to a no-op instead of
  throwing. This mirrors the guards already used in the current codebase.

## Motion system

Restrained, per the chosen level.

| Effect | Spec |
|---|---|
| Scroll reveal | `opacity 0→1`, `y 16→0`, 0.5s, ease `[0.16, 1, 0.3, 1]`, fires once, root margin `-80px` |
| Card stagger | 0.08s between siblings |
| Nav pill | shared `layoutId`, spring `stiffness 350 / damping 30` |
| Page transition | `AnimatePresence mode="wait"`, opacity + `y 8`, 0.25s |
| Hover | 150ms color/border transitions; cards lift 2px |

A single `Reveal` wrapper component owns the reveal animation so it is defined once.
Under `prefers-reduced-motion`, all of the above resolve instantly to their end
state — content must never be hidden from a reduced-motion visitor.

## Pages

### Home (`/`)

1. **Hero** — two columns. Left: "Hi, I'm Jacob Otero" (Outfit 800), then an
   accent-colored rotating subtitle cycling **Software Engineer → AI Engineer →
   Cloud Engineer** using the existing `useTypewriter` hook, then a short paragraph,
   then two CTAs ("View My Work" filled accent → `/projects`; "Resume" outlined with
   a download icon → `/resume.pdf`), then a row of social icon buttons. Right: a
   circular profile image ~320px with a soft accent glow ring.

   No photo exists yet. Ship a monogram placeholder — "JO" in Outfit 800 on a
   subtle gradient fill, inside the same circle and glow ring — so the layout reads
   as finished. Swapping in a real photo must be a single-line change: a
   `PROFILE_IMAGE` constant in `Hero.tsx` that is `null` for the monogram or an
   imported image.

2. **Who I Am** — short bio block, carried and adapted from the current
   `About.tsx` copy.

3. **Technical Skills** — tabbed icon grid. Category pills switch the icon set
   below with a cross-fade. Categories: Languages, Frameworks & Libraries,
   Cloud & DevOps, AI & Data. Reuse the hand-assembled SVG path strings already in
   `SkillsIconGrid.tsx`.

4. **Featured Projects** — three cards (DonorTrack, AGV Fault Tracker, FanatIQ),
   then a "View All Projects" button to `/projects`.

5. **Certifications + Resume** — the two existing badges from
   `frontend/src/assets/` (AWS Solutions Architect Associate, in progress; Google AI
   Professional Certificate, with its Coursera credential link), plus a prominent
   resume download. Since the nav has no Resume route, this block and the hero
   button are the resume's only homes; both must be present.

### Projects index (`/projects`)

Page hero with title and subtitle, then a row of filter pills (All + each distinct
tech across the project set), then a responsive card grid. Selecting a pill filters
to projects whose `tech` array contains it. Filtering animates via layout
transitions rather than a hard re-render.

### Project detail (`/projects/:slug`)

Cover image, title, tagline, tech list, and GitHub / Live Demo buttons, followed by
three sections: **The Problem**, **Approach**, **Outcome**. A stack table lists
layer → technology. DonorTrack gets a prominent "Live Demo" button to
https://www.donortrackapp.com — it is the only project with a deployed URL and
should be visibly the strongest card.

### Experience (`/experience`)

Page hero, then a single Mercedes-Benz U.S. International company block: a card
whose header carries the company name, Tuscaloosa AL, and the combined span
("Jan 2025 – Aug 2026 · 3 terms"). Inside it, a vertical timeline spine with three
dot markers, one per role, each showing title, department, dates, and the existing
one-line summary. Roles reveal in sequence as the block scrolls into view; the
spine draws downward as they appear.

This shape was chosen over a flat timeline because returning to the same employer
three times is a strong signal that a flat list buries, and because it scales — a
second employer becomes a second block rather than making the timeline lopsided.

Role content is carried over unchanged from the current `Experience.tsx`.

### Contact (`/contact`)

Page hero, then the existing form. **The submit handler, validation rules, and
fetch call are copied verbatim** from the current `Contact.tsx` — including the
email regex, the empty-field check, the `VITE_CONTACT_API_URL` guard, and the
status states. Only markup and classes change. Alongside it, a column of social /
direct-contact links.

## Data model

`frontend/src/data/projects.ts` exports one array. Adding a project later is one
object literal.

```ts
export interface Project {
  slug: string            // URL segment, e.g. "donortrack"
  title: string
  tagline: string         // one line, used on cards
  description: string     // 2–3 sentences, used on cards
  tech: string[]          // drives the /projects filter pills
  highlights: string[]    // 2–3 arrow bullets on the card
  cover: string           // path under /covers/
  github?: string
  live?: string
  featured: boolean       // controls appearance on Home
  detail: {
    problem: string
    approach: string[]
    outcome: string[]
    stack: { layer: string; tech: string }[]
  }
}
```

Four entries, with content drawn from each repo's README (already read; do not
invent claims):

| slug | repo | featured | live |
|---|---|---|---|
| `donortrack` | DonorTrack | yes | donortrackapp.com |
| `agv-fault-tracker` | agv-fault-tracker | yes | — |
| `fanatiq` | Sports-Trivia | yes | — |
| `resume-analyzer` | resume-anaylzer | no | — |

## Assets

- **Fonts** — Outfit and Inter variable woff2, latin subset, in `public/fonts/`.
- **Project covers** — four generated SVGs in `public/covers/`, one per project:
  violet-to-indigo gradient, faint dot grid, project name in Outfit, tech chips.
  Consistent by design, and readable on cards in both themes. The `cover` field is
  a plain path, so replacing one with a real screenshot later is a one-line change.
- **Badges** — the existing `aws-saa-badge.png` and `google-ai-badge.png` in
  `frontend/src/assets/` carry over unchanged.
- **Existing public files** — `resume.pdf`, `favicon.svg`, `og-image.png` stay.
  `og-image.png` is stale relative to the new look and should be regenerated, but
  that is follow-up work, not a blocker.

## File changes

**Added**

- `src/pages/`: `Home.tsx`, `ProjectsPage.tsx`, `ProjectDetail.tsx`,
  `ExperiencePage.tsx`, `ContactPage.tsx`, `NotFound.tsx`
- `src/components/`: `Layout.tsx`, `PageHero.tsx`, `Starfield.tsx`,
  `ThemeToggle.tsx`, `BackToTop.tsx`, `ProjectCard.tsx`, `SkillTabs.tsx`,
  `CompanyTimeline.tsx`, `Certifications.tsx`, `AboutBlock.tsx`
- `src/context/ThemeProvider.tsx`, `src/hooks/useTheme.ts`
- `public/fonts/`, `public/covers/`

**Rewritten**

`index.css` (token system replaced wholesale), `index.html` (theme script, font
preloads), `App.tsx` (router), `main.tsx`, `Nav.tsx`, `Footer.tsx`,
`SocialSidebar.tsx`, `Reveal.tsx`, `Hero.tsx`, `data/projects.ts`

**Removed**

`CustomCursor.tsx`, `Cursor.tsx`, `TerminalHeading.tsx`, `Resume.tsx`,
`About.tsx`, `Skills.tsx`, `SkillsIconGrid.tsx`, `Projects.tsx`, `Experience.tsx`,
`Contact.tsx`, `hooks/useActiveSection.ts`, `hooks/useScrollFlash.ts`,
`hooks/useRevealOnScroll.ts`

Several of these are deleted only after their content is carried forward: the skill
icon SVG paths move into `SkillTabs.tsx`, the bio copy into `AboutBlock.tsx`, the
role data into `CompanyTimeline.tsx`, the certification data into
`Certifications.tsx`, and the contact form's submit handler into `ContactPage.tsx`.
Delete each source file only once its replacement renders correctly.

`hooks/useTypewriter.ts` is kept for the hero rotation.

## Testing

Vitest + React Testing Library, as today. Components under test are wrapped in a
`MemoryRouter` and `ThemeProvider`.

| Test | Covers |
|---|---|
| `Nav.test.tsx` | renders all four links; active route gets active styling; mobile menu opens and closes |
| `ThemeToggle.test.tsx` | toggling flips `data-theme`; choice persists to localStorage; a stored value is honored on mount; a throwing localStorage does not break render |
| `ProjectsPage.test.tsx` | all projects render; a filter pill narrows the list; "All" restores it |
| `ProjectDetail.test.tsx` | a known slug renders its title and sections; an unknown slug renders NotFound |
| `Contact.test.tsx` | existing validation cases preserved: empty fields, invalid email, missing API URL, success and failure paths |
| `Starfield.test.tsx` | renders without throwing when `getContext` returns null; starts no rAF loop under reduced motion; survives a missing IntersectionObserver |

`npm run build`, `npm run lint`, and `npm test` must all pass before deploy.

## Deployment

Unchanged. Same S3 bucket, same CloudFront distribution, same GitHub Actions
workflows, same `VITE_CONTACT_API_URL` and `VITE_GA_MEASUREMENT_ID`.

Two existing operational rules still apply to any manual deploy:

- Grep the built JS for the API URL and GA measurement ID before syncing, to
  confirm the build was made with env vars present.
- Follow `aws s3 sync` with an explicit `aws s3 cp dist/index.html` — sync has been
  observed to skip `index.html` when its byte length is unchanged.

## Open items

These do not block implementation.

- **Profile photo** — Jacob will supply one later. Monogram placeholder ships in
  the meantime.
- **Project screenshots** — generated covers ship now; real screenshots replace
  them one file at a time. DonorTrack is live and is the easiest to capture first.
- **Featured three** — currently DonorTrack, AGV Fault Tracker, FanatIQ. Resume
  Analyzer is the natural swap-in if the "AI Engineer" line should be evidenced on
  the home page.
- **`resume-anaylzer` repo name is misspelled.** If renamed on GitHub, update the
  `github` URL in `projects.ts`.
- **`og-image.png` is stale** relative to the new design.
