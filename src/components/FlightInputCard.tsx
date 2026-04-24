import type { FlightInputs } from '../types'

interface Props {
  inputs: FlightInputs
  onChange: (inputs: FlightInputs) => void
}

interface LegConfig {
  label: string
  emoji: string
  dateKey: keyof FlightInputs
  timeKey: keyof FlightInputs
  affectsResult: boolean
}

const LEGS: LegConfig[] = [
  { label: 'Outbound Departure', emoji: '🛫', dateKey: 'outboundDepartureDate', timeKey: 'outboundDepartureTime', affectsResult: false },
  { label: 'Outbound Arrival',   emoji: '🛬', dateKey: 'outboundArrivalDate',   timeKey: 'outboundArrivalTime',   affectsResult: true  },
  { label: 'Return Departure',   emoji: '🛫', dateKey: 'returnDepartureDate',   timeKey: 'returnDepartureTime',   affectsResult: true  },
  { label: 'Return Arrival',     emoji: '🛬', dateKey: 'returnArrivalDate',     timeKey: 'returnArrivalTime',     affectsResult: false },
]

export default function FlightInputCard({ inputs, onChange }: Props) {
  function set(key: keyof FlightInputs, value: string) {
    onChange({ ...inputs, [key]: value })
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">🛫</span>
        <span className="card-title">Flight Details</span>
      </div>
      <div className="flight-grid">
        {LEGS.map(leg => (
          <div key={leg.label} className={`flight-leg${leg.affectsResult ? ' scoring' : ''}`}>
            <div className="leg-label">
              {leg.emoji} {leg.label}
              {leg.affectsResult && <span className="affects-badge">⏱ affects result</span>}
            </div>
            <input
              type="date"
              className="field-input"
              value={inputs[leg.dateKey]}
              onChange={e => set(leg.dateKey, e.target.value)}
            />
            <input
              type="time"
              className="field-input"
              value={inputs[leg.timeKey]}
              onChange={e => set(leg.timeKey, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
