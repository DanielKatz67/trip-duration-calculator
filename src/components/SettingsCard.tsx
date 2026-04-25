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

  function set(key: keyof ScoringThresholds, value: string | number) {
    onThresholdsChange({ ...thresholds, [key]: value })
  }

  function setScore(key: keyof ScoringThresholds, raw: string) {
    const val = parseFloat(raw)
    if (isNaN(val)) return
    set(key, Math.min(1, Math.max(0, val)))
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
        {showAdvanced ? '▴' : '▾'} Advanced Settings
      </button>

      {showAdvanced && (
        <div className="advanced-panel">

          {/* Arrival day score */}
          <div className="advanced-section-label">🛬 Arrival day score</div>
          <p className="advanced-hint">How useful is the arrival day based on what time you land?</p>
          <table className="threshold-table">
            <thead>
              <tr><th>Land before</th><th>Land before</th><th>After that</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="time" className="field-input" value={thresholds.arrivalEarly} onChange={e => set('arrivalEarly', e.target.value)} /></td>
                <td><input type="time" className="field-input" value={thresholds.arrivalMid} onChange={e => set('arrivalMid', e.target.value)} /></td>
                <td className="col-fixed">—</td>
              </tr>
              <tr>
                <td><input type="number" className="field-input" step="0.25" min="0" max="1" value={thresholds.arrivalEarlyScore} onChange={e => setScore('arrivalEarlyScore', e.target.value)} /></td>
                <td><input type="number" className="field-input" step="0.25" min="0" max="1" value={thresholds.arrivalMidScore} onChange={e => setScore('arrivalMidScore', e.target.value)} /></td>
                <td><input type="number" className="field-input" step="0.25" min="0" max="1" value={thresholds.arrivalLateScore} onChange={e => setScore('arrivalLateScore', e.target.value)} /></td>
              </tr>
            </tbody>
          </table>

          {/* Departure day score */}
          <div className="advanced-section-label" style={{ marginTop: 14 }}>✈️ Departure day score</div>
          <p className="advanced-hint">How useful is the departure day based on what time your flight leaves?</p>
          <table className="threshold-table">
            <thead>
              <tr><th>Leave before</th><th>Leave before</th><th>After that</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><input type="time" className="field-input" value={thresholds.departureEarly} onChange={e => set('departureEarly', e.target.value)} /></td>
                <td><input type="time" className="field-input" value={thresholds.departureLate} onChange={e => set('departureLate', e.target.value)} /></td>
                <td className="col-fixed">—</td>
              </tr>
              <tr>
                <td><input type="number" className="field-input" step="0.25" min="0" max="1" value={thresholds.departureEarlyScore} onChange={e => setScore('departureEarlyScore', e.target.value)} /></td>
                <td><input type="number" className="field-input" step="0.25" min="0" max="1" value={thresholds.departureMidScore} onChange={e => setScore('departureMidScore', e.target.value)} /></td>
                <td><input type="number" className="field-input" step="0.25" min="0" max="1" value={thresholds.departureLateScore} onChange={e => setScore('departureLateScore', e.target.value)} /></td>
              </tr>
            </tbody>
          </table>

          {/* Vacation day logic */}
          <div className="advanced-section-label" style={{ marginTop: 14 }}>🏝️ Vacation day counting</div>
          <p className="advanced-hint">When do travel days count as vacation days taken from work?</p>
          <div className="vacation-cutoff-rows">
            <div className="vcutoff-row">
              <span className="vcutoff-label">Arrival day counts as vacation if outbound departs before</span>
              <input type="time" className="field-input vcutoff-input" value={thresholds.arrivalVacationCutoff} onChange={e => set('arrivalVacationCutoff', e.target.value)} />
            </div>
            <div className="vcutoff-row">
              <span className="vcutoff-label">Departure day counts as vacation if return arrives after</span>
              <input type="time" className="field-input vcutoff-input" value={thresholds.departureVacationCutoff} onChange={e => set('departureVacationCutoff', e.target.value)} />
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
