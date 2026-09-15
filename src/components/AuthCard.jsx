import { useState } from 'react'
import { supabase } from '../lib/supabase'
import PromiseVerse from './PromiseVerse'

const getAllowedEmails = () => {
  const raw = import.meta.env.VITE_ALLOWED_EMAILS || ''
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export default function AuthCard() {
  const allowedEmails = getAllowedEmails()
  const [mode, setMode] = useState('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isAllowed =
    allowedEmails.length === 0 ||
    allowedEmails.includes(email.trim().toLowerCase())

  const handlePasswordSignIn = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!isAllowed) {
      setError('This email is not allowed for this tracker.')
      return
    }

    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setLoading(false)

    if (signInError) {
      setError(signInError.message)
    }
  }

  const handleMagicLink = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!isAllowed) {
      setError('This email is not allowed for this tracker.')
      return
    }

    setLoading(true)
    const { error: magicError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    setLoading(false)

    if (magicError) {
      setError(magicError.message)
      return
    }

    setMessage('Magic link sent. Please check your inbox.')
  }

  return (
    <div className="auth-card reveal">
      <div className="auth-crest" aria-hidden="true">
        <span className="auth-lotus" />
      </div>
      <p className="eyebrow">Radhe Radhe</p>
      <h2>Naam Jap Tracker</h2>
      <p className="muted auth-lead">
        A quiet place to keep the Name.
      </p>

      <PromiseVerse compact />

      <div className="auth-tabs">
        <button
          className={mode === 'password' ? 'active' : ''}
          onClick={() => setMode('password')}
          type="button"
        >
          Password
        </button>
        <button
          className={mode === 'magic' ? 'active' : ''}
          onClick={() => setMode('magic')}
          type="button"
        >
          Magic link
        </button>
      </div>

      <form
        onSubmit={mode === 'password' ? handlePasswordSignIn : handleMagicLink}
        className="auth-form"
      >
        <label>
          Email
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>

        {mode === 'password' ? (
          <label>
            Password
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
        ) : null}

        {error ? <div className="form-alert error">{error}</div> : null}
        {message ? <div className="form-alert success">{message}</div> : null}

        <button className="primary" type="submit" disabled={loading}>
          {loading
            ? 'Please wait...'
            : mode === 'password'
              ? 'Enter the kunj'
              : 'Send magic link'}
        </button>
      </form>
    </div>
  )
}
