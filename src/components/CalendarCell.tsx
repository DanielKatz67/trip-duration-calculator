import type { TripDay } from '../types'

interface Props {
  day: TripDay | null
  dayNumber: number | null
}

const TYPE_CLASS: Record<string, string> = {
  arrival: 'arrival',
  full: 'full-day',
  departure: 'departure',
}

const TIER_LABEL: Record<string, string> = {
  'full-day-off': 'Day off',
  'half-day': 'Half day',
  'workday': 'Workday',
}

const TIER_CLASS: Record<string, string> = {
  'full-day-off': 'tier-off',
  'half-day': 'tier-half',
  'workday': 'tier-work',
}

export default function CalendarCell({ day, dayNumber }: Props) {
  if (!dayNumber) return <div className="cal-cell" />

  if (!day) {
    return <div className="cal-cell faded"><span className="cal-num">{dayNumber}</span></div>
  }

  const typeClass = day.type === 'full' && day.isWeekend ? 'weekend-day' : TYPE_CLASS[day.type]

  return (
    <div className={`cal-cell ${typeClass}`}>
      <span className="cal-num">{dayNumber}</span>
      <span className="cal-value">
        {day.type === 'arrival' ? '🛬 ' : day.type === 'departure' ? '✈️ ' : ''}
        {day.usableValue.toString()}
      </span>
      {day.hebrewDate && (
        <span className="cal-heb">{day.hebrewDate}</span>
      )}
      {day.holidayTier && (
        <span className={`cal-tier ${TIER_CLASS[day.holidayTier]}`}>
          {TIER_LABEL[day.holidayTier]}
        </span>
      )}
      {day.holidayName && (
        <span className="cal-holiday">{day.holidayName}</span>
      )}
    </div>
  )
}
