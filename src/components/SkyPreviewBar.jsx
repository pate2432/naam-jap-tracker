import { useEffect, useState } from 'react'
import {
  SKY_PRESETS,
  getSkyOverride,
  setSkyOverride,
  subscribeSkyOverride,
} from '../lib/skyPreview'

export default function SkyPreviewBar() {
  const [hour, setHour] = useState(() => getSkyOverride())

  useEffect(() => subscribeSkyOverride(setHour), [])

  const activeId =
    SKY_PRESETS.find((preset) =>
      preset.hour == null ? hour == null : preset.hour === hour,
    )?.id || 'live'

  return (
    <div className="sky-preview" role="group" aria-label="Sky preview">
      {SKY_PRESETS.map((preset) => (
        <button
          key={preset.id}
          type="button"
          className={preset.id === activeId ? 'active' : ''}
          onClick={() => setSkyOverride(preset.hour)}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
