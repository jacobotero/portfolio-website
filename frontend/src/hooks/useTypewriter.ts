import { useEffect, useState } from 'react'

export function useTypewriter(text: string, speedMs = 45, startDelayMs = 0) {
  const [output, setOutput] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    let interval: ReturnType<typeof setInterval>

    const start = setTimeout(() => {
      interval = setInterval(() => {
        i += 1
        setOutput(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speedMs)
    }, startDelayMs)

    return () => {
      clearTimeout(start)
      clearInterval(interval)
    }
  }, [text, speedMs, startDelayMs])

  return { output, done }
}
