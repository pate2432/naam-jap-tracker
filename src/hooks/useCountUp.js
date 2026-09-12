import { useEffect, useRef, useState } from 'react'

export function useCountUp(value, duration = 900) {
  const [display, setDisplay] = useState(Number(value) || 0)
  const fromRef = useRef(Number(value) || 0)

  useEffect(() => {
    const next = Number(value) || 0
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let frame = 0
    const from = fromRef.current

    const finish = (result) => {
      fromRef.current = result
      setDisplay(result)
    }

    if (reduced) {
      frame = requestAnimationFrame(() => finish(next))
      return () => cancelAnimationFrame(frame)
    }

    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(Math.round(from + (next - from) * eased))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        fromRef.current = next
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return display
}
