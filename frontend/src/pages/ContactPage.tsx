import { type FormEvent, useState } from 'react'
import { PageHero } from '../components/PageHero'
import { Reveal } from '../components/Reveal'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const API_URL = import.meta.env.VITE_CONTACT_API_URL as string | undefined

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/jacobotero' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jacob-otero' },
  { label: 'Email', href: 'mailto:jacobotero0313@gmail.com' },
]

export function ContactPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  // Ported verbatim from the previous Contact.tsx — this is live against the
  // deployed Lambda, so the validation and request shape must not change.
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
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
      setError('message failed to send — try again or email me directly')
      setStatus('error')
    }
  }

  return (
    <>
      <PageHero
        title="Get in touch"
        subtitle="Open to full-time software engineering roles"
      />

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl grid md:grid-cols-[1fr_auto] gap-12">
          <Reveal>
            <form onSubmit={handleSubmit} noValidate className="space-y-5 max-w-lg">
              <Field label="Name" id="name" name="name" type="text" />
              <Field label="Email" id="email" name="email" type="email" />

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
                  className="w-full bg-bg-raised border border-border rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-5 py-2.5 text-sm font-display font-medium rounded-full bg-accent text-accent-contrast hover:bg-accent-strong transition-colors disabled:opacity-50"
              >
                {status === 'submitting' ? 'Sending…' : 'Send message'}
              </button>

              {status === 'success' && (
                <p className="text-sm text-accent">
                  ✓ message sent — I'll get back to you soon.
                </p>
              )}
              {status === 'error' && (
                <p className="text-sm text-red-400">✗ {error}</p>
              )}
            </form>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="text-xs uppercase tracking-widest text-text-dim mb-4">
              Elsewhere
            </p>
            <ul className="space-y-2">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-text hover:text-accent transition-colors"
                  >
                    <span className="text-accent" aria-hidden="true">
                      →{' '}
                    </span>
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
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
}: {
  label: string
  id: string
  name: string
  type: string
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
        className="w-full bg-bg-raised border border-border rounded-xl px-3.5 py-2.5 text-sm text-text focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  )
}
