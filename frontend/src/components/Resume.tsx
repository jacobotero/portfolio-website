import { Reveal } from './Reveal'
import { TerminalHeading } from './TerminalHeading'

export function Resume() {
  return (
    <section id="resume" className="px-6 py-24 border-t border-border scroll-mt-20">
      <div className="mx-auto max-w-4xl">
        <TerminalHeading command="cat resume.pdf" title="Resume" />

        <Reveal>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
            <a
              href="/resume.pdf"
              download="Jacob Otero - Resume.pdf"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-accent-dim text-accent hover:bg-accent/10 transition-colors w-fit"
            >
              ↓ download-resume.pdf
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border text-text-dim hover:border-text-dim hover:text-heading transition-colors w-fit"
            >
              open in new tab
            </a>
          </div>

          <div className="border border-border bg-bg-raised/40 aspect-[8.5/6] sm:aspect-[8.5/5] w-full overflow-hidden">
            <object
              data="/resume.pdf"
              type="application/pdf"
              className="w-full h-full"
              aria-label="Resume preview"
            >
              <p className="p-6 text-sm text-text-dim">
                Preview unavailable in this browser —{' '}
                <a href="/resume.pdf" className="text-accent underline">
                  download the PDF
                </a>{' '}
                instead.
              </p>
            </object>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
