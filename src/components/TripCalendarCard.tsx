import type { FlightInputs, TripResult, ScoringThresholds, WeekStructure } from '../types'
import { buildTripDays } from '../utils/buildTripDays'
import { getHebrewCalendarData } from '../utils/hebrewCalendar'
import CalendarMonth from './CalendarMonth'

interface Props {
  inputs: FlightInputs
  result: TripResult
  weekStructure: WeekStructure
  thresholds: ScoringThresholds
}

export default function TripCalendarCard({
  inputs, result, weekStructure
}: Props) {
  const tripDays = buildTripDays(
    inputs.outboundArrivalDate,
    inputs.returnDepartureDate,
    result.arrivalScore,
    result.departureScore,
    weekStructure
  )

  // Always enrich with Hebrew data
  const enrichedDays = tripDays.map(td => {
    const hData = getHebrewCalendarData(td.date)
    return { ...td, hebrewDate: hData.hebrewDate, holidayName: hData.holidayName ?? undefined, holidayTier: hData.holidayTier ?? undefined }
  })

  // Determine unique months to render
  const months: Array<{ year: number; month: number }> = []
  for (const td of enrichedDays) {
    const y = td.date.getFullYear()
    const m = td.date.getMonth()
    if (!months.find(x => x.year === y && x.month === m)) {
      months.push({ year: y, month: m })
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">🗺️</span>
        <span className="card-title">Trip Calendar</span>
      </div>

      <div className="cal-legend">
        <span className="legend-item"><span className="legend-dot arrival-dot" /> Arrival</span>
        <span className="legend-item"><span className="legend-dot full-dot" /> Full day</span>
        <span className="legend-item"><span className="legend-dot weekend-dot" /> Weekend</span>
        <span className="legend-item"><span className="legend-dot departure-dot" /> Departure</span>
        <span className="legend-tier tier-off">Day off</span>
        <span className="legend-tier tier-half">Half day</span>
        <span className="legend-tier tier-work">Workday</span>
      </div>

      {months.map(({ year, month }) => (
        <CalendarMonth
          key={`${year}-${month}`}
          year={year}
          month={month}
          tripDays={enrichedDays}
          weekStructure={weekStructure}
        />
      ))}
    </div>
  )
}
