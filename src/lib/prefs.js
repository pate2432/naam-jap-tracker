export const SHARED_GOAL = 20000000

export const PREF_KEYS = {
  theme: 'naamjap.theme',
}

export const readPref = (key, fallback = '') => {
  try {
    return window.localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

export const writePref = (key, value) => {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Private mode can block storage.
  }
}

export const resolveTheme = (value) => {
  if (value === 'light') return 'light'
  return 'dark'
}
