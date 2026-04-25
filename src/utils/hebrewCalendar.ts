import { HDate, HebrewCalendar } from '@hebcal/core'
import type { HolidayTier } from '../types'

// All apostrophes from @hebcal/core are U+2019 (right single quote), not U+0027 (straight apostrophe)

const FULL_DAY_OFF_EXACT = new Set([
  'Rosh Hashana II',
  'Yom Kippur',
  'Sukkot I',
  'Shmini Atzeret',           // In Israel = Simchat Torah
  'Yom HaAtzma\u2019ut',     // Independence Day
  'Pesach I',
  'Pesach VII',
  'Pesach Sheni',             // 2nd Passover (full day off)
  'Shavuot',
])

const HALF_DAY_EXACT = new Set([
  'Erev Rosh Hashana',
  'Erev Yom Kippur',
  'Erev Sukkot',
  'Sukkot VII (Hoshana Raba)', // Erev Shmini Atzeret / Erev Simchat Torah
  'Erev Pesach',
  'Erev Shavuot',
  'Yom HaZikaron',
])

// Matched by substring (U+2019 apostrophes where needed)
const WORKDAY_PATTERNS = [
  'CH\u2019\u2019M',         // Chol HaMoed: "Sukkot II (CH''M)", "Pesach II (CH''M)" etc.
  'Chanukah',
  'Purim',
  'Ta\u2019anit Esther',    // Fast of Esther
  'Yom HaShoah',            // Holocaust Memorial Day
  'Lag BaOmer',
]

// Names that look like holidays but should NOT get a tier
const BLOCKLIST = new Set([
  'Rosh Hashana LaBehemot',  // "New Year for Animals" — not a public holiday
])

function getHolidayTier(eventName: string): HolidayTier | null {
  if (BLOCKLIST.has(eventName)) return null
  // Rosh Hashana year-suffixed: "Rosh Hashana 5787" — exclude "Rosh Hashana II" and "Rosh Hashana LaBehemot"
  if (eventName.startsWith('Rosh Hashana') && !eventName.includes('II') && !eventName.includes('La')) return 'full-day-off'
  if (FULL_DAY_OFF_EXACT.has(eventName)) return 'full-day-off'
  if (HALF_DAY_EXACT.has(eventName)) return 'half-day'
  if (WORKDAY_PATTERNS.some(p => eventName.includes(p))) return 'workday'
  return null
}

export interface HebrewDayData {
  hebrewDate: string
  holidayName: string | null
  holidayTier: HolidayTier | null
}

export function getHebrewCalendarData(date: Date): HebrewDayData {
  const hdate = new HDate(date)
  const hebrewDate = hdate.render('he')

  const ilEvents = HebrewCalendar.getHolidaysOnDate(hdate, true) ?? []

  for (const ev of ilEvents) {
    const name = ev.render('en')
    const tier = getHolidayTier(name)
    if (tier) return { hebrewDate, holidayName: name, holidayTier: tier }
  }

  // Return first event name even if no tier match (informational)
  if (ilEvents.length > 0) {
    return { hebrewDate, holidayName: ilEvents[0].render('en'), holidayTier: null }
  }

  return { hebrewDate, holidayName: null, holidayTier: null }
}
