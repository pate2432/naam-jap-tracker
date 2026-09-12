import { useEffect, useState } from 'react'
import './App.css'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { usePrefs } from './prefs/usePrefs'
import AmbientBackground from './components/AmbientBackground'
import AppToolbar from './components/AppToolbar'
import AuthCard from './components/AuthCard'
import BlessingScreen from './components/BlessingScreen'
import Dashboard from './components/Dashboard'

function App() {
  const { blessingSeen } = usePrefs()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

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

  if (!blessingSeen) {
    return (
      <div className="app-shell">
        <AmbientBackground />
        <BlessingScreen />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <AmbientBackground />
      <div className="app-topbar">
        <AppToolbar />
      </div>
      <main className="app-container">
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
          <Dashboard session={session} />
        ) : (
          <AuthCard />
        )}
      </main>
    </div>
  )
}

export default App
