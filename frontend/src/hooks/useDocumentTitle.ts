import { useEffect } from 'react'

/**
 * Sets document.title — and, optionally, the `<meta name="description">`
 * content — on mount and whenever either changes. Restores nothing on
 * unmount — in a client-routed SPA the next route's own call simply
 * overwrites it, the same way index.html's static title/description only
 * ever mattered for the very first paint and for crawlers that don't
 * execute JS.
 *
 * `description` is optional so a caller can set only the title; omitting it
 * leaves the tag as whatever the previous route left behind (or index.html's
 * default, on first paint), rather than clearing it.
 */
export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = title
  }, [title])

  useEffect(() => {
    if (description === undefined) return
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', description)
  }, [description])
}
