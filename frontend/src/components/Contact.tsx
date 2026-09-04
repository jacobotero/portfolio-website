import { type FormEvent, useState } from 'react'
import { Reveal } from './Reveal'
import { TerminalHeading } from './TerminalHeading'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const API_URL = import.meta.env.VITE_CONTACT_API_URL as string | undefined

const SOCIALS = [
  { label: 'github', href: 'https://github.com/jacobotero' },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/jacob-otero' },
  { label: 'email', href: 'mailto:jacobotero0313@gmail.com' },
]

export function Contact() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim(),
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
    <section id="contact" className="px-6 py-24 border-t border-border scroll-mt-20">
      <div className="mx-auto max-w-4xl">
        <TerminalHeading command="./contact.sh" title="Get in touch" />

        <Reveal className="grid md:grid-cols-[1fr_auto] gap-12">
          <form
            onSubmit={handleSubmit}
            noValidate
            className="space-y-5 max-w-lg"
          >
            <Field label="name" id="name" name="name" type="text" />
            <Field label="email" id="email" name="email" type="email" />
            <div>
              <label
                htmlFor="message"
                className="block text-xs text-text-dim mb-1.5"
              >
                <span className="text-accent">$</span> message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                className="w-full bg-bg-raised border border-border px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="px-4 py-2 text-sm border border-accent-dim text-accent hover:bg-accent/10 transition-colors disabled:opacity-50"
            >
              {status === 'submitting' ? 'sending…' : './send.sh'}
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

          <div className="text-sm">
            <p className="text-xs uppercase tracking-widest text-text-dim mb-3">
              elsewhere
            </p>
            <ul className="space-y-2">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-text hover:text-accent transition-colors before:content-['→_'] before:text-accent"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
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
        <span className="text-accent">$</span> {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        className="w-full bg-bg-raised border border-border px-3 py-2 text-sm text-text focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  )
}
