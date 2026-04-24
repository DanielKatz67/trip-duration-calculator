import { describe, it, expect } from 'vitest'
import { calcWeekdayCounts } from '../../src/utils/calcWeekdayCounts'

// Week: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6

describe('calcWeekdayCounts — israel mode (Fri+Sat=weekend)', () => {
  it('counts correctly for Mon–Fri (no weekends in Israel mode)', () => {
    const dates = [
      new Date('2026-04-27'),
      new Date('2026-04-28'),
      new Date('2026-04-29'),
      new Date('2026-04-30'),
      new Date('2026-05-01'),
    ]
    const result = calcWeekdayCounts(dates, 'israel')
    // Fri May 1 = weekend in Israel mode; Mon-Thu = 4 weekdays
    expect(result.weekdays).toBe(4)
    expect(result.weekendDays).toBe(1)
  })

  it('counts Fri and Sat as weekend in Israel mode', () => {
    const dates = [new Date('2026-05-01'), new Date('2026-05-02')] // Fri, Sat
    const result = calcWeekdayCounts(dates, 'israel')
    expect(result.weekdays).toBe(0)
    expect(result.weekendDays).toBe(2)
  })
})

describe('calcWeekdayCounts — international mode (Sat+Sun=weekend)', () => {
  it('counts Sat and Sun as weekend in international mode', () => {
    const dates = [new Date('2026-05-02'), new Date('2026-05-03')] // Sat, Sun
    const result = calcWeekdayCounts(dates, 'international')
    expect(result.weekdays).toBe(0)
    expect(result.weekendDays).toBe(2)
  })

  it('counts Fri as weekday in international mode', () => {
    const dates = [new Date('2026-05-01')] // Fri
    const result = calcWeekdayCounts(dates, 'international')
    expect(result.weekdays).toBe(1)
    expect(result.weekendDays).toBe(0)
  })
})
