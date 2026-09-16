export const SKY_PRESETS = [
  { id: 'live', label: 'Live', hour: null },
  { id: 'dawn', label: 'Dawn', hour: 5.8 },
  { id: 'morning', label: 'Morning', hour: 8.2 },
  { id: 'noon', label: 'Noon', hour: 12.5 },
  { id: 'golden', label: 'Golden', hour: 16.6 },
  { id: 'sunset', label: 'Sunset', hour: 18.4 },
  { id: 'night', label: 'Night', hour: 22 },
]

const KEY = 'naamjap.skyPreview'

let overrideHour = null
const listeners = new Set()

const readStored = () => {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (raw == null || raw === '') return null
    const hour = Number(raw)
    return Number.isFinite(hour) ? hour : null
  } catch {
    return null
  }
}

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  overrideHour = readStored()
}

export const getSkyOverride = () => overrideHour

export const setSkyOverride = (hour) => {
  overrideHour = hour
  try {
    if (hour == null) window.sessionStorage.removeItem(KEY)
    else window.sessionStorage.setItem(KEY, String(hour))
  } catch {
    // Private mode can block storage.
  }
  listeners.forEach((listen) => listen(overrideHour))
}

export const subscribeSkyOverride = (listen) => {
  listeners.add(listen)
  return () => listeners.delete(listen)
}
