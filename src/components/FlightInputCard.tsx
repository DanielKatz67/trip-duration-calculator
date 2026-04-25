import type { FlightInputs } from '../types'

interface Props {
  inputs: FlightInputs
  onChange: (inputs: FlightInputs) => void
}

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

      {/* Outbound */}
      <div className="flight-group">
        <div className="flight-group-label">🌍 Outbound</div>
        <div className="flight-pair">
          <div className="flight-leg">
            <div className="leg-label">🛫 Departure</div>
            <input type="date" className="field-input" value={inputs.outboundDepartureDate} onChange={e => set('outboundDepartureDate', e.target.value)} />
            <input type="time" className="field-input" value={inputs.outboundDepartureTime} onChange={e => set('outboundDepartureTime', e.target.value)} />
          </div>
          <div className="flight-leg scoring">
            <div className="leg-label">🛬 Arrival <span className="affects-badge">⏱ affects result</span></div>
            <input type="date" className="field-input" value={inputs.outboundArrivalDate} onChange={e => set('outboundArrivalDate', e.target.value)} />
            <input type="time" className="field-input" value={inputs.outboundArrivalTime} onChange={e => set('outboundArrivalTime', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Return */}
      <div className="flight-group">
        <div className="flight-group-label">🏠 Return</div>
        <div className="flight-pair">
          <div className="flight-leg scoring">
            <div className="leg-label">🛫 Departure <span className="affects-badge">⏱ affects result</span></div>
            <input type="date" className="field-input" value={inputs.returnDepartureDate} onChange={e => set('returnDepartureDate', e.target.value)} />
            <input type="time" className="field-input" value={inputs.returnDepartureTime} onChange={e => set('returnDepartureTime', e.target.value)} />
          </div>
          <div className="flight-leg">
            <div className="leg-label">🛬 Arrival</div>
            <input type="date" className="field-input" value={inputs.returnArrivalDate} onChange={e => set('returnArrivalDate', e.target.value)} />
            <input type="time" className="field-input" value={inputs.returnArrivalTime} onChange={e => set('returnArrivalTime', e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}
