import { describe, it, expect } from 'vitest'
import { calcFullDays } from '../../src/utils/calcFullDays'

describe('calcFullDays', () => {
  it('returns 3 for Mon–Fri trip (Tue, Wed, Thu are full)', () => {
    expect(calcFullDays('2026-04-27', '2026-05-01')).toBe(3)
  })

  it('returns 0 for same-day trip', () => {
    expect(calcFullDays('2026-04-27', '2026-04-27')).toBe(0)
  })

  it('returns 0 for consecutive-day trip', () => {
    expect(calcFullDays('2026-04-27', '2026-04-28')).toBe(0)
  })

  it('returns 5 for 7-day trip', () => {
    expect(calcFullDays('2026-04-28', '2026-05-04')).toBe(5)
  })
})
