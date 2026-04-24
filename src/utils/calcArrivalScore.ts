import type { ScoringThresholds } from '../types'

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function calcArrivalScore(arrivalTime: string, thresholds: ScoringThresholds): number {
  const minutes = timeToMinutes(arrivalTime)
  const early = timeToMinutes(thresholds.arrivalEarly)
  const mid = timeToMinutes(thresholds.arrivalMid)

  if (minutes < early) return thresholds.arrivalEarlyScore
  if (minutes < mid) return thresholds.arrivalMidScore
  return thresholds.arrivalLateScore
}
