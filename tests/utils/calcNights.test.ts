import { describe, it, expect } from 'vitest'
import { calcNights } from '../../src/utils/calcNights'

describe('calcNights', () => {
  it('returns 4 for Mon arrival, Fri departure', () => {
    expect(calcNights('2026-04-27', '2026-05-01')).toBe(4)
  })

  it('returns 0 for same-day trip', () => {
    expect(calcNights('2026-04-27', '2026-04-27')).toBe(0)
  })

  it('returns 1 for consecutive days', () => {
    expect(calcNights('2026-04-27', '2026-04-28')).toBe(1)
  })

  it('handles cross-month correctly', () => {
    expect(calcNights('2026-04-28', '2026-05-04')).toBe(6)
  })
})
