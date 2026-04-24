import { HDate, HebrewCalendar } from '@hebcal/core'
import type { HolidayTier } from '../types'

const FULL_DAY_OFF_EVENTS = new Set([
  'Rosh Hashana 1',
  'Rosh Hashana 2',
  'Yom Kippur',
  'Sukkot I',
  'Shmini Atzeret',
  'Simchat Torah',
  'Pesach I',
  'Pesach VII',
  'Shavuot',
  'Independence Day',
  'Shabbat',
])

const HALF_DAY_EVENTS = new Set([
  'Erev Rosh Hashana',
  'Erev Yom Kippur',
  'Erev Sukkot',
  'Erev Shmini Atzeret',
  'Erev Pesach',
  'Erev Shavuot',
  'Yom HaZikaron',
])

const WORKDAY_PATTERNS = ['Chol ha-Moed', 'Chanukah', 'Purim', 'Fast of Esther', 'Yom HaShoah', 'Erev Yom HaZikaron', 'Lag BaOmer']

function getHolidayTier(eventName: string): HolidayTier | null {
  if (FULL_DAY_OFF_EVENTS.has(eventName)) return 'full-day-off'
  if (HALF_DAY_EVENTS.has(eventName)) return 'half-day'
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

  // Saturday = Shabbat (takes priority over other events on that day)
  if (date.getDay() === 6) {
    return { hebrewDate, holidayName: 'Shabbat', holidayTier: 'full-day-off' }
  }

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
