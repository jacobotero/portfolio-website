import type { ReactNode } from 'react'
import { useRevealOnScroll } from '../hooks/useRevealOnScroll'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const { ref, visible } = useRevealOnScroll<HTMLDivElement>()

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}
