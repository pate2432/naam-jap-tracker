import { useEffect, useState } from 'react'
import { getSkyState } from '../lib/sky'
import { getSkyOverride, subscribeSkyOverride } from '../lib/skyPreview'

const dateAtHour = (hour, now) => {
  if (hour == null) return now
  const date = new Date(now)
  const hours = Math.floor(hour)
  const minutes = Math.round((hour - hours) * 60)
  date.setHours(hours, minutes, 0, 0)
  return date
}

export function useSkyClock() {
  const [now, setNow] = useState(() => new Date())
  const [overrideHour, setOverrideHour] = useState(() => getSkyOverride())
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const enter = window.setTimeout(() => setEntered(true), 40)
    const tick = window.setInterval(() => setNow(new Date()), 1000)
    const unsubscribe = subscribeSkyOverride(setOverrideHour)
    return () => {
      window.clearTimeout(enter)
      window.clearInterval(tick)
      unsubscribe()
    }
  }, [])

  return { sky: getSkyState(dateAtHour(overrideHour, now)), entered }
}
