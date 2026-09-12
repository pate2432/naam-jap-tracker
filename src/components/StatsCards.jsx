import { useCountUp } from '../hooks/useCountUp'
import { SHARED_GOAL } from '../lib/prefs'

const RING = 2 * Math.PI * 36

function StatCard({ title, value, label }) {
  const display = useCountUp(value)

  return (
    <div className="stat-card">
      <span className="stat-title">{title}</span>
      <span className="stat-value">{display.toLocaleString()}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function TogetherCard({ value }) {
  const display = useCountUp(value)
  const progress = Math.min(1, value / SHARED_GOAL)
  const offset = RING * (1 - progress)

  return (
    <div className="stat-card highlight together-card">
      <div className="together-copy">
        <span className="stat-title">Divine together</span>
        <span className="stat-value">{display.toLocaleString()}</span>
        <span className="stat-label">
          {Math.round(progress * 100)}% of {SHARED_GOAL.toLocaleString()}
        </span>
      </div>
      <svg className="together-ring" viewBox="0 0 88 88" aria-hidden="true">
        <circle className="together-track" cx="44" cy="44" r="36" />
        <circle
          className="together-progress"
          cx="44"
          cy="44"
          r="36"
          style={{
            strokeDasharray: RING,
            strokeDashoffset: offset,
          }}
        />
      </svg>
    </div>
  )
}

export default function StatsCards({ totals, profiles }) {
  const combined = Object.values(totals).reduce((sum, value) => sum + value, 0)

  return (
    <div className="stats-grid reveal" style={{ '--reveal-delay': '0.16s' }}>
      {profiles.map((profile) => (
        <StatCard
          key={profile.id}
          title={profile.display_name}
          value={totals[profile.id] || 0}
          label="total jap"
        />
      ))}
      <TogetherCard value={combined} />
    </div>
  )
}
