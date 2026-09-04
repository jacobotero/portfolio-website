import { useEffect } from 'react'

/**
 * Sets document.title on mount and whenever it changes. Restores nothing on
 * unmount — in a client-routed SPA the next route's own call simply
 * overwrites it, the same way index.html's static title only ever mattered
 * for the very first paint and for crawlers that don't execute JS.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
