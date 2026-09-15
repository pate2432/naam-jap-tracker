const keyFor = (userId, localDate) => `naamjap.today.${userId}.${localDate}`

export const readLocalJap = (userId, localDate) => {
  if (!userId || !localDate) return 0
  try {
    const raw = window.localStorage.getItem(keyFor(userId, localDate))
    const value = Number(raw)
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

export const writeLocalJap = (userId, localDate, count) => {
  if (!userId || !localDate) return
  try {
    window.localStorage.setItem(keyFor(userId, localDate), String(count))
  } catch {
    // Private mode can block storage.
  }
}
