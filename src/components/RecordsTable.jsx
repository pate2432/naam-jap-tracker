export default function RecordsTable({ entries, profiles }) {
  return (
    <div className="records-card">
      <h3>Daily records</h3>
      <div className="records-grid">
        {profiles.map((profile) => {
          const entry = entries.find((item) => item.user_id === profile.id)
          return (
            <div className="records-item" key={profile.id}>
              <span className="records-name">{profile.display_name}</span>
              <span className="records-count">
                {entry ? entry.count : '--'}
              </span>
              <span className="records-label">jap</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
