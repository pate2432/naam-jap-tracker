export default function SkyCycle({ sky, entered }) {
  const { sun, moon, colors, night } = sky
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const show = entered || reduced

  return (
    <div
      className={`sky-cycle${show ? ' entered' : ''}`}
      style={{
        '--sky-top': colors.top,
        '--sky-mid': colors.mid,
        '--sky-bottom': colors.bottom,
        '--sun-x': `${sun.x}%`,
        '--sun-y': `${sun.y}%`,
        '--sun-opacity': sun.opacity,
        '--moon-x': `${moon.x}%`,
        '--moon-y': `${moon.y}%`,
        '--moon-opacity': moon.opacity,
        '--sky-glow': colors.glow,
        '--sky-glow-soft': colors.glowSoft,
        '--night': night,
      }}
    >
      <div className="sky-wash" />
      <div className="sky-bloom" />
      <div className="celestial sun" aria-hidden="true">
        <span className="sun-halo" />
        <span className="sun-rays" />
        <span className="sun-core" />
      </div>
      <div className="celestial moon" aria-hidden="true">
        <span className="moon-halo" />
        <span className="moon-disc" />
      </div>
    </div>
  )
}
