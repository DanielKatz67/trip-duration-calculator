import { describe, it, expect } from 'vitest'
import { getHebrewCalendarData } from '../../src/utils/hebrewCalendar'

describe('getHebrewCalendarData', () => {
  it('returns a Hebrew date string for any gregorian date', () => {
    const data = getHebrewCalendarData(new Date(2026, 3, 28))
    expect(data.hebrewDate).toBeTruthy()
    expect(typeof data.hebrewDate).toBe('string')
  })

  it('returns null holidayName for a regular day', () => {
    const data = getHebrewCalendarData(new Date(2026, 3, 28))
    expect(data.holidayName).toBeNull()
    expect(data.holidayTier).toBeNull()
  })

  it('returns no holiday tier for Saturday (Shabbat not tracked)', () => {
    const data = getHebrewCalendarData(new Date(2026, 4, 2))
    expect(data.holidayTier).toBeNull()
  })

  it('hides Shabbat-named events entirely', () => {
    // Jan 31 2026 = "Shabbat Shirah"
    const data = getHebrewCalendarData(new Date(2026, 0, 31))
    expect(data.holidayTier).toBeNull()
    expect(data.holidayName).toBeNull()
  })

  it('returns full-day-off tier for Independence Day', () => {
    // Yom HaAtzma'ut 5786 = April 22 2026
    const data = getHebrewCalendarData(new Date(2026, 3, 22))
    expect(data.holidayTier).toBe('full-day-off')
    expect(data.holidayName).toContain('HaAtzma\u2019ut')
  })

  it('returns workday tier for Lag BaOmer', () => {
    // Lag BaOmer 5786 = May 5 2026
    const data = getHebrewCalendarData(new Date(2026, 4, 5))
    expect(data.holidayTier).toBe('workday')
  })

  it('returns no tier for Pesach Sheni (minor holiday, not a day off)', () => {
    // May 1 2026
    const data = getHebrewCalendarData(new Date(2026, 4, 1))
    expect(data.holidayTier).toBeNull()
    expect(data.holidayName).toBeNull()
  })

  it('returns no tier for Rosh Hashana LaBehemot (not a public holiday)', () => {
    // Aug 14 2026
    const data = getHebrewCalendarData(new Date(2026, 7, 14))
    expect(data.holidayTier).toBeNull()
  })

  it('returns workday tier for Chol HaMoed Sukkot', () => {
    // Sukkot II (CH''M) = Sep 27 2026
    const data = getHebrewCalendarData(new Date(2026, 8, 27))
    expect(data.holidayTier).toBe('workday')
  })

  it('returns half-day for Pesach VI (CH\'\'M) — 2nd Passover Eve', () => {
    // Apr 7 2026
    const data = getHebrewCalendarData(new Date(2026, 3, 7))
    expect(data.holidayTier).toBe('half-day')
  })

  it('returns half-day tier for Sukkot VII (Hoshana Raba / Erev Shmini Atzeret)', () => {
    // Oct 2 2026
    const data = getHebrewCalendarData(new Date(2026, 9, 2))
    expect(data.holidayTier).toBe('half-day')
  })

  it('returns full-day-off for Shmini Atzeret (= Simchat Torah in Israel)', () => {
    // Oct 3 2026
    const data = getHebrewCalendarData(new Date(2026, 9, 3))
    expect(data.holidayTier).toBe('full-day-off')
  })
})
