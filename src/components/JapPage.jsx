import { useCallback, useEffect, useRef, useState } from 'react'

const MALA = 108
const SAVE_WAIT_MS = 800

const seed = (n) => {
  const value = Math.sin(n * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

const PETALS = Array.from({ length: 8 }, (_, index) => ({
  left: `${6 + seed(index + 71) * 88}%`,
  delay: seed(index + 61) * 10,
  duration: 14 + seed(index + 67) * 10,
  drift: `${-28 + seed(index + 73) * 56}px`,
  size: 9 + seed(index + 79) * 8,
}))

const BEADS = Array.from({ length: MALA }, (_, index) => {
  const angle = (index / MALA) * Math.PI * 2 - Math.PI / 2
  return {
    index,
    cx: 50 + Math.cos(angle) * 43.5,
    cy: 50 + Math.sin(angle) * 43.5,
  }
})

const malaProgress = (count) => {
  const leftover = count % MALA
  return leftover === 0 && count > 0 ? MALA : leftover
}

function MalaRing({ count, className }) {
  const filled = malaProgress(count)

  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      {BEADS.map((bead) => {
        const isFilled = bead.index < filled
        const isCurrent = bead.index === filled - 1
        const isGuru = bead.index === 0
        return (
          <circle
            key={bead.index}
            className={
              isFilled
                ? isCurrent
                  ? 'jap-bead is-current'
                  : 'jap-bead is-filled'
                : isGuru
                  ? 'jap-bead is-guru'
                  : 'jap-bead'
            }
            cx={bead.cx}
            cy={bead.cy}
            r={isGuru ? 1.45 : isCurrent ? 1.18 : isFilled ? 0.92 : 0.7}
          />
        )
      })}
    </svg>
  )
}

export default function JapPage({
  todayCount = 0,
  onCommit,
  onLeave,
  leaveLabel = 'Back',
}) {
  const startRef = useRef(todayCount)
  const tapsRef = useRef(0)
  const [baseCount, setBaseCount] = useState(todayCount)
  const [taps, setTaps] = useState(0)
  const [fx, setFx] = useState([])
  const [pulse, setPulse] = useState(0)
  const [malaFlash, setMalaFlash] = useState(false)
  const [saveState, setSaveState] = useState('idle')
  const [error, setError] = useState('')

  const liveCount = baseCount + taps
  const leftover = liveCount % MALA
  const malas = Math.floor(liveCount / MALA)
  const beadFill = malaProgress(liveCount)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    if (tapsRef.current > 0) return
    startRef.current = todayCount
    setBaseCount(todayCount)
  }, [todayCount])

  const commit = useCallback(
    async (count) => {
      if (!onCommit) return false
      setSaveState('saving')
      const ok = await onCommit(count)
      setSaveState(ok ? 'saved' : 'error')
      if (!ok) setError('Could not offer this sitting. Try again in a moment.')
      else setError('')
      return ok
    },
    [onCommit],
  )

  useEffect(() => {
    if (taps === 0) return undefined
    const timer = window.setTimeout(() => {
      commit(startRef.current + taps)
    }, SAVE_WAIT_MS)
    return () => window.clearTimeout(timer)
  }, [taps, commit])

  const offerOne = useCallback((clientX, clientY) => {
    const nextTaps = tapsRef.current + 1
    tapsRef.current = nextTaps
    const nextCount = startRef.current + nextTaps
    setTaps(nextTaps)
    setPulse((value) => value + 1)
    setSaveState('idle')

    let burstX = clientX
    let burstY = clientY
    if (burstX == null || burstY == null) {
      const orb = document.querySelector('.jap-orb')
      if (orb) {
        const box = orb.getBoundingClientRect()
        burstX = box.left + box.width / 2
        burstY = box.top + box.height / 2
      }
    }
    if (burstX != null && burstY != null) {
      const id = `${Date.now()}-${nextTaps}`
      setFx((prev) => [...prev.slice(-7), { id, x: burstX, y: burstY }])
      window.setTimeout(() => {
        setFx((prev) => prev.filter((item) => item.id !== id))
      }, 1100)
    }

    if (nextCount % MALA === 0) {
      setMalaFlash(true)
      window.setTimeout(() => setMalaFlash(false), 1600)
      if (navigator.vibrate) navigator.vibrate([14, 28, 18, 28, 22])
    } else if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }, [])

  const undoOne = () => {
    if (tapsRef.current === 0) return
    tapsRef.current -= 1
    setTaps(tapsRef.current)
    setSaveState('idle')
  }

  const leave = useCallback(() => {
    const count = startRef.current + tapsRef.current
    if (tapsRef.current > 0) commit(count)
    onLeave()
  }, [commit, onLeave])

  useEffect(() => {
    const onKey = (event) => {
      if (event.code === 'Escape') {
        event.preventDefault()
        leave()
        return
      }
      if (event.repeat) return
      if (event.code !== 'Space' && event.code !== 'Enter') return
      if (event.target.closest('button, input, textarea')) return
      event.preventDefault()
      offerOne()
    }

    const flush = () => {
      if (tapsRef.current > 0) commit(startRef.current + tapsRef.current)
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', flush)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', flush)
    }
  }, [leave, offerOne, commit])

  const handleSurface = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (event.target.closest('button')) return
    event.preventDefault()
    offerOne(event.clientX, event.clientY)
  }

  return (
    <div
      className="jap-page"
      onPointerDown={handleSurface}
    >
      <div className="jap-sky" aria-hidden="true">
        {PETALS.map((petal, index) => (
          <span
            key={`petal-${index}`}
            className="jap-petal"
            style={{
              left: petal.left,
              width: petal.size,
              height: petal.size * 1.45,
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.duration}s`,
              '--drift': petal.drift,
            }}
          />
        ))}
      </div>

      <div className="jap-chrome">
        <button className="icon-btn" type="button" onClick={leave}>
          {leaveLabel}
        </button>
        <p className="jap-save" aria-live="polite">
          {error
            ? error
            : saveState === 'saving'
              ? 'Offering...'
              : saveState === 'saved'
                ? 'Offered'
                : taps > 0
                  ? 'Keeping…'
                  : 'Sit with the Name'}
        </p>
        <div className="jap-chrome-actions">
          <button
            className="icon-btn"
            type="button"
            onClick={undoOne}
            disabled={taps === 0}
          >
            Undo
          </button>
        </div>
      </div>

      <div className="jap-stage">
        <p className={`jap-celebrate${malaFlash ? ' is-on' : ''}`} aria-live="polite">
          <strong>108</strong>
          Mala offered
        </p>
        <div className="jap-orb">
          <div className="jap-aura" />
          <MalaRing count={liveCount} className="jap-mala" />
          <p key={pulse} className="jap-name jap-name-pulse" lang="sa">
            राधा
          </p>
        </div>
      </div>

      <div className="jap-dock">
        <div
          className="jap-progress"
          aria-hidden="true"
        >
          <span style={{ width: `${(beadFill / MALA) * 100}%` }} />
        </div>
        <div className="jap-meter">
          <div>
            <span className="jap-meter-label">This sitting</span>
            <strong>{taps.toLocaleString()}</strong>
          </div>
          <div>
            <span className="jap-meter-label">Today</span>
            <strong>{liveCount.toLocaleString()}</strong>
          </div>
          <div>
            <span className="jap-meter-label">Mala</span>
            <strong>
              {malas}
              <span className="jap-meter-rest"> · {leftover}/108</span>
            </strong>
          </div>
        </div>
        <p className="jap-hint">
          <span className="jap-hint-phone">Tap to offer the Name</span>
          <span className="jap-hint-desk">Click or press space to offer the Name</span>
        </p>
      </div>

      {fx.map((item) => (
        <span
          key={item.id}
          className="jap-burst"
          style={{ left: item.x, top: item.y }}
        >
          <span className="jap-float" lang="sa">
            राधा
          </span>
        </span>
      ))}

      {malaFlash
        ? Array.from({ length: 14 }, (_, index) => (
            <span
              key={`burst-${index}`}
              className="jap-burst-petal"
              style={{ '--a': `${index * 26}deg` }}
            />
          ))
        : null}
    </div>
  )
}
