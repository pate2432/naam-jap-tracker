const STARS = Array.from({ length: 36 }, (_, index) => ({
  id: `star-${index}`,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 23) % 72}%`,
  delay: `${(index % 9) * 0.35}s`,
  size: `${1.2 + (index % 4) * 0.55}px`,
}))

const PETALS = Array.from({ length: 10 }, (_, index) => ({
  id: `petal-${index}`,
  left: `${6 + ((index * 11) % 88)}%`,
  delay: `${index * 1.4}s`,
  duration: `${16 + (index % 5) * 2.5}s`,
  drift: `${index % 2 === 0 ? 28 : -22}px`,
}))

const FIREFLIES = Array.from({ length: 7 }, (_, index) => ({
  id: `fly-${index}`,
  left: `${10 + ((index * 13) % 80)}%`,
  top: `${20 + ((index * 17) % 60)}%`,
  delay: `${index * 0.8}s`,
}))

export default function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-wash" />
      <div className="ambient-yamuna" />
      <div className="ambient-mandala" />
      <div className="ambient-stars">
        {STARS.map((star) => (
          <span
            key={star.id}
            className="ambient-star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>
      {FIREFLIES.map((fly) => (
        <span
          key={fly.id}
          className="ambient-firefly"
          style={{
            left: fly.left,
            top: fly.top,
            animationDelay: fly.delay,
          }}
        />
      ))}
      {PETALS.map((petal) => (
        <span
          key={petal.id}
          className="ambient-petal"
          style={{
            left: petal.left,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
            '--drift': petal.drift,
          }}
        />
      ))}
    </div>
  )
}
