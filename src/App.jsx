import { useEffect, useState } from 'react'
import './App.css'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import AuthCard from './components/AuthCard'
import Dashboard from './components/Dashboard'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
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

  return (
    <div className="app-shell">
      <div className="app-overlay" />
      <div className="app-decorations" aria-hidden="true">
        <span className="icon lotus" />
        <span className="icon flute" />
        <span className="icon cow" />
        <span className="icon peacock" />
        <span className="icon radha-krishna" />
      </div>
      <main className="app-container">
        {!isSupabaseConfigured ? (
          <div className="auth-card">
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
            <div className="spinner" />
            <p>Loading serenity...</p>
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
