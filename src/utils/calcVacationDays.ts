import type { TripDay } from '../types'

interface VacationResult {
  vacationDaysNeeded: number
  halfVacationDaysNeeded: number
  fullHolidaysOnWeekdays: string[]
  halfHolidaysOnWeekdays: string[]
}

export function calcVacationDays(tripDays: TripDay[]): VacationResult {
  const fullDaysOnly = tripDays.filter(d => d.type === 'full' && !d.isWeekend)

  const fullHolidaysOnWeekdays: string[] = []
  const halfHolidaysOnWeekdays: string[] = []

  for (const day of fullDaysOnly) {
    if (day.holidayTier === 'full-day-off' && day.holidayName) {
      fullHolidaysOnWeekdays.push(day.holidayName)
    } else if (day.holidayTier === 'half-day' && day.holidayName) {
      halfHolidaysOnWeekdays.push(day.holidayName)
    }
  }

  const weekdayFullDays = fullDaysOnly.length
  const vacationDaysNeeded = Math.max(0, weekdayFullDays - fullHolidaysOnWeekdays.length)
  const halfVacationDaysNeeded = halfHolidaysOnWeekdays.length

  return {
    vacationDaysNeeded,
    halfVacationDaysNeeded,
    fullHolidaysOnWeekdays,
    halfHolidaysOnWeekdays,
  }
}
