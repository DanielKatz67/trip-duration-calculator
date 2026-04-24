import type { ScoringThresholds } from '../types'

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function calcDepartureScore(departureTime: string, thresholds: ScoringThresholds): number {
  const minutes = timeToMinutes(departureTime)
  const early = timeToMinutes(thresholds.departureEarly)
  const late = timeToMinutes(thresholds.departureLate)

  if (minutes < early) return thresholds.departureEarlyScore
  if (minutes < late) return thresholds.departureMidScore
  return thresholds.departureLateScore
}
