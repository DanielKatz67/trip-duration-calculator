export function formatBreakdown(fullDays: number, travelDayValue: number): string {
  const dayLabel = fullDays === 1 ? 'full day' : 'full days'
  const travel = travelDayValue.toString()
  return `${fullDays} ${dayLabel} + ${travel} travel-day value`
}
