import { HDate, HebrewCalendar } from '@hebcal/core'
import type { HolidayTier } from '../types'

// Exact names as rendered by @hebcal/core with il=true
// Rosh Hashana is year-suffixed (e.g. "Rosh Hashana 5786"), matched via startsWith below
const FULL_DAY_OFF_EXACT = new Set([
  'Rosh Hashana II',
  'Yom Kippur',
  'Sukkot I',
  'Shmini Atzeret',
  'Yom HaAtzma\u2019ut',  // Independence Day (uses right single quote U+2019)
  'Pesach I',
  'Pesach VII',
  'Shavuot',
])

const HALF_DAY_EXACT = new Set([
  'Erev Rosh Hashana',
  'Erev Yom Kippur',
  'Erev Sukkot',
  'Erev Shmini Atzeret',
  'Erev Pesach',
  'Erev Shavuot',
  'Yom HaZikaron',
])

// Matched by substring
const WORKDAY_PATTERNS = [
  "CH''M",         // Chol HaMoed Sukkot/Pesach: "Sukkot II (CH''M)", "Pesach II (CH''M)", etc.
  'Chanukah',
  'Purim',
  'Ta\u2019anit Esther', // Fast of Esther (uses right single quote U+2019)
  'Yom HaShoah',   // Holocaust Memorial Day
  'Lag BaOmer',
]

function getHolidayTier(eventName: string): HolidayTier | null {
  if (eventName.startsWith('Rosh Hashana') && !eventName.includes('II')) return 'full-day-off'
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
