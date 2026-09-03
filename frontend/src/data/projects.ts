export interface Project {
  name: string
  description: string
  stack: string[]
  href: string
}

// Add entries here as projects get built — the Projects section
// renders this list automatically and falls back to an empty state.
export const projects: Project[] = []
