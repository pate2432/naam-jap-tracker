import { useEffect, useState } from 'react'
import { getSkyState } from '../lib/sky'

export function useSkyClock() {
  const [now, setNow] = useState(() => new Date())
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const enter = window.setTimeout(() => setEntered(true), 40)
    const tick = window.setInterval(() => setNow(new Date()), 1000)
    return () => {
      window.clearTimeout(enter)
      window.clearInterval(tick)
    }
  }, [])

  return { sky: getSkyState(now), entered }
}
