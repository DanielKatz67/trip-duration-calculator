export type WeekStructure = 'israel' | 'international';

export type HolidayTier = 'full-day-off' | 'half-day' | 'workday';

export interface ScoringThresholds {
  arrivalEarly: string;        // "10:00"
  arrivalMid: string;          // "15:00"
  departureEarly: string;      // "12:00"
  departureLate: string;       // "20:00"
  arrivalEarlyScore: number;   // 0.75
  arrivalMidScore: number;     // 0.50
  arrivalLateScore: number;    // 0.25
  departureEarlyScore: number; // 0.00
  departureMidScore: number;   // 0.50
  departureLateScore: number;  // 0.75
  // Vacation day logic: arrival day counts as vacation if outbound departs before this time
  arrivalVacationCutoff: string;    // "18:00"
  // Vacation day logic: departure day counts as vacation if return arrives after this time
  departureVacationCutoff: string;  // "09:00"
}

export const DEFAULT_THRESHOLDS: ScoringThresholds = {
  arrivalEarly: '10:00',
  arrivalMid: '15:00',
  departureEarly: '12:00',
  departureLate: '20:00',
  arrivalEarlyScore: 0.75,
  arrivalMidScore: 0.50,
  arrivalLateScore: 0.25,
  departureEarlyScore: 0.00,
  departureMidScore: 0.50,
  departureLateScore: 0.75,
  arrivalVacationCutoff: '18:00',
  departureVacationCutoff: '09:00',
}

export interface TripDay {
  date: Date;
  type: 'arrival' | 'full' | 'departure';
  isWeekend: boolean;
  usableValue: number;
  hebrewDate?: string;
  holidayName?: string;
  holidayTier?: HolidayTier;
}

export interface TripResult {
  usableDays: number;
  fullDays: number;
  travelDayValue: number;
  nights: number;
  calendarDays: number;
  weekdays: number;
  weekendDays: number;
  arrivalScore: number;
  departureScore: number;
  vacationDaysNeeded: number;
  halfVacationDaysNeeded: number;
  fullHolidaysOnWeekdays: string[];
  halfHolidaysOnWeekdays: string[];
  arrivalDayVacation: boolean;    // arrival day counts as a vacation day
  departureDayVacation: boolean;  // departure day counts as a vacation day
}

export interface FlightInputs {
  outboundDepartureDate: string;  // "YYYY-MM-DD"
  outboundDepartureTime: string;  // "HH:MM"
  outboundArrivalDate: string;
  outboundArrivalTime: string;
  returnDepartureDate: string;
  returnDepartureTime: string;
  returnArrivalDate: string;
  returnArrivalTime: string;
}
