export default function YearlyTotals({ totals, yearLabel, profiles }) {
  return (
    <div className="panel yearly-panel">
      <div className="panel-header">
        <h3>{yearLabel} totals</h3>
        <p className="muted">Your yearly devotion summary.</p>
      </div>
      <div className="yearly-grid">
        {profiles.map((profile) => (
          <div className="yearly-card" key={profile.id}>
            <span className="yearly-title">{profile.display_name}</span>
            <span className="yearly-value">{totals[profile.id] || 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
