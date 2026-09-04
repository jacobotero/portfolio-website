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
    tagline: 'Multi-tenant donor management for small nonprofits',
    description:
      'A full-stack web app built to replace spreadsheets for small nonprofits and churches. It handles donor and donation records, IRS-compliant year-end tax letters, and CSV import/export, all inside an isolated per-organization account.',
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
      'Implements the full subscription lifecycle end to end: free trial, Stripe checkout, webhook-driven state, and cancellation',
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
        'Integrated Stripe for billing: checkout sessions plus subscription lifecycle webhooks, with signature verification against the raw request body.',
        'Added a transactional email pipeline over Resend, driven by a node-cron daily job that checks trial expirations and sends 3-day and 1-day reminders.',
        'Implemented stateless JWT authentication with bcrypt password hashing and middleware-enforced route protection.',
        'Built CSV import and export with validation, per-row error reporting, and donor matching by email.',
        'Generated year-end tax letters server-side with PDFKit, individually or batched into a ZIP.',
        'Added an internal admin panel behind email-gated middleware for extending trials and managing accounts.',
      ],
      outcome: [
        'Deployed and running at donortrackapp.com.',
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
        { layer: 'Containerization', tech: 'Docker' },
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
        'When an automated guided vehicle faults on a manufacturing floor, the person who finds it is standing next to it, not at a computer. Reporting that fault needed to be fast and mobile, and the same vehicle often gets reported repeatedly by different people before anyone resolves it.',
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
      'A daily sports trivia game across MLB, NFL, and NBA. One attempt per sport per day, eight questions, scored on speed, with XP, leveling, leaderboards, and friends.',
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
      'Scoring happens exclusively server-side. The client submits a choice, never a score, so results cannot be manipulated from the browser',
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
        'Graded answers exclusively in server Route Handlers. The client posts its choice and the server computes the score.',
        'Enforced the one-attempt-per-sport-per-day rule at the database level rather than in application code.',
        'Handled mid-quiz abandonment with a pagehide listener firing navigator.sendBeacon to a forfeit endpoint, so XP for answered questions is awarded even if the player never returns. A ref guard prevents double-awarding across the SPA-navigation and unload paths.',
        'Computed account level from total XP across all sports using a closed-form formula, and animated the level-up across level boundaries client-side.',
      ],
      outcome: [
        'Playable end to end with accounts, guest mode, friends, and per-sport and overall leaderboards.',
        'No scheduled job in the system. Daily sets are derived, not published.',
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
    tech: ['Next.js', 'React', 'TypeScript', 'OpenAI', 'Tailwind CSS', 'Node.js', 'Supabase'],
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
