import type { ReactNode } from 'react'
import { NebulaGlow } from './NebulaGlow'
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
        fullHeight ? 'min-h-screen flex items-center' : 'pt-28 sm:pt-36 pb-20 sm:pb-24'
      }`}
    >
      <NebulaGlow />
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
