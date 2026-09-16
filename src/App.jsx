import { useEffect, useState } from 'react'
import './App.css'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { getPage, goToHome, goToJap } from './lib/route'
import { isJapOnly } from './lib/roles'
import { usePrefs } from './prefs/usePrefs'
import AmbientBackground from './components/AmbientBackground'
import AuthCard from './components/AuthCard'
import BlessingScreen from './components/BlessingScreen'
import Dashboard from './components/Dashboard'
import JapOnlyApp from './components/JapOnlyApp'
import SkyPreviewBar from './components/SkyPreviewBar'

function App() {
  const { blessingSeen } = usePrefs()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [page, setPage] = useState(getPage)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return undefined
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onPop = () => setPage(getPage())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const japOnly = isJapOnly(session)
  const onJapPage = Boolean(session) && (japOnly || page === 'jap')
  const skyPreview = import.meta.env.DEV ? <SkyPreviewBar /> : null

  if (!blessingSeen) {
    return (
      <div className="app-shell">
        {skyPreview}
        <AmbientBackground />
        <BlessingScreen />
      </div>
    )
  }

  return (
    <div className={`app-shell${onJapPage ? ' is-jap' : ''}`}>
      {skyPreview}
      <AmbientBackground />
      <main className={onJapPage ? 'jap-shell' : 'app-container'}>
        {!isSupabaseConfigured ? (
          <div className="auth-card reveal">
            <p className="eyebrow">Naam Jap Tracker</p>
            <h2>Connect Supabase</h2>
            <p className="muted">
              Add your Supabase keys in a local <code>.env</code> file to start
              the tracker.
            </p>
            <div className="setup-steps">
              <p>1) Create `.env` using `.env.example`</p>
              <p>2) Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`</p>
              <p>3) Restart the dev server</p>
            </div>
          </div>
        ) : loading ? (
          <div className="loading-state">
            <div className="lotus-loader" />
            <p>Opening the kunj...</p>
          </div>
        ) : session ? (
          japOnly ? (
            <JapOnlyApp session={session} />
          ) : (
            <Dashboard
              session={session}
              page={page}
              onSitForNaam={goToJap}
              onLeaveJap={goToHome}
            />
          )
        ) : (
          <AuthCard />
        )}
      </main>
    </div>
  )
}

export default App
