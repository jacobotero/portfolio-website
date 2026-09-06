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

// Adding, removing, or renaming a slug here? Update the corresponding
// <url> entries in frontend/public/sitemap.xml too — it's hand-maintained,
// not generated from this file.
export const projects: Project[] = [
  {
    slug: 'donortrack',
    title: 'DonorTrack',
    tagline: 'Free, multi-tenant donor management for small nonprofits',
    description:
      'A full-stack web app built to replace spreadsheets for small nonprofits and churches. It handles donor and donation records, IRS-compliant year-end tax letters, and CSV import/export, all inside an isolated per-organization account — free to use, with every feature available to every account.',
    tech: [
      'React',
      'TypeScript',
      'Node.js',
      'PostgreSQL',
      'Prisma',
      'AWS',
      'Tailwind CSS',
      'Docker',
    ],
    highlights: [
      'Migrated off a dead third-party host onto a serverless AWS stack (Lambda container image, API Gateway, S3, CloudFront) provisioned entirely as code with CDK',
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
        'Provisioned the entire deployment as code with AWS CDK (Python): S3 + CloudFront for the frontend, API Gateway in front of a containerized Lambda for the backend, and SSM Parameter Store for secrets.',
        'Set up CI/CD with GitHub Actions authenticating to AWS via OIDC role assumption — no long-lived AWS credentials stored anywhere.',
        'Implemented stateless JWT authentication with bcrypt password hashing and middleware-enforced route protection.',
        'Built CSV import and export with validation, per-row error reporting, and donor matching by email.',
        'Generated year-end tax letters server-side with PDFKit, individually or batched into a ZIP.',
        'Built an internal admin panel, protected by dedicated admin-only middleware, for account visibility and support.',
      ],
      outcome: [
        'Deployed and running at donortrackapp.com on infrastructure architected to run indefinitely within AWS\'s free tier.',
        'Removed all paywall and subscription gating — every account gets full access to every feature, free, with no trial or card required.',
        'API-level rate limiting across all routes.',
        'sitemap.xml and robots.txt served and submitted to Google Search Console.',
      ],
      stack: [
        { layer: 'Frontend', tech: 'React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Recharts' },
        { layer: 'Backend', tech: 'Node.js, Express, Prisma 7' },
        { layer: 'Database', tech: 'PostgreSQL (Neon, serverless)' },
        { layer: 'Infrastructure', tech: 'AWS CDK (Python) — Lambda, API Gateway, S3, CloudFront, SSM' },
        { layer: 'Containerization', tech: 'Docker (Lambda container image)' },
        { layer: 'CI/CD', tech: 'GitHub Actions via OIDC (no stored AWS credentials)' },
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
  {
    slug: 'portfolio-infrastructure',
    title: 'Portfolio Website Infrastructure',
    tagline: 'The AWS pipeline behind the site you’re looking at right now',
    description:
      'This portfolio itself: a React SPA served from S3 through CloudFront, backed by API Gateway and Lambda for the contact form and AI assistant, provisioned entirely as code with AWS CDK and deployed through GitHub Actions.',
    tech: [
      'AWS CDK',
      'S3',
      'CloudFront',
      'Lambda',
      'API Gateway',
      'SES',
      'Route 53',
      'GitHub Actions',
    ],
    highlights: [
      'Entire stack (CDN, storage, compute, DNS, email) defined as code in AWS CDK and deployed through CI/CD, not clicked together in a console',
      'Contact form and AI assistant run on Lambda behind API Gateway, with the Gemini API key stored in SSM Parameter Store rather than in code or an environment file',
      'GitHub Actions authenticates to AWS via OIDC, so no long-lived AWS access keys are stored as repo secrets',
    ],
    cover: '/covers/portfolio-infrastructure.svg',
    github: 'https://github.com/jacobotero/portfolio-website',
    live: 'https://jacobotero.dev',
    featured: false,
    detail: {
      problem:
        'A portfolio site is only half the pitch for someone going for cloud or backend roles — the other half is proving you can actually stand up and run real infrastructure, not just push a static build to a host that does everything for you. I wanted this site’s own deployment to be that proof, built on the same AWS services covered by the Solutions Architect - Associate exam.',
      approach: [
        'Provisioned the whole stack in AWS CDK (Python): a private S3 bucket serving the built frontend through CloudFront with Origin Access Control, so the bucket itself is never public.',
        'Routed the domain through Route 53 with an ACM certificate for HTTPS, and configured CloudFront’s error responses to fall back to index.html so client-side routing survives a hard refresh on a nested path.',
        'Built the contact form and the AI assistant as separate Lambda functions (Python) behind an API Gateway HTTP API, each scoped to its own least-privilege IAM role.',
        'Verified the sending domain with SES and DKIM so contact-form email passes DMARC alignment instead of landing in spam.',
        'Stored the Gemini API key in SSM Parameter Store (SecureString, standard tier, no extra cost) rather than an environment variable or a secret baked into the Lambda package.',
        'Wired GitHub Actions to deploy on push via OpenID Connect federation to an IAM role, so no AWS access keys live in the repo at all.',
        'Wrote pytest unit tests for both Lambda handlers, mocking AWS with moto, and Vitest/React Testing Library coverage for the frontend — both run in CI before anything deploys.',
      ],
      outcome: [
        'Everything here, frontend included, is defined in version-controlled code and can be rebuilt from a cdk deploy and a push to main.',
        'No AWS credentials of any kind are stored as a GitHub secret.',
        'The contact form and AI assistant both run at effectively zero cost on AWS’s free tier at this site’s traffic level.',
      ],
      stack: [
        { layer: 'CDN & hosting', tech: 'S3, CloudFront (Origin Access Control), Route 53, ACM' },
        { layer: 'Compute', tech: 'AWS Lambda (Python 3.13), API Gateway HTTP API' },
        { layer: 'Email', tech: 'SES with a DKIM-verified sending domain' },
        { layer: 'Secrets', tech: 'SSM Parameter Store (SecureString)' },
        { layer: 'IaC', tech: 'AWS CDK (Python)' },
        { layer: 'CI/CD', tech: 'GitHub Actions, OIDC-federated deploys (no stored AWS keys)' },
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
