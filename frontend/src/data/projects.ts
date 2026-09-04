export interface Project {
  name: string
  category: string
  description: string
  stack: string[]
  href: string
}

// Add entries here as projects get built — the Projects section
// renders this list automatically and falls back to an empty state.
export const projects: Project[] = [
  {
    name: 'AGV Fault Tracker',
    category: 'Manufacturing',
    description:
      'Full-stack fault-tracking app for automated guided vehicles on a manufacturing floor, accessible via QR codes mounted on each AGV for on-the-spot reporting from a phone.',
    stack: ['Python', 'Flask', 'MongoDB', 'JavaScript'],
    href: 'https://github.com/jacobotero/agv-fault-tracker',
  },
]
