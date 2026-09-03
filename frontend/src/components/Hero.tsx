import { useTypewriter } from '../hooks/useTypewriter'
import { Cursor } from './Cursor'

export function Hero() {
  const { output: line1, done: line1Done } = useTypewriter('whoami', 70, 300)
  const { output: line2, done: line2Done } = useTypewriter(
    'Jacob Otero — Software Engineer',
    35,
    1100,
  )
  const { output: line3 } = useTypewriter(
    'CS senior · AWS Solutions Architect · Python & AI',
    28,
    2500,
  )

  return (
    <section
      id="top"
      className="min-h-svh flex flex-col justify-center px-6 pt-14"
    >
      <div className="mx-auto max-w-4xl w-full">
        <div className="rounded-md border border-border bg-bg-raised/60 shadow-2xl shadow-black/40 overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-bg/40">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-xs text-text-dim">
              bash — /home/jacob
            </span>
          </div>
          <div className="p-6 sm:p-10 text-left">
            <p className="text-sm sm:text-base text-text-dim">
              <span className="text-accent">jacob@portfolio</span>
              <span>:~$ </span>
              {line1}
              {!line1Done && <Cursor />}
            </p>

            {line1Done && (
              <h1 className="font-display mt-6 text-3xl sm:text-5xl text-heading font-medium tracking-tight leading-tight">
                {line2}
                {!line2Done && <Cursor />}
              </h1>
            )}

            {line2Done && (
              <p className="mt-4 text-sm sm:text-lg text-text-dim">
                {line3}
                <Cursor />
              </p>
            )}

            {line2Done && (
              <div className="mt-8 flex flex-wrap gap-3 animate-fade-up">
                <a
                  href="#projects"
                  className="px-4 py-2 text-sm border border-accent-dim text-accent hover:bg-accent/10 transition-colors"
                >
                  ./view-projects.sh
                </a>
                <a
                  href="#contact"
                  className="px-4 py-2 text-sm border border-border text-text-dim hover:border-text-dim hover:text-heading transition-colors"
                >
                  ./get-in-touch.sh
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
