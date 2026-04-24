export function calcNights(arrivalDateStr: string, departureDateStr: string): number {
  const arrival = new Date(arrivalDateStr)
  const departure = new Date(departureDateStr)
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((departure.getTime() - arrival.getTime()) / msPerDay)
}
