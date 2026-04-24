import { describe, it, expect } from 'vitest'
import { calcArrivalScore } from '../../src/utils/calcArrivalScore'
import { DEFAULT_THRESHOLDS } from '../../src/types'

describe('calcArrivalScore', () => {
  it('returns 0.75 for arrival before 10:00', () => {
    expect(calcArrivalScore('09:00', DEFAULT_THRESHOLDS)).toBe(0.75)
  })

  it('returns 0.75 for arrival at exactly 09:59', () => {
    expect(calcArrivalScore('09:59', DEFAULT_THRESHOLDS)).toBe(0.75)
  })

  it('returns 0.5 for arrival at exactly 10:00', () => {
    expect(calcArrivalScore('10:00', DEFAULT_THRESHOLDS)).toBe(0.5)
  })

  it('returns 0.5 for arrival at 12:00', () => {
    expect(calcArrivalScore('12:00', DEFAULT_THRESHOLDS)).toBe(0.5)
  })

  it('returns 0.25 for arrival at exactly 15:00', () => {
    expect(calcArrivalScore('15:00', DEFAULT_THRESHOLDS)).toBe(0.25)
  })

  it('returns 0.25 for arrival at 20:00', () => {
    expect(calcArrivalScore('20:00', DEFAULT_THRESHOLDS)).toBe(0.25)
  })

  it('respects custom thresholds', () => {
    const custom = { ...DEFAULT_THRESHOLDS, arrivalEarly: '08:00', arrivalEarlyScore: 1.0 }
    expect(calcArrivalScore('07:00', custom)).toBe(1.0)
    expect(calcArrivalScore('09:00', custom)).toBe(0.5)
  })
})
