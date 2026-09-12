import { useContext } from 'react'
import { PrefsContext } from './context'

export function usePrefs() {
  const value = useContext(PrefsContext)
  if (!value) {
    throw new Error('usePrefs must be used within PrefsProvider')
  }
  return value
}
