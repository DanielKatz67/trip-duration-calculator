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

  it('arrivalDayVacation is true when outbound departs before cutoff', () => {
    // outboundDepartureTime 08:00 < arrivalVacationCutoff 18:00 → true
    const result = calcTripResult(inputs, DEFAULT_THRESHOLDS, 'israel')
    expect(result.arrivalDayVacation).toBe(true)
  })

  it('arrivalDayVacation is false when outbound departs after cutoff', () => {
    const lateInputs = { ...inputs, outboundDepartureTime: '20:00' }
    const result = calcTripResult(lateInputs, DEFAULT_THRESHOLDS, 'israel')
    expect(result.arrivalDayVacation).toBe(false)
  })

  it('departureDayVacation is false when return arrives before cutoff', () => {
    // returnArrivalTime 01:00 < departureVacationCutoff 09:00 → false
    const result = calcTripResult(inputs, DEFAULT_THRESHOLDS, 'israel')
    expect(result.departureDayVacation).toBe(false)
  })

  it('departureDayVacation is true when return arrives after cutoff', () => {
    const lateReturn = { ...inputs, returnArrivalTime: '12:00' }
    const result = calcTripResult(lateReturn, DEFAULT_THRESHOLDS, 'israel')
    expect(result.departureDayVacation).toBe(true)
  })
})

