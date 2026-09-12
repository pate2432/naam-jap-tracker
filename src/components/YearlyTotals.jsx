export default function YearlyTotals({ totals, yearLabel, profiles }) {
  return (
    <div className="yearly-panel">
      <p className="muted">{yearLabel} devotion, gathered.</p>
      <div className="yearly-grid">
        {profiles.map((profile) => (
          <div className="yearly-card" key={profile.id}>
            <span className="yearly-title">{profile.display_name}</span>
            <span className="yearly-value">
              {(totals[profile.id] || 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
