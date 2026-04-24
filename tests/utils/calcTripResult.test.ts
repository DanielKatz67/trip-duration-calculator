import { describe, it, expect } from 'vitest'
import { calcTripResult } from '../../src/utils/calcTripResult'
import { DEFAULT_THRESHOLDS } from '../../src/types'

describe('calcTripResult', () => {
  const inputs = {
    outboundDepartureDate: '2026-04-28',
    outboundDepartureTime: '08:00',
    outboundArrivalDate: '2026-04-28',
    outboundArrivalTime: '09:30',   // before 10:00 → 0.75
    returnDepartureDate: '2026-05-04',
    returnDepartureTime: '16:00',   // 12:00–20:00 → 0.5
    returnArrivalDate: '2026-05-05',
    returnArrivalTime: '01:00',
  }

  it('calculates correct usable days', () => {
    const result = calcTripResult(inputs, DEFAULT_THRESHOLDS, 'israel')
    // Full days: Apr 29, 30, May 1, 2, 3 = 5
    expect(result.fullDays).toBe(5)
    expect(result.arrivalScore).toBe(0.75)
    expect(result.departureScore).toBe(0.5)
    expect(result.usableDays).toBe(6.25)
    expect(result.travelDayValue).toBe(1.25)
  })

  it('calculates correct nights', () => {
    const result = calcTripResult(inputs, DEFAULT_THRESHOLDS, 'israel')
    expect(result.nights).toBe(6)
  })

  it('calculates correct calendar days', () => {
    const result = calcTripResult(inputs, DEFAULT_THRESHOLDS, 'israel')
    // Apr 28, 29, 30, May 1, 2, 3, 4 = 7
    expect(result.calendarDays).toBe(7)
  })

  it('handles same-day trip', () => {
    const sameDay = {
      ...inputs,
      outboundArrivalDate: '2026-04-28',
      outboundArrivalTime: '09:30',  // score 0.75
      returnDepartureDate: '2026-04-28',
      returnDepartureTime: '16:00',  // score 0.5
    }
    const result = calcTripResult(sameDay, DEFAULT_THRESHOLDS, 'israel')
    expect(result.fullDays).toBe(0)
    expect(result.nights).toBe(0)
    expect(result.usableDays).toBe(0.75) // max(0.75, 0.5)
  })
})
