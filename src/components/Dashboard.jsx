import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  getLocalTimeZone,
  getTodayLocalDate,
  isToday,
} from '../lib/date'
import {
  getMonthlySummary,
  getMonthlyTrendSeries,
  getWeeklySummary,
  getYearlyTotals,
  sumByUser,
} from '../lib/stats'
import QuoteBanner from './QuoteBanner'
import DateSelector from './DateSelector'
import EntryForm from './EntryForm'
import RecordsTable from './RecordsTable'
import StatsCards from './StatsCards'
import WeeklySummary from './WeeklySummary'
import MonthlyInsights from './MonthlyInsights'
import YearlyTotals from './YearlyTotals'
import AdminOverride from './AdminOverride'

const getLabelMap = () => {
  const raw = import.meta.env.VITE_USER_LABELS || ''
  return raw.split(',').reduce((acc, item) => {
    const [email, name] = item.split(':').map((part) => part.trim())
    if (email && name) acc[email.toLowerCase()] = name
    return acc
  }, {})
}

export default function Dashboard({ session }) {
  const tz = getLocalTimeZone()
  const today = getTodayLocalDate(tz)
  const [selectedDate, setSelectedDate] = useState(today)
  const [entries, setEntries] = useState([])
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setSelectedDate(today)
  }, [today])

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true)
      await ensureProfile()
      await Promise.all([loadProfiles(), loadEntries()])
      setLoading(false)
    }

    bootstrap()
  }, [])

  const labelMap = useMemo(() => getLabelMap(), [])

  const ensureProfile = async () => {
    const user = session.user
    const displayName =
      labelMap[user.email?.toLowerCase()] ||
      user.user_metadata?.display_name ||
      (user.email || '').split('@')[0] ||
      'Naam Japper'

    await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      display_name: displayName,
    })
  }

  const loadProfiles = async () => {
    const { data, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .order('display_name', { ascending: true })

    if (profilesError) {
      setError(profilesError.message)
      return
    }

    if (data && data.length > 0) {
      setProfiles(data)
    }
  }

  const loadEntries = async () => {
    const { data, error: entriesError } = await supabase
      .from('jap_entries')
      .select(
        'id, user_id, local_date, local_tz, count, created_at, updated_at',
      )
      .order('local_date', { ascending: false })

    if (entriesError) {
      setError(entriesError.message)
      return
    }

    setEntries(data || [])
  }

  const handleSave = async (count) => {
    setStatus('')
    setError('')

    const payload = {
      user_id: session.user.id,
      local_date: selectedDate,
      local_tz: tz,
      count,
      updated_at: new Date().toISOString(),
    }

    const { data, error: saveError } = await supabase
      .from('jap_entries')
      .upsert(payload, { onConflict: 'user_id,local_date' })
      .select()
      .single()

    if (saveError) {
      setError(saveError.message)
      return
    }

    setEntries((prev) => {
      const existingIndex = prev.findIndex(
        (entry) =>
          entry.user_id === session.user.id &&
          entry.local_date === selectedDate,
      )

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = data
        return updated
      }

      return [data, ...prev]
    })
    setStatus('Saved for the day.')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const selectedEntries = entries.filter(
    (entry) => entry.local_date === selectedDate,
  )

  const currentEntry = selectedEntries.find(
    (entry) => entry.user_id === session.user.id,
  )

  const isEditable = isToday(selectedDate, tz)
  const totals = useMemo(() => sumByUser(entries), [entries])
  const weeklySummary = useMemo(
    () => getWeeklySummary(entries, tz),
    [entries, tz],
  )
  const monthlySummary = useMemo(
    () => getMonthlySummary(entries, tz),
    [entries, tz],
  )
  const monthlySeries = useMemo(
    () => getMonthlyTrendSeries(entries, tz),
    [entries, tz],
  )
  const yearlyTotals = useMemo(() => getYearlyTotals(entries, tz), [entries, tz])
  const visibleProfiles = useMemo(() => {
    if (profiles.length > 0) return profiles
    const uniqueIds = Array.from(
      new Set(entries.map((entry) => entry.user_id).concat(session.user.id)),
    )
    return uniqueIds.map((id) => ({
      id,
      display_name: id === session.user.id ? 'You' : 'Devotee',
    }))
  }, [entries, profiles, session.user.id])

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Preparing your tracker...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="muted">Radhe Radhe,</p>
          <h1>Naam Jap Tracker</h1>
          <p className="subtitle">Softly tracking devotion, together.</p>
        </div>
        <button className="ghost" onClick={handleLogout} type="button">
          Sign out
        </button>
      </header>

      <QuoteBanner />

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Daily entry</h3>
            <p className="muted">Local timezone: {tz}</p>
          </div>
          <DateSelector selectedDate={selectedDate} onChange={setSelectedDate} />
        </div>

        {status ? <div className="form-alert success">{status}</div> : null}
        {error ? <div className="form-alert error">{error}</div> : null}

        <div className="panel-grid">
          <EntryForm
            selectedDate={selectedDate}
            currentEntry={currentEntry}
            isEditable={isEditable}
            onSave={handleSave}
          />
          <RecordsTable entries={selectedEntries} profiles={visibleProfiles} />
        </div>
      </section>

      <StatsCards totals={totals} profiles={visibleProfiles} />
      <WeeklySummary summary={weeklySummary} profiles={visibleProfiles} />
      <MonthlyInsights
        monthKey={monthlySummary.currentMonth}
        prevMonthKey={monthlySummary.prevMonth}
        currentTotals={monthlySummary.currentTotals}
        prevTotals={monthlySummary.prevTotals}
        trendSeries={monthlySeries}
        profiles={visibleProfiles}
      />
      <YearlyTotals
        totals={yearlyTotals}
        yearLabel={new Date().getFullYear()}
        profiles={visibleProfiles}
      />
      <AdminOverride profiles={visibleProfiles} />
    </div>
  )
}
