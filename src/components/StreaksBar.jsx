export default function StreaksBar({ streaks, profiles }) {
  return (
    <div className="streaks-bar reveal" style={{ '--reveal-delay': '0.08s' }}>
      {profiles.map((profile) => (
        <span key={profile.id}>
          {profile.display_name} {streaks.perUser[profile.id] || 0} days
        </span>
      ))}
      <span className="together">together {streaks.together || 0} days</span>
    </div>
  )
}
