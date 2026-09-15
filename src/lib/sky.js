const mix = (from, to, amount) => from + (to - from) * amount

const hexToRgb = (hex) => {
  const value = hex.replace('#', '')
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ]
}

const rgbToCss = (rgb, alpha = 1) =>
  `rgba(${rgb.map((channel) => Math.round(channel)).join(', ')}, ${alpha})`

const mixRgb = (from, to, amount) =>
  from.map((channel, index) => mix(channel, to[index], amount))

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

const channelLum = (channel) => {
  const value = channel / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

const luminance = (rgb) =>
  0.2126 * channelLum(rgb[0]) +
  0.7152 * channelLum(rgb[1]) +
  0.0722 * channelLum(rgb[2])

const skyModeFromLight = (topRgb, midRgb, warmth) => {
  const light = luminance(topRgb) * 0.7 + luminance(midRgb) * 0.3
  if (light >= 0.22) return 'day'
  if (light >= 0.08 || warmth >= 0.45) return 'dusk'
  return 'night'
}

const STOPS = [
  { hour: 0, top: '#07060f', mid: '#100c1c', bottom: '#1a1430', glow: [196, 210, 255], warmth: 0.08 },
  { hour: 4.6, top: '#0c0a18', mid: '#1a1230', bottom: '#2a1838', glow: [210, 170, 220], warmth: 0.16 },
  { hour: 5.7, top: '#2a1840', mid: '#7a3a58', bottom: '#e08a62', glow: [255, 176, 120], warmth: 0.72 },
  { hour: 7.2, top: '#4a7ec8', mid: '#7eb4e6', bottom: '#f3d3a8', glow: [255, 214, 140], warmth: 0.9 },
  { hour: 10, top: '#5ea0e8', mid: '#87c4f0', bottom: '#d9ecff', glow: [255, 236, 176], warmth: 1 },
  { hour: 13, top: '#4e96e0', mid: '#7ab8ea', bottom: '#cfe6ff', glow: [255, 244, 200], warmth: 1 },
  { hour: 16.4, top: '#3d78c4', mid: '#e09a62', bottom: '#f2c48a', glow: [255, 168, 96], warmth: 0.86 },
  { hour: 18.3, top: '#2a2458', mid: '#c45a62', bottom: '#f08a58', glow: [255, 140, 110], warmth: 0.7 },
  { hour: 19.6, top: '#14102c', mid: '#3a2048', bottom: '#6a3050', glow: [200, 160, 220], warmth: 0.28 },
  { hour: 21.2, top: '#080712', mid: '#120c1e', bottom: '#1c1530', glow: [180, 196, 255], warmth: 0.1 },
  { hour: 24, top: '#07060f', mid: '#100c1c', bottom: '#1a1430', glow: [196, 210, 255], warmth: 0.08 },
]

const findSpan = (hour) => {
  for (let index = 0; index < STOPS.length - 1; index += 1) {
    if (hour >= STOPS[index].hour && hour <= STOPS[index + 1].hour) {
      return [STOPS[index], STOPS[index + 1]]
    }
  }
  return [STOPS[0], STOPS[1]]
}

export const getSolarWindow = (date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 0)
  const day = Math.floor((date - start) / 86_400_000)
  const seasonal = Math.sin(((day - 80) / 365) * Math.PI * 2)
  return {
    sunrise: 6.55 - seasonal * 1.15,
    sunset: 18.2 + seasonal * 1.35,
  }
}

const arcPoint = (progress, left, right, low, rise) => {
  const x = mix(left, right, progress)
  const y = low - Math.sin(progress * Math.PI) * rise
  return { x, y }
}

export const getSkyState = (date = new Date()) => {
  const hour =
    date.getHours() +
    date.getMinutes() / 60 +
    date.getSeconds() / 3600

  const { sunrise, sunset } = getSolarWindow(date)
  const [from, to] = findSpan(hour)
  const span = (hour - from.hour) / (to.hour - from.hour || 1)
  const ease = span * span * (3 - 2 * span)

  const top = mixRgb(hexToRgb(from.top), hexToRgb(to.top), ease)
  const mid = mixRgb(hexToRgb(from.mid), hexToRgb(to.mid), ease)
  const bottom = mixRgb(hexToRgb(from.bottom), hexToRgb(to.bottom), ease)
  const glow = mixRgb(from.glow, to.glow, ease)
  const warmth = mix(from.warmth, to.warmth, ease)

  const dayLength = Math.max(0.75, sunset - sunrise)
  const sunProgress = clamp((hour - sunrise) / dayLength)
  const sun = arcPoint(sunProgress, 7, 93, 78, 58)
  const sunVisible = hour > sunrise - 0.55 && hour < sunset + 0.45
  const sunOpacity = sunVisible
    ? clamp(1 - Math.abs(sunProgress - 0.5) * 0.12) *
      clamp((hour - (sunrise - 0.55)) / 0.55) *
      clamp((sunset + 0.45 - hour) / 0.55)
    : 0

  const nightSpan = 24 - dayLength
  const afterSunset = hour >= sunset
  const moonProgress = afterSunset
    ? clamp((hour - sunset) / nightSpan)
    : clamp((hour + 24 - sunset) / nightSpan)
  const moon = arcPoint(moonProgress, 10, 90, 76, 50)
  const night = clamp(
    hour < sunrise
      ? (sunrise - hour) / 1.4
      : hour > sunset
        ? (hour - sunset) / 1.1
        : 0,
  )
  const moonOpacity = clamp(night * 0.95 + (hour > 20 || hour < 5 ? 0.15 : 0))

  return {
    hour,
    sunrise,
    sunset,
    night,
    warmth,
    mode: skyModeFromLight(top, mid, warmth),
    sun: { ...sun, opacity: sunOpacity },
    moon: { ...moon, opacity: moonOpacity },
    colors: {
      top: rgbToCss(top),
      mid: rgbToCss(mid),
      bottom: rgbToCss(bottom),
      glow: rgbToCss(glow, 0.42 + warmth * 0.22),
      glowSoft: rgbToCss(glow, 0.18),
    },
  }
}
