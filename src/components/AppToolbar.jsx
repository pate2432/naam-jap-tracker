import { usePrefs } from '../prefs/usePrefs'

export default function AppToolbar() {
  const { theme, setTheme } = usePrefs()

  return (
    <div className="app-toolbar">
      <button
        type="button"
        className="icon-btn"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      >
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
    </div>
  )
}
