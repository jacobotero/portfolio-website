import { type FormEvent, useState } from 'react'
import { PageHero } from '../components/PageHero'
import { Reveal } from '../components/Reveal'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const API_URL = import.meta.env.VITE_CONTACT_API_URL as string | undefined

const LOCATION = 'Dallas-Fort Worth Metroplex, TX'

// Same icon paths used in Hero.tsx / SocialSidebar.tsx / Footer.tsx — kept
// identical rather than re-derived, so the mark is consistent everywhere it
// appears on the site.
const CONNECT = [
  {
    label: 'GitHub',
    value: 'github.com/jacobotero',
    href: 'https://github.com/jacobotero',
    path: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.679.919.679 1.852 0 1.336-.012 2.415-.012 2.743 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z',
  },
  {
    label: 'LinkedIn',
    value: 'linkedin.com/in/jacob-otero',
    href: 'https://www.linkedin.com/in/jacob-otero',
    path: 'M6.94 8.5H3.56V21h3.38V8.5ZM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM21 21h-3.38v-6.5c0-1.55-.03-3.55-2.17-3.55-2.17 0-2.5 1.7-2.5 3.44V21H9.57V8.5h3.24v1.7h.05c.45-.86 1.56-1.77 3.2-1.77 3.42 0 4.94 2.25 4.94 6.03V21Z',
  },
  {
    label: 'Email',
    value: 'jacobotero0313@gmail.com',
    href: 'mailto:jacobotero0313@gmail.com',
    path: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.7 2 7.3 5.5L19.3 7H4.7ZM4 8.2V17h16V8.2l-8 6-8-6Z',
  },
]

export function ContactPage() {
  useDocumentTitle(
    'Contact - Jacob Otero',
    'Get in touch with Jacob Otero about full-time software engineering roles.',
  )
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      // Optional: the Lambda accepts and forwards it when present, but does
      // not require it — existing validation below is otherwise unchanged.
      subject: (
        form.elements.namedItem('subject') as HTMLInputElement
      ).value.trim(),
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
      setError('message failed to send. Try again, or email me directly')
      setStatus('error')
    }
  }

  return (
    <>
      <PageHero
        title="Get in touch"
        subtitle="Have a project in mind or want to collaborate? I'd love to hear from you!"
      />

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-5xl grid md:grid-cols-[1.3fr_1fr] gap-6 items-start">
          <Reveal className="rounded-2xl border border-border bg-bg-raised p-6 sm:p-8">
            <h2 className="font-display font-bold text-lg text-heading">
              Send me a message
            </h2>
            <p className="mt-1 text-sm text-text-dim">
              Fill out the form below and I'll get back to you as soon as
              possible.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
              <Field
                label="Name"
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
              />
              <Field
                label="Email"
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
              />
              <Field
                label="Subject"
                id="subject"
                name="subject"
                type="text"
                placeholder="Project Inquiry"
              />

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
                  placeholder="I'd like to discuss a project opportunity..."
                  className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder:text-text-dim/60 focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full sm:w-auto px-5 py-2.5 text-sm font-display font-medium rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors disabled:opacity-50"
              >
                {status === 'submitting' ? 'Sending…' : 'Send Message'}
              </button>

              {/* Always present so the live region exists in the DOM before
                  text lands in it — one that appears at the same moment as
                  its content is frequently not announced. */}
              <div role="status" aria-live="polite">
                {status === 'success' && (
                  <p className="text-sm text-accent">
                    ✓ message sent. I'll get back to you soon.
                  </p>
                )}
                {status === 'error' && (
                  <p className="text-sm text-danger">✗ {error}</p>
                )}
              </div>
            </form>
          </Reveal>

          <Reveal
            delay={0.08}
            className="rounded-2xl border border-border bg-bg-raised p-6 sm:p-8"
          >
            <h2 className="font-display font-bold text-lg text-heading">
              Connect with me
            </h2>
            <p className="mt-1 text-sm text-text-dim">
              You can also reach out to me directly through these channels
            </p>

            <ul className="mt-6 space-y-3">
              {CONNECT.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-3 hover:border-border-strong transition-colors"
                  >
                    <span className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-bg-elevated text-accent">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4"
                        aria-hidden="true"
                      >
                        <path d={item.path} />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-heading">
                        {item.label}
                      </span>
                      <span className="block text-xs text-text-dim truncate">
                        {item.value}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs uppercase tracking-widest text-text-dim mb-1.5">
                Current Location
              </p>
              <p className="text-sm text-text">{LOCATION}</p>
            </div>
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
  placeholder,
}: {
  label: string
  id: string
  name: string
  type: string
  placeholder?: string
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
        placeholder={placeholder}
        className="w-full bg-bg border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder:text-text-dim/60 focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  )
}
