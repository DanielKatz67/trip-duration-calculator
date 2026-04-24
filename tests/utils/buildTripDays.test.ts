import { describe, it, expect } from 'vitest'
import { buildTripDays } from '../../src/utils/buildTripDays'

describe('buildTripDays', () => {
  it('produces arrival, full days, and departure for a 3-day trip', () => {
    const days = buildTripDays('2026-04-27', '2026-04-30', 0.75, 0.5, 'israel')
    expect(days).toHaveLength(4)
    expect(days[0].type).toBe('arrival')
    expect(days[0].usableValue).toBe(0.75)
    expect(days[1].type).toBe('full')
    expect(days[1].usableValue).toBe(1)
    expect(days[2].type).toBe('full')
    expect(days[3].type).toBe('departure')
    expect(days[3].usableValue).toBe(0.5)
  })

  it('produces only arrival+departure for same-day trip', () => {
    const days = buildTripDays('2026-04-27', '2026-04-27', 0.75, 0.5, 'israel')
    expect(days).toHaveLength(1)
    expect(days[0].type).toBe('arrival')
    expect(days[0].usableValue).toBe(0.75) // same-day: use max(arrival, departure) on single entry
  })

  it('marks Friday and Saturday as weekend in israel mode', () => {
    // Apr 30 2026 = Thu, May 1 = Fri, May 2 = Sat, May 3 = Sun
    const days = buildTripDays('2026-04-30', '2026-05-03', 0.75, 0.5, 'israel')
    const fri = days.find(d => d.date.getDate() === 1 && d.date.getMonth() === 4)
    const sat = days.find(d => d.date.getDate() === 2 && d.date.getMonth() === 4)
    const sun = days.find(d => d.date.getDate() === 3 && d.date.getMonth() === 4)
    expect(fri?.isWeekend).toBe(true)
    expect(sat?.isWeekend).toBe(true)
    expect(sun?.isWeekend).toBe(false)
  })

  it('marks Saturday and Sunday as weekend in international mode', () => {
    const days = buildTripDays('2026-04-30', '2026-05-03', 0.75, 0.5, 'international')
    const fri = days.find(d => d.date.getDate() === 1 && d.date.getMonth() === 4)
    const sat = days.find(d => d.date.getDate() === 2 && d.date.getMonth() === 4)
    const sun = days.find(d => d.date.getDate() === 3 && d.date.getMonth() === 4)
    expect(fri?.isWeekend).toBe(false)
    expect(sat?.isWeekend).toBe(true)
    expect(sun?.isWeekend).toBe(true)
  })
})
