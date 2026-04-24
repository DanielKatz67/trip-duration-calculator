import { describe, it, expect } from 'vitest'
import { calcVacationDays } from '../../src/utils/calcVacationDays'
import type { TripDay } from '../../src/types'

function makeDay(date: string, type: TripDay['type'], isWeekend: boolean, holidayTier?: TripDay['holidayTier'], holidayName?: string): TripDay {
  return {
    date: new Date(date),
    type,
    isWeekend,
    usableValue: type === 'full' ? 1 : 0.75,
    holidayTier,
    holidayName,
  }
}

describe('calcVacationDays', () => {
  it('returns weekday full days count when no holidays', () => {
    const days: TripDay[] = [
      makeDay('2026-04-28', 'arrival', false),
      makeDay('2026-04-29', 'full', false),   // weekday, no holiday
      makeDay('2026-04-30', 'full', false),   // weekday, no holiday
      makeDay('2026-05-01', 'full', false),   // weekday, no holiday
      makeDay('2026-05-02', 'full', true),    // weekend
      makeDay('2026-05-03', 'full', true),    // weekend
      makeDay('2026-05-04', 'departure', false),
    ]
    const result = calcVacationDays(days)
    expect(result.vacationDaysNeeded).toBe(3)  // 3 weekday full days
    expect(result.halfVacationDaysNeeded).toBe(0)
    expect(result.fullHolidaysOnWeekdays).toEqual([])
    expect(result.halfHolidaysOnWeekdays).toEqual([])
  })

  it('deducts full-day-off holidays on weekdays', () => {
    const days: TripDay[] = [
      makeDay('2026-04-28', 'arrival', false),
      makeDay('2026-04-29', 'full', false, 'full-day-off', 'Independence Day'),
      makeDay('2026-04-30', 'full', false),
      makeDay('2026-05-04', 'departure', false),
    ]
    const result = calcVacationDays(days)
    expect(result.vacationDaysNeeded).toBe(1)  // 2 weekday full days − 1 full holiday
    expect(result.fullHolidaysOnWeekdays).toEqual(['Independence Day'])
  })

  it('does not deduct full-day-off holidays on weekends', () => {
    const days: TripDay[] = [
      makeDay('2026-04-28', 'arrival', false),
      makeDay('2026-04-29', 'full', false),
      makeDay('2026-05-02', 'full', true, 'full-day-off', 'Shabbat'),  // weekend
      makeDay('2026-05-04', 'departure', false),
    ]
    const result = calcVacationDays(days)
    expect(result.vacationDaysNeeded).toBe(1)  // only 1 weekday full day
    expect(result.fullHolidaysOnWeekdays).toEqual([])
  })

  it('counts half-day holidays on weekdays', () => {
    const days: TripDay[] = [
      makeDay('2026-04-28', 'arrival', false),
      makeDay('2026-04-29', 'full', false, 'half-day', 'Erev Shavuot'),
      makeDay('2026-04-30', 'full', false),
      makeDay('2026-05-04', 'departure', false),
    ]
    const result = calcVacationDays(days)
    expect(result.vacationDaysNeeded).toBe(2)  // half-day does NOT deduct full vacation day
    expect(result.halfVacationDaysNeeded).toBe(1)
    expect(result.halfHolidaysOnWeekdays).toEqual(['Erev Shavuot'])
  })

  it('excludes arrival and departure days from calculation', () => {
    const days: TripDay[] = [
      makeDay('2026-04-28', 'arrival', false, 'full-day-off', 'Pesach I'),
      makeDay('2026-04-29', 'full', false),
      makeDay('2026-05-04', 'departure', false, 'half-day', 'Erev Shavuot'),
    ]
    const result = calcVacationDays(days)
    expect(result.vacationDaysNeeded).toBe(1)  // only 1 full weekday, arrival/departure excluded
    expect(result.halfVacationDaysNeeded).toBe(0)  // departure excluded
  })

  it('never returns negative vacation days', () => {
    const days: TripDay[] = [
      makeDay('2026-04-28', 'arrival', false),
      makeDay('2026-04-29', 'full', false, 'full-day-off', 'Independence Day'),
      makeDay('2026-04-30', 'full', false, 'full-day-off', 'Shavuot'),
      makeDay('2026-05-04', 'departure', false),
    ]
    const result = calcVacationDays(days)
    expect(result.vacationDaysNeeded).toBe(0)  // clamped at 0
  })
})
