import type { TripResult } from '../types'
import { formatBreakdown } from '../utils/formatBreakdown'

interface Props {
  result: TripResult
}

const STATS = [
  { key: 'fullDays',       emoji: '☀️',  label: 'Full days'     },
  { key: 'travelDayValue', emoji: '✈️',  label: 'Travel value'  },
  { key: 'nights',         emoji: '🌙',  label: 'Nights'        },
  { key: 'calendarDays',   emoji: '📅',  label: 'Calendar days' },
  { key: 'weekdays',       emoji: '💼',  label: 'Weekdays'      },
  { key: 'weekendDays',    emoji: '🏖️', label: 'Weekend days'  },
] as const

export default function ResultCard({ result }: Props) {
  const breakdown = formatBreakdown(result.fullDays, result.travelDayValue)

  const fullFormula = result.fullHolidaysOnWeekdays.length > 0
    ? `${result.weekdays} weekdays − ${result.fullHolidaysOnWeekdays.length} full holiday (${result.fullHolidaysOnWeekdays.join(', ')})`
    : `${result.weekdays} weekdays, no public holidays`

  const halfFormula = result.halfHolidaysOnWeekdays.length > 0
    ? `${result.halfHolidaysOnWeekdays.length} Erev holiday on weekday (${result.halfHolidaysOnWeekdays.join(', ')})`
    : 'No half-day holidays on weekdays'

  return (
    <div className="result-card">
      <div className="result-headline">
        <span className="result-emoji">🗓️</span>
        <div className="result-big">{result.usableDays}</div>
        <div className="result-unit">usable days</div>
      </div>
      <div className="result-breakdown">
        {breakdown.split('+').map((part, i) => (
          <span key={i}>{i > 0 && <span> + </span>}<strong>{part.trim()}</strong></span>
        ))}
      </div>
      <div className="stats-grid">
        {STATS.map(s => (
          <div key={s.key} className="stat">
            <div className="stat-emoji">{s.emoji}</div>
            <div className="stat-value">{result[s.key]}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="vacation-section">
        <div className="vacation-title">🗂️ Work vacation required</div>
        <div className="vacation-rows">
          <div className="vrow full">
            <div className="vrow-left">
              <div className="vrow-label">🏝️ Vacation days needed</div>
              <div className="vrow-formula">{fullFormula}</div>
            </div>
            <div className="vrow-value">{result.vacationDaysNeeded}</div>
          </div>
          <div className="vrow half">
            <div className="vrow-left">
              <div className="vrow-label">🌅 Half-day vacations needed</div>
              <div className="vrow-formula">{halfFormula}</div>
            </div>
            <div className="vrow-value">{result.halfVacationDaysNeeded}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
