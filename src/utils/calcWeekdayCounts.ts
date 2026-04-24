import type { WeekStructure } from '../types'

function isWeekend(date: Date, weekStructure: WeekStructure): boolean {
  const day = date.getDay() // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  if (weekStructure === 'israel') return day === 5 || day === 6  // Fri, Sat
  return day === 0 || day === 6  // Sun, Sat
}

export function calcWeekdayCounts(
  dates: Date[],
  weekStructure: WeekStructure
): { weekdays: number; weekendDays: number } {
  let weekdays = 0
  let weekendDays = 0
  for (const date of dates) {
    if (isWeekend(date, weekStructure)) weekendDays++
    else weekdays++
  }
  return { weekdays, weekendDays }
}

export { isWeekend }
