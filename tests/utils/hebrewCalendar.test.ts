import { describe, it, expect } from 'vitest'
import { getHebrewCalendarData } from '../../src/utils/hebrewCalendar'

describe('getHebrewCalendarData', () => {
  it('returns a Hebrew date string for any gregorian date', () => {
    const data = getHebrewCalendarData(new Date(2026, 3, 28)) // Apr 28 2026 (local)
    expect(data.hebrewDate).toBeTruthy()
    expect(typeof data.hebrewDate).toBe('string')
  })

  it('returns null holidayName for a regular day', () => {
    // Apr 28 2026 is י׳ אייר, no major holiday
    const data = getHebrewCalendarData(new Date(2026, 3, 28))
    expect(data.holidayName).toBeNull()
    expect(data.holidayTier).toBeNull()
  })

  it('returns no holiday tier for Saturday (Shabbat not tracked)', () => {
    // May 2 2026 = Saturday — no Shabbat tier in our system
    const data = getHebrewCalendarData(new Date(2026, 4, 2))
    expect(data.holidayName).toBeNull()
    expect(data.holidayTier).toBeNull()
  })

  it('returns full-day-off tier for Independence Day (Yom HaAtzma\'ut)', () => {
    // Yom HaAtzma'ut 5786 = April 22 2026
    const data = getHebrewCalendarData(new Date(2026, 3, 22))
    expect(data.holidayTier).toBe('full-day-off')
    expect(data.holidayName).toContain('HaAtzma\u2019ut')
  })

  it('returns workday tier for Lag BaOmer', () => {
    // Lag BaOmer 5786 = May 5 2026 — tier should be 'workday'
    const data = getHebrewCalendarData(new Date(2026, 4, 5))
    expect(data.holidayTier).toBe('workday')
  })
})

