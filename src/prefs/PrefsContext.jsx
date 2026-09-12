import { useEffect, useMemo, useState } from 'react'
import { PREF_KEYS, readPref, resolveTheme, writePref } from '../lib/prefs'
import { PrefsContext } from './context'

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.content = theme === 'light' ? '#f4ebe0' : '#120c1c'
  }
}

export function PrefsProvider({ children }) {
  const [theme, setThemeState] = useState(() =>
    resolveTheme(readPref(PREF_KEYS.theme, 'dark')),
  )
  const [blessingSeen, setBlessingSeenState] = useState(false)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      blessingSeen,
      setTheme: (next) => {
        const resolved = resolveTheme(next)
        setThemeState(resolved)
        writePref(PREF_KEYS.theme, resolved)
        applyTheme(resolved)
      },
      markBlessingSeen: () => {
        setBlessingSeenState(true)
      },
    }),
    [theme, blessingSeen],
  )

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}
