import { useMemo, useState } from 'react'
import { PrefsContext } from './context'

export function PrefsProvider({ children }) {
  const [blessingSeen, setBlessingSeenState] = useState(false)

  const value = useMemo(
    () => ({
      blessingSeen,
      markBlessingSeen: () => {
        setBlessingSeenState(true)
      },
    }),
    [blessingSeen],
  )

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}
