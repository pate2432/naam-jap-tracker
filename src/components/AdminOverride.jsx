import { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminOverride({ profiles }) {
  const [secret, setSecret] = useState('')
  const [userId, setUserId] = useState('')
  const [date, setDate] = useState('')
  const [count, setCount] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const canSubmit = secret && userId && date && count !== ''

  const sortedProfiles = useMemo(
    () => profiles.slice().sort((a, b) => a.display_name.localeCompare(b.display_name)),
    [profiles],
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')

    if (!canSubmit) return

    const numericCount = Number(count)
    if (Number.isNaN(numericCount) || numericCount < 0) {
      setError('Count must be a number greater than or equal to 0.')
      return
    }

    setBusy(true)
    const { error: rpcError } = await supabase.rpc('admin_update_jap_entry', {
      secret_input: secret,
      target_user_id: userId,
      target_date: date,
      new_count: numericCount,
    })
    setBusy(false)

    if (rpcError) {
      setError(rpcError.message)
      return
    }

    setStatus('Admin override saved. Refresh to see the latest totals.')
  }

  return (
    <section className="panel admin-panel">
      <div className="panel-header">
        <div>
          <h3>Admin override</h3>
          <p className="muted">
            Update past dates with the admin secret. Use carefully.
          </p>
        </div>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Admin secret
          <input
            type="password"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            placeholder="Enter admin secret"
          />
        </label>
        <label>
          User
          <select value={userId} onChange={(event) => setUserId(event.target.value)}>
            <option value="">Select user</option>
            {sortedProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.display_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <label>
          New count
          <input
            type="number"
            min="0"
            value={count}
            onChange={(event) => setCount(event.target.value)}
          />
        </label>

        {error ? <div className="form-alert error">{error}</div> : null}
        {status ? <div className="form-alert success">{status}</div> : null}

        <button className="primary" type="submit" disabled={!canSubmit || busy}>
          {busy ? 'Updating...' : 'Apply override'}
        </button>
      </form>
    </section>
  )
}
