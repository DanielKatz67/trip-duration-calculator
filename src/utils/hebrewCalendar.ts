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
  'Shavuot',
])

const HALF_DAY_EXACT = new Set([
  'Erev Rosh Hashana',
  'Erev Yom Kippur',
  'Erev Sukkot',
  'Sukkot VII (Hoshana Raba)', // Erev Shmini Atzeret / Erev Simchat Torah
  'Erev Pesach',
  'Pesach VI (CH\u2019\u2019M)', // Last Chol HaMoed day = Erev Pesach VII (2nd Passover Eve)
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

// Event name prefixes/exact names that should never show a tier or display name
const BLOCKLIST_PREFIXES = ['Shabbat ']
const BLOCKLIST_EXACT = new Set([
  'Rosh Hashana LaBehemot',  // "New Year for Animals" — not a public holiday
  'Pesach Sheni',            // Minor holiday, not a public day off
])

function isBlocklisted(name: string): boolean {
  if (BLOCKLIST_EXACT.has(name)) return true
  if (BLOCKLIST_PREFIXES.some(p => name.startsWith(p))) return true
  return false
}

function getHolidayTier(eventName: string): HolidayTier | null {
  // Rosh Hashana year-suffixed: "Rosh Hashana 5787" — match only year-suffixed form
  if (eventName.startsWith('Rosh Hashana ') && /\d{4}$/.test(eventName)) return 'full-day-off'
  if (FULL_DAY_OFF_EXACT.has(eventName)) return 'full-day-off'
  // HALF_DAY check before WORKDAY so Pesach VI (CH''M) gets half-day, not workday
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

  // Filter out blocklisted events entirely
  const relevant = ilEvents.filter(ev => !isBlocklisted(ev.render('en')))

  for (const ev of relevant) {
    const name = ev.render('en')
    const tier = getHolidayTier(name)
    if (tier) return { hebrewDate, holidayName: name, holidayTier: tier }
  }

  if (relevant.length > 0) {
    return { hebrewDate, holidayName: relevant[0].render('en'), holidayTier: null }
  }

  return { hebrewDate, holidayName: null, holidayTier: null }
}
