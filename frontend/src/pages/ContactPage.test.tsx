import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '../context/ThemeProvider'
import { ContactPage } from './ContactPage'

// PageHero renders Starfield, which reads the theme via useTheme() — a
// ThemeProvider ancestor is required.
function renderPage() {
  return render(
    <ThemeProvider>
      <ContactPage />
    </ThemeProvider>,
  )
}

describe('ContactPage form', () => {
  it('rejects submission when required fields are empty', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /send/i }))

    expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument()
  })

  it('rejects an invalid email address', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/name/i), 'Jacob')
    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.type(screen.getByLabelText(/message/i), 'Hello there')
    await user.click(screen.getByRole('button', { name: /send/i }))

    expect(
      await screen.findByText(/enter a valid email address/i),
    ).toBeInTheDocument()
  })

  it('accepts valid input and attempts to submit', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/name/i), 'Jacob')
    await user.type(screen.getByLabelText(/email/i), 'jacob@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Hello there')
    await user.click(screen.getByRole('button', { name: /send/i }))

    // No contact API is configured in the test environment, so client-side
    // validation should pass and the submit path should be reached.
    expect(
      await screen.findByText(/contact endpoint not configured/i),
    ).toBeInTheDocument()
  })

  it('rejects an invalid email address', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.type(screen.getByLabelText(/name/i), 'Jacob')
    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.type(screen.getByLabelText(/message/i), 'Hello')
    await user.click(screen.getByRole('button', { name: /send/i }))

    expect(await screen.findByText(/valid email/i)).toBeInTheDocument()
  })

  it('rejects empty fields', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /send/i }))

    expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument()
  })

  it('has an always-present live region for the submission result', () => {
    renderPage()

    // Present before any submission, not conjured alongside its text — a
    // region that appears at the same moment as its content is frequently
    // not announced by assistive tech.
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('announces the error message through the live region', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: /send/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      /all fields are required/i,
    )
  })

  it('sets the document title', () => {
    renderPage()
    expect(document.title).toBe('Contact — Jacob Otero')
  })
})
