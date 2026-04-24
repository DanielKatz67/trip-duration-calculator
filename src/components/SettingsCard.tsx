import { useState } from 'react'
import type { ScoringThresholds, WeekStructure } from '../types'

interface Props {
  weekStructure: WeekStructure
  onWeekStructureChange: (w: WeekStructure) => void
  thresholds: ScoringThresholds
  onThresholdsChange: (t: ScoringThresholds) => void
}

export default function SettingsCard({ weekStructure, onWeekStructureChange, thresholds, onThresholdsChange }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  function setThreshold(key: keyof ScoringThresholds, value: string | number) {
    onThresholdsChange({ ...thresholds, [key]: value })
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">⚙️</span>
        <span className="card-title">Settings</span>
      </div>

      <div className="week-toggle">
        <button
          className={`toggle-btn${weekStructure === 'israel' ? ' active' : ''}`}
          onClick={() => onWeekStructureChange('israel')}
        >
          🇮🇱 Israel <span className="toggle-sub">Fri–Sat weekend</span>
        </button>
        <button
          className={`toggle-btn${weekStructure === 'international' ? ' active' : ''}`}
          onClick={() => onWeekStructureChange('international')}
        >
          🌍 International <span className="toggle-sub">Sat–Sun weekend</span>
        </button>
      </div>

      <button className="advanced-toggle" onClick={() => setShowAdvanced(s => !s)}>
        {showAdvanced ? '▴' : '▾'} Advanced scoring thresholds
      </button>

      {showAdvanced && (
        <div className="advanced-panel">
          <div className="advanced-section-label">Arrival day score</div>
          <div className="threshold-row">
            <span>Before</span>
            <input type="time" className="field-input threshold-input" value={thresholds.arrivalEarly} onChange={e => setThreshold('arrivalEarly', e.target.value)} />
            <span>→</span>
            <input type="number" className="field-input threshold-input" step="0.25" min="0" max="1" value={thresholds.arrivalEarlyScore} onChange={e => setThreshold('arrivalEarlyScore', parseFloat(e.target.value))} />
          </div>
          <div className="threshold-row">
            <span>Before</span>
            <input type="time" className="field-input threshold-input" value={thresholds.arrivalMid} onChange={e => setThreshold('arrivalMid', e.target.value)} />
            <span>→</span>
            <input type="number" className="field-input threshold-input" step="0.25" min="0" max="1" value={thresholds.arrivalMidScore} onChange={e => setThreshold('arrivalMidScore', parseFloat(e.target.value))} />
          </div>
          <div className="threshold-row">
            <span>After →</span>
            <input type="number" className="field-input threshold-input" step="0.25" min="0" max="1" value={thresholds.arrivalLateScore} onChange={e => setThreshold('arrivalLateScore', parseFloat(e.target.value))} />
          </div>

          <div className="advanced-section-label" style={{ marginTop: 12 }}>Departure day score</div>
          <div className="threshold-row">
            <span>Before</span>
            <input type="time" className="field-input threshold-input" value={thresholds.departureEarly} onChange={e => setThreshold('departureEarly', e.target.value)} />
            <span>→</span>
            <input type="number" className="field-input threshold-input" step="0.25" min="0" max="1" value={thresholds.departureEarlyScore} onChange={e => setThreshold('departureEarlyScore', parseFloat(e.target.value))} />
          </div>
          <div className="threshold-row">
            <span>Before</span>
            <input type="time" className="field-input threshold-input" value={thresholds.departureLate} onChange={e => setThreshold('departureLate', e.target.value)} />
            <span>→</span>
            <input type="number" className="field-input threshold-input" step="0.25" min="0" max="1" value={thresholds.departureMidScore} onChange={e => setThreshold('departureMidScore', parseFloat(e.target.value))} />
          </div>
          <div className="threshold-row">
            <span>After →</span>
            <input type="number" className="field-input threshold-input" step="0.25" min="0" max="1" value={thresholds.departureLateScore} onChange={e => setThreshold('departureLateScore', parseFloat(e.target.value))} />
          </div>
        </div>
      )}
    </div>
  )
}
