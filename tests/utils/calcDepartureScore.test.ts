import { describe, it, expect } from 'vitest'
import { calcDepartureScore } from '../../src/utils/calcDepartureScore'
import { DEFAULT_THRESHOLDS } from '../../src/types'

describe('calcDepartureScore', () => {
  it('returns 0 for departure before 12:00', () => {
    expect(calcDepartureScore('09:00', DEFAULT_THRESHOLDS)).toBe(0)
  })

  it('returns 0 for departure at 11:59', () => {
    expect(calcDepartureScore('11:59', DEFAULT_THRESHOLDS)).toBe(0)
  })

  it('returns 0.5 for departure at exactly 12:00', () => {
    expect(calcDepartureScore('12:00', DEFAULT_THRESHOLDS)).toBe(0.5)
  })

  it('returns 0.5 for departure at 16:00', () => {
    expect(calcDepartureScore('16:00', DEFAULT_THRESHOLDS)).toBe(0.5)
  })

  it('returns 0.75 for departure at exactly 20:00', () => {
    expect(calcDepartureScore('20:00', DEFAULT_THRESHOLDS)).toBe(0.75)
  })

  it('returns 0.75 for departure at 23:00', () => {
    expect(calcDepartureScore('23:00', DEFAULT_THRESHOLDS)).toBe(0.75)
  })

  it('respects custom thresholds', () => {
    const custom = { ...DEFAULT_THRESHOLDS, departureLate: '22:00', departureLateScore: 1.0 }
    expect(calcDepartureScore('23:00', custom)).toBe(1.0)
  })
})
