import type { TripDay, WeekStructure } from '../types'
import CalendarCell from './CalendarCell'

interface Props {
  year: number
  month: number  // 0-indexed
  tripDays: TripDay[]
  weekStructure: WeekStructure
}

const DOW_ISRAEL   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DOW_INTL     = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKEND_ISRAEL = new Set([5, 6])    // Fri, Sat (index in DOW_ISRAEL)
const WEEKEND_INTL   = new Set([5, 6])    // Sat, Sun (index in DOW_INTL)

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay() // 0=Sun
}

export default function CalendarMonth({ year, month, tripDays, weekStructure }: Props) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfMonth(year, month) // 0=Sun

  // Build a map of day-of-month → TripDay
  const tripDayMap = new Map<number, TripDay>()
  for (const td of tripDays) {
    if (td.date.getFullYear() === year && td.date.getMonth() === month) {
      tripDayMap.set(td.date.getDate(), td)
    }
  }

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

  // Build grid cells
  // Israel mode: week starts Sunday (dow 0). International: week starts Monday (dow 1).
  const startOffset = weekStructure === 'israel' ? firstDow : (firstDow === 0 ? 6 : firstDow - 1)
  const headers = weekStructure === 'israel' ? DOW_ISRAEL : DOW_INTL
  const weekendIndices = weekStructure === 'israel' ? WEEKEND_ISRAEL : WEEKEND_INTL

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="cal-section">
      <div className="cal-month-header">📅 {monthNames[month]} {year}</div>
      <div className="cal-grid">
        {headers.map((h, i) => (
          <div key={h} className={`cal-dow ${weekendIndices.has(i) ? 'weekend' : 'weekday'}`}>{h}</div>
        ))}
        {cells.map((dayNum, i) => (
          <CalendarCell
            key={i}
            day={dayNum ? (tripDayMap.get(dayNum) ?? null) : null}
            dayNumber={dayNum}
          />
        ))}
      </div>
    </div>
  )
}
