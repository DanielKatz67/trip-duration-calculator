import { describe, it, expect } from 'vitest'
import { formatBreakdown } from '../../src/utils/formatBreakdown'

describe('formatBreakdown', () => {
  it('formats standard case', () => {
    expect(formatBreakdown(5, 1.25)).toBe('5 full days + 1.25 travel-day value')
  })

  it('formats zero full days', () => {
    expect(formatBreakdown(0, 0.75)).toBe('0 full days + 0.75 travel-day value')
  })

  it('formats whole number travel value without trailing zero', () => {
    expect(formatBreakdown(3, 1)).toBe('3 full days + 1 travel-day value')
  })

  it('formats single full day', () => {
    expect(formatBreakdown(1, 0.5)).toBe('1 full day + 0.5 travel-day value')
  })
})
