# Trip Duration Calculator — Design Spec

**Date:** 2026-04-24  
**Stack:** Vite + React + TypeScript, client-side only, no backend, no auth, no database.

---

## Goal

Help users understand the real usable length of a trip based on flight dates and times. The app calculates how many usable days a trip provides at the destination, broken down clearly into full days and travel-day partial values.

---

## What is NOT in scope

- Cost, budget, or expense features
- Login or user accounts
- Saved trips
- Backend / API server
- Destination timezone selector (not needed — boarding pass times are already in local time)

---

## Inputs

Four flight datetime fields, matching what appears on a boarding pass:

| Field | Timezone | Used for scoring? |
|---|---|---|
| Outbound departure date + time | Home local time | No |
| Outbound arrival date + time | Destination local time | Yes — arrival day score |
| Return departure date + time | Destination local time | Yes — departure day score |
| Return arrival date + time | Home local time | No |

All four fields are always shown. Label the two scoring fields (outbound arrival, return departure) with a small badge "⏱ affects result".

---

## Settings

### Week structure (top-level toggle, not hidden)
- **Israel** (default): Weekend = Friday + Saturday. Weekdays = Sunday–Thursday.
- **International**: Weekend = Saturday + Sunday. Weekdays = Monday–Friday.

### Advanced Settings (collapsible section)
Configurable scoring thresholds:

**Arrival day score** (based on outbound arrival time):
- Arrive before 10:00 → 0.75
- Arrive 10:00–15:00 → 0.50
- Arrive after 15:00 → 0.25

**Departure day score** (based on return departure time):
- Leave before 12:00 → 0.00
- Leave 12:00–20:00 → 0.50
- Leave after 20:00 → 0.75

All six thresholds (10:00, 15:00, 12:00, 20:00) and their corresponding scores are editable by the user.

---

## Calculation Logic

### Definitions

- **Nights**: Number of nights at the destination = (return departure date) − (outbound arrival date) in days.  
  Example: arrive Monday, depart Friday = 4 nights.

- **Full days**: Complete dates strictly between arrival date and departure date (exclusive on both ends).  
  Example: arrive Monday, depart Friday → Tue, Wed, Thu = 3 full days.

- **Arrival day score**: Score for the outbound arrival date based on outbound arrival time.

- **Departure day score**: Score for the return departure date based on return departure time.

- **Total usable days**: full days + arrival day score + departure day score.

- **Calendar days**: Count of destination dates from arrival date through departure date inclusive.  
  Example: arrive Monday, depart Friday = Mon + Tue + Wed + Thu + Fri = 5 calendar days.

- **Weekdays / Weekend days**: Count of calendar days that fall on weekdays or weekend days per selected week structure.

### Edge cases
- **Same-day trip** (arrival date == departure date): 0 full days, 0 nights. Usable days = max(arrival score, departure score) — take the higher of the two, since both scores apply to the same physical day and combining them would overcount.
- **Overnight outbound flight** (departure date before arrival date): handled correctly — only arrival date matters for scoring.
- **Validation**: Return departure must be on or after outbound arrival date. Show inline error if not. All four fields must be filled before calculating.

---

## Result Card

Primary display:

```
6.25 usable days
5 full days + 1.25 travel-day value
```

Secondary stats (6-cell grid):

| Full days | Travel-day value | Nights |
|---|---|---|
| Calendar days | Weekdays | Weekend days |

Calculations update automatically on every input change. No "Calculate" button.

---

## Trip Calendar View

### Layout
A real calendar grid (7-column, week-aligned). Shows only the trip month(s). Non-trip days in the same month are shown faded/greyed. If the trip spans two months, render two separate month grids stacked vertically, each with its own month/year header.

### Column headers
Days of week according to selected week structure:
- Israel: Sun Mon Tue Wed Thu Fri Sat (Fri+Sat highlighted as weekend)
- International: Mon Tue Wed Thu Fri Sat Sun (Sat+Sun highlighted as weekend)

### Cell content (per trip day)
- Date number (bold)
- Day type badge: Arrival / Full day / Weekend / Departure
- Usable value: 0, 0.25, 0.5, 0.75, or 1.00
- Hebrew date (small, subtle) — if Hebrew calendar enabled
- Holiday tier pill shown on the cell: green "Day off" / yellow "Half day" / grey "Workday"
- Holiday name (e.g. "Lag B'Omer", "Shabbat") shown below the tier pill

### Color coding
- Arrival day: orange
- Full weekday: green
- Full weekend day: yellow/gold
- Departure day: red/coral
- Non-trip days in month: faded, no color

### Hebrew calendar toggle
A toggle switch labeled "Show Jewish calendar". Off by default. When enabled:
- Hebrew date shown in each trip day cell
- Holiday label shown (or "—" if none)
- Uses `@hebcal/core` entirely client-side (no API calls)

---

## Hebrew / Israeli Calendar

### Implementation
Use `@hebcal/core` (npm package, client-side). No backend needed.

### Data shown per day (when toggle is on)
- Hebrew date string (e.g., י״ו ניסן)
- Holiday name if applicable (e.g., "Pesach day 2", "Chol HaMoed", "Shabbat")
- Holiday tier label (informational only, does not affect scoring):

| Tier | Examples |
|---|---|
| Full day off | Rosh Hashana (2 days), Yom Kippur, Sukkot 1st, Shemini Atzeret/Simchat Torah, Pesach 1st & 7th, Shavuot, Independence Day |
| Half day (4/4.5 hrs) | Erev Rosh Hashana, Erev Yom Kippur, Erev Sukkot, Erev Simchat Torah, Erev Pesach, Erev Shavuot, Yom HaZikaron (IDF Memorial Day) |
| Full workday | Chol HaMoed Sukkot, Chol HaMoed Pesach, Chanukah, Purim, Fast of Esther, Holocaust Memorial Day, Yom HaZikaron Eve, Lag B'Omer |

Israeli holiday schedule used (not diaspora).

---

## Component Structure

```
App
├── FlightInputCard          — 4 datetime fields
├── SettingsCard             — week structure toggle + collapsible advanced thresholds
├── ResultCard               — usable days headline + 6-stat grid
└── TripCalendarCard
    ├── CalendarGrid         — 7-col week-aligned grid
    └── CalendarCell         — individual day cell with color + Hebrew data
```

### Utility functions (pure, no side effects)

| Function | Purpose |
|---|---|
| `calcNights(arrivalDate, departureDate)` | Nights at destination |
| `calcFullDays(arrivalDate, departureDate)` | Full days between arrival and departure |
| `calcArrivalScore(arrivalTime, thresholds)` | Score for arrival day |
| `calcDepartureScore(departureTime, thresholds)` | Score for departure day |
| `calcWeekdayCounts(dates[], weekStructure)` | Count weekdays + weekend days |
| `buildTripDays(arrivalDate, departureDate, scores, weekStructure)` | Array of TripDay objects for calendar |
| `formatBreakdown(fullDays, travelDayValue)` | "5 full days + 1.25 travel-day value" |
| `getHebrewCalendarData(date)` | Hebrew date + holiday info for one date |

---

## Data Types

```typescript
type WeekStructure = 'israel' | 'international';

interface ScoringThresholds {
  arrivalEarly: string;     // default "10:00"
  arrivalMid: string;       // default "15:00"
  departureEarly: string;   // default "12:00"
  departureLate: string;    // default "20:00"
  arrivalEarlyScore: number;   // 0.75
  arrivalMidScore: number;     // 0.50
  arrivalLateScore: number;    // 0.25
  departureEarlyScore: number; // 0.00
  departureMidScore: number;   // 0.50
  departureLateScore: number;  // 0.75
}

interface TripDay {
  date: Date;
  type: 'arrival' | 'full' | 'departure';
  isWeekend: boolean;
  usableValue: number;
  hebrewDate?: string;
  holidayName?: string;
  holidayTier?: 'full-day-off' | 'half-day' | 'workday';
}

interface TripResult {
  usableDays: number;
  fullDays: number;
  travelDayValue: number;
  nights: number;
  calendarDays: number;
  weekdays: number;
  weekendDays: number;
  arrivalScore: number;
  departureScore: number;
}
```

---

## Validation Rules

- All four datetime fields required before showing results
- Return departure must be ≥ outbound arrival; show inline error if not
- Same-day trips are valid; handle gracefully
- Overnight outbound flights (depart day N, arrive day N+1) are valid

---

## Styling

- Dark theme, clean card-based layout
- Mobile-first responsive — single column, touch-friendly, tested on iPhone viewport
- Gradient hero header with plane emoji and drop-shadow glow
- Auto-calculate on every input change — no submit button
- Cards: Flight inputs, Settings, Result, Trip Calendar
- Result card visually distinct (blue/purple gradient background + accent border)
- Stat grid uses emoji icons (☀️ 🌙 ✈️ 📅 💼 🏖️) per stat
- Calendar: color-coded cells per day type; weekend columns subtly highlighted in yellow
- Holiday tier shown as colored pill badge (green/yellow/grey) on each calendar cell
