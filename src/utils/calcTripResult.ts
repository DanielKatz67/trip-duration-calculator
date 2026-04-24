import type { FlightInputs, ScoringThresholds, TripResult, WeekStructure } from '../types'
import { calcNights } from './calcNights'
import { calcFullDays } from './calcFullDays'
import { calcArrivalScore } from './calcArrivalScore'
import { calcDepartureScore } from './calcDepartureScore'
import { calcWeekdayCounts } from './calcWeekdayCounts'
import { buildTripDays } from './buildTripDays'
import { getHebrewCalendarData } from './hebrewCalendar'
import { calcVacationDays } from './calcVacationDays'

export function calcTripResult(
  inputs: FlightInputs,
  thresholds: ScoringThresholds,
  weekStructure: WeekStructure
): TripResult {
  const arrivalScore = calcArrivalScore(inputs.outboundArrivalTime, thresholds)
  const departureScore = calcDepartureScore(inputs.returnDepartureTime, thresholds)
  const nights = calcNights(inputs.outboundArrivalDate, inputs.returnDepartureDate)
  const fullDays = calcFullDays(inputs.outboundArrivalDate, inputs.returnDepartureDate)

  const isSameDay = inputs.outboundArrivalDate === inputs.returnDepartureDate
  const travelDayValue = isSameDay
    ? Math.max(arrivalScore, departureScore)
    : arrivalScore + departureScore
  const usableDays = isSameDay ? travelDayValue : fullDays + travelDayValue

  const tripDays = buildTripDays(
    inputs.outboundArrivalDate,
    inputs.returnDepartureDate,
    arrivalScore,
    departureScore,
    weekStructure
  )

  // Always enrich with Hebrew calendar data
  const enrichedDays = tripDays.map(td => {
    const hData = getHebrewCalendarData(td.date)
    return {
      ...td,
      hebrewDate: hData.hebrewDate,
      holidayName: hData.holidayName ?? undefined,
      holidayTier: hData.holidayTier ?? undefined,
    }
  })

  const calendarDays = enrichedDays.length
  const allDates = enrichedDays.map(d => d.date)
  const { weekdays, weekendDays } = calcWeekdayCounts(allDates, weekStructure)
  const vacation = calcVacationDays(enrichedDays)

  return {
    usableDays: Math.round(usableDays * 100) / 100,
    fullDays,
    travelDayValue: Math.round(travelDayValue * 100) / 100,
    nights,
    calendarDays,
    weekdays,
    weekendDays,
    arrivalScore,
    departureScore,
    ...vacation,
  }
}
