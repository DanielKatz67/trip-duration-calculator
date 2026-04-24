import type { TripDay, WeekStructure } from '../types'
import { isWeekend } from './calcWeekdayCounts'

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function dateOnly(str: string): Date {
  // Parse as local date to avoid UTC offset shifting the day
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function buildTripDays(
  arrivalDateStr: string,
  departureDateStr: string,
  arrivalScore: number,
  departureScore: number,
  weekStructure: WeekStructure
): TripDay[] {
  const arrival = dateOnly(arrivalDateStr)
  const departure = dateOnly(departureDateStr)
  const days: TripDay[] = []

  if (arrival.getTime() === departure.getTime()) {
    // Same-day trip: single entry, take max of arrival and departure scores
    days.push({
      date: arrival,
      type: 'arrival',
      isWeekend: isWeekend(arrival, weekStructure),
      usableValue: Math.max(arrivalScore, departureScore),
    })
    return days
  }

  // Arrival day
  days.push({
    date: arrival,
    type: 'arrival',
    isWeekend: isWeekend(arrival, weekStructure),
    usableValue: arrivalScore,
  })

  // Full days
  let current = addDays(arrival, 1)
  while (current.getTime() < departure.getTime()) {
    days.push({
      date: new Date(current),
      type: 'full',
      isWeekend: isWeekend(current, weekStructure),
      usableValue: 1,
    })
    current = addDays(current, 1)
  }

  // Departure day
  days.push({
    date: departure,
    type: 'departure',
    isWeekend: isWeekend(departure, weekStructure),
    usableValue: departureScore,
  })

  return days
}
