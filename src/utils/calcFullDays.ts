export function calcFullDays(arrivalDateStr: string, departureDateStr: string): number {
  const arrival = new Date(arrivalDateStr)
  const departure = new Date(departureDateStr)
  const msPerDay = 1000 * 60 * 60 * 24
  const diff = Math.round((departure.getTime() - arrival.getTime()) / msPerDay)
  return Math.max(0, diff - 1)
}
