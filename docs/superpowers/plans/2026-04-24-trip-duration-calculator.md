# Trip Duration Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side React + TypeScript app that calculates the real usable days of a trip from boarding-pass flight times, with a Hebrew/Israeli calendar overlay.

**Architecture:** Vite + React + TypeScript SPA. All logic lives in pure utility functions with no side effects. React components are thin wrappers over those utilities. `@hebcal/core` runs entirely client-side for Hebrew calendar data.

**Tech Stack:** Vite 5, React 18, TypeScript 5, @hebcal/core, Vitest, CSS custom properties (no CSS framework)

---

## File Map

```
src/
  types.ts                     — all shared TypeScript interfaces and types
  utils/
    calcNights.ts              — calcNights()
    calcFullDays.ts            — calcFullDays()
    calcArrivalScore.ts        — calcArrivalScore()
    calcDepartureScore.ts      — calcDepartureScore()
    calcWeekdayCounts.ts       — calcWeekdayCounts()
    buildTripDays.ts           — buildTripDays()
    formatBreakdown.ts         — formatBreakdown()
    calcTripResult.ts          — calcTripResult() — orchestrates all utils into TripResult
    hebrewCalendar.ts          — getHebrewCalendarData()
    calcVacationDays.ts        — calcVacationDays()
  components/
    FlightInputCard.tsx        — 4 datetime fields
    SettingsCard.tsx           — week structure toggle + collapsible advanced thresholds
    ResultCard.tsx             — usable days headline + 6-stat grid
    TripCalendarCard.tsx       — calendar section header + renders CalendarMonth per month
    CalendarMonth.tsx          — single month 7-col grid
    CalendarCell.tsx           — individual day cell
  App.tsx                      — root state, wires all cards together
  App.css                      — global dark theme, card styles, layout
  main.tsx                     — Vite entry point
tests/
  utils/
    calcNights.test.ts
    calcFullDays.test.ts
    calcArrivalScore.test.ts
    calcDepartureScore.test.ts
    calcWeekdayCounts.test.ts
    buildTripDays.test.ts
    formatBreakdown.test.ts
    calcTripResult.test.ts
    hebrewCalendar.test.ts
```

---

## Task 1: Scaffold Vite project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/App.css`

- [ ] **Step 1: Scaffold project**

```bash
cd /Users/i751531/Playground/trip-duration-calculator
npm create vite@latest . -- --template react-ts
```

Answer prompts: select "React" then "TypeScript". When asked if ok to proceed in current directory, answer "y".

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install @hebcal/core
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

- [ ] **Step 3: Configure Vitest in vite.config.ts**

Replace the contents of `vite.config.ts` with:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
})
```

- [ ] **Step 4: Create test setup file**

Create `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to package.json**

In `package.json`, add to the `"scripts"` section:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Verify scaffold works**

```bash
npm run dev
```

Expected: Vite dev server starts, browser shows default React page at http://localhost:5173

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript project with Vitest"
```

---

## Task 2: Define shared types

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Create types file**

Create `src/types.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/types.ts
git commit -m "feat: add shared TypeScript types"
```

---

## Task 3: calcNights utility

**Files:**
- Create: `src/utils/calcNights.ts`
- Create: `tests/utils/calcNights.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/utils/calcNights.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calcNights } from '../../src/utils/calcNights'

describe('calcNights', () => {
  it('returns 4 for Mon arrival, Fri departure', () => {
    expect(calcNights('2026-04-27', '2026-05-01')).toBe(4)
  })

  it('returns 0 for same-day trip', () => {
    expect(calcNights('2026-04-27', '2026-04-27')).toBe(0)
  })

  it('returns 1 for consecutive days', () => {
    expect(calcNights('2026-04-27', '2026-04-28')).toBe(1)
  })

  it('handles cross-month correctly', () => {
    expect(calcNights('2026-04-28', '2026-05-04')).toBe(6)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- calcNights
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Implement**

Create `src/utils/calcNights.ts`:

```typescript
export function calcNights(arrivalDateStr: string, departureDateStr: string): number {
  const arrival = new Date(arrivalDateStr)
  const departure = new Date(departureDateStr)
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((departure.getTime() - arrival.getTime()) / msPerDay)
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- calcNights
```

Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/calcNights.ts tests/utils/calcNights.test.ts
git commit -m "feat: add calcNights utility"
```

---

## Task 4: calcFullDays utility

**Files:**
- Create: `src/utils/calcFullDays.ts`
- Create: `tests/utils/calcFullDays.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/utils/calcFullDays.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calcFullDays } from '../../src/utils/calcFullDays'

describe('calcFullDays', () => {
  it('returns 3 for Mon–Fri trip (Tue, Wed, Thu are full)', () => {
    expect(calcFullDays('2026-04-27', '2026-05-01')).toBe(3)
  })

  it('returns 0 for same-day trip', () => {
    expect(calcFullDays('2026-04-27', '2026-04-27')).toBe(0)
  })

  it('returns 0 for consecutive-day trip', () => {
    expect(calcFullDays('2026-04-27', '2026-04-28')).toBe(0)
  })

  it('returns 5 for 7-day trip', () => {
    expect(calcFullDays('2026-04-28', '2026-05-05')).toBe(5)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- calcFullDays
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Implement**

Create `src/utils/calcFullDays.ts`:

```typescript
export function calcFullDays(arrivalDateStr: string, departureDateStr: string): number {
  const arrival = new Date(arrivalDateStr)
  const departure = new Date(departureDateStr)
  const msPerDay = 1000 * 60 * 60 * 24
  const diff = Math.round((departure.getTime() - arrival.getTime()) / msPerDay)
  return Math.max(0, diff - 1)
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- calcFullDays
```

Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/calcFullDays.ts tests/utils/calcFullDays.test.ts
git commit -m "feat: add calcFullDays utility"
```

---

## Task 5: calcArrivalScore and calcDepartureScore utilities

**Files:**
- Create: `src/utils/calcArrivalScore.ts`
- Create: `src/utils/calcDepartureScore.ts`
- Create: `tests/utils/calcArrivalScore.test.ts`
- Create: `tests/utils/calcDepartureScore.test.ts`

- [ ] **Step 1: Write failing tests for calcArrivalScore**

Create `tests/utils/calcArrivalScore.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calcArrivalScore } from '../../src/utils/calcArrivalScore'
import { DEFAULT_THRESHOLDS } from '../../src/types'

describe('calcArrivalScore', () => {
  it('returns 0.75 for arrival before 10:00', () => {
    expect(calcArrivalScore('09:00', DEFAULT_THRESHOLDS)).toBe(0.75)
  })

  it('returns 0.75 for arrival at exactly 09:59', () => {
    expect(calcArrivalScore('09:59', DEFAULT_THRESHOLDS)).toBe(0.75)
  })

  it('returns 0.5 for arrival at exactly 10:00', () => {
    expect(calcArrivalScore('10:00', DEFAULT_THRESHOLDS)).toBe(0.5)
  })

  it('returns 0.5 for arrival at 12:00', () => {
    expect(calcArrivalScore('12:00', DEFAULT_THRESHOLDS)).toBe(0.5)
  })

  it('returns 0.25 for arrival at exactly 15:00', () => {
    expect(calcArrivalScore('15:00', DEFAULT_THRESHOLDS)).toBe(0.25)
  })

  it('returns 0.25 for arrival at 20:00', () => {
    expect(calcArrivalScore('20:00', DEFAULT_THRESHOLDS)).toBe(0.25)
  })

  it('respects custom thresholds', () => {
    const custom = { ...DEFAULT_THRESHOLDS, arrivalEarly: '08:00', arrivalEarlyScore: 1.0 }
    expect(calcArrivalScore('07:00', custom)).toBe(1.0)
    expect(calcArrivalScore('09:00', custom)).toBe(0.5)
  })
})
```

- [ ] **Step 2: Write failing tests for calcDepartureScore**

Create `tests/utils/calcDepartureScore.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calcDepartureScore } from '../../src/utils/calcDepartureScore'
import { DEFAULT_THRESHOLDS } from '../../src/types'

describe('calcDepartureScore', () => {
  it('returns 0 for departure before 12:00', () => {
    expect(calcDepartureScore('09:00', DEFAULT_THRESHOLDS)).toBe(0)
  })

  it('returns 0 for departure at 11:59', () => {
    expect(calcDepartureScore('11:59', DEFAULT_THRESHOLDS)).toBe(0)
  })

  it('returns 0.5 for departure at exactly 12:00', () => {
    expect(calcDepartureScore('12:00', DEFAULT_THRESHOLDS)).toBe(0.5)
  })

  it('returns 0.5 for departure at 16:00', () => {
    expect(calcDepartureScore('16:00', DEFAULT_THRESHOLDS)).toBe(0.5)
  })

  it('returns 0.75 for departure at exactly 20:00', () => {
    expect(calcDepartureScore('20:00', DEFAULT_THRESHOLDS)).toBe(0.75)
  })

  it('returns 0.75 for departure at 23:00', () => {
    expect(calcDepartureScore('23:00', DEFAULT_THRESHOLDS)).toBe(0.75)
  })

  it('respects custom thresholds', () => {
    const custom = { ...DEFAULT_THRESHOLDS, departureLate: '22:00', departureLateScore: 1.0 }
    expect(calcDepartureScore('23:00', custom)).toBe(1.0)
  })
})
```

- [ ] **Step 3: Run tests — expect failure**

```bash
npm test -- calcArrivalScore calcDepartureScore
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 4: Implement calcArrivalScore**

Create `src/utils/calcArrivalScore.ts`:

```typescript
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
```

- [ ] **Step 5: Implement calcDepartureScore**

Create `src/utils/calcDepartureScore.ts`:

```typescript
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
```

- [ ] **Step 6: Run tests — expect pass**

```bash
npm test -- calcArrivalScore calcDepartureScore
```

Expected: all tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/utils/calcArrivalScore.ts src/utils/calcDepartureScore.ts tests/utils/calcArrivalScore.test.ts tests/utils/calcDepartureScore.test.ts
git commit -m "feat: add calcArrivalScore and calcDepartureScore utilities"
```

---

## Task 6: calcWeekdayCounts utility

**Files:**
- Create: `src/utils/calcWeekdayCounts.ts`
- Create: `tests/utils/calcWeekdayCounts.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/utils/calcWeekdayCounts.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calcWeekdayCounts } from '../../src/utils/calcWeekdayCounts'

// Apr 28 2026 = Tuesday
// Week: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6

describe('calcWeekdayCounts — israel mode (Fri+Sat=weekend)', () => {
  it('counts correctly for Mon–Fri (no weekends in Israel mode)', () => {
    // Mon Apr 27, Tue Apr 28, Wed Apr 29, Thu Apr 30, Fri May 1
    const dates = [
      new Date('2026-04-27'),
      new Date('2026-04-28'),
      new Date('2026-04-29'),
      new Date('2026-04-30'),
      new Date('2026-05-01'),
    ]
    const result = calcWeekdayCounts(dates, 'israel')
    // Fri May 1 = weekend in Israel mode; Mon-Thu = 4 weekdays
    expect(result.weekdays).toBe(4)
    expect(result.weekendDays).toBe(1)
  })

  it('counts Fri and Sat as weekend in Israel mode', () => {
    const dates = [new Date('2026-05-01'), new Date('2026-05-02')] // Fri, Sat
    const result = calcWeekdayCounts(dates, 'israel')
    expect(result.weekdays).toBe(0)
    expect(result.weekendDays).toBe(2)
  })
})

describe('calcWeekdayCounts — international mode (Sat+Sun=weekend)', () => {
  it('counts Sat and Sun as weekend in international mode', () => {
    const dates = [new Date('2026-05-02'), new Date('2026-05-03')] // Sat, Sun
    const result = calcWeekdayCounts(dates, 'international')
    expect(result.weekdays).toBe(0)
    expect(result.weekendDays).toBe(2)
  })

  it('counts Fri as weekday in international mode', () => {
    const dates = [new Date('2026-05-01')] // Fri
    const result = calcWeekdayCounts(dates, 'international')
    expect(result.weekdays).toBe(1)
    expect(result.weekendDays).toBe(0)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- calcWeekdayCounts
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Implement**

Create `src/utils/calcWeekdayCounts.ts`:

```typescript
import type { WeekStructure } from '../types'

function isWeekend(date: Date, weekStructure: WeekStructure): boolean {
  const day = date.getDay() // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  if (weekStructure === 'israel') return day === 5 || day === 6  // Fri, Sat
  return day === 0 || day === 6  // Sun, Sat
}

export function calcWeekdayCounts(
  dates: Date[],
  weekStructure: WeekStructure
): { weekdays: number; weekendDays: number } {
  let weekdays = 0
  let weekendDays = 0
  for (const date of dates) {
    if (isWeekend(date, weekStructure)) weekendDays++
    else weekdays++
  }
  return { weekdays, weekendDays }
}

export { isWeekend }
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- calcWeekdayCounts
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/calcWeekdayCounts.ts tests/utils/calcWeekdayCounts.test.ts
git commit -m "feat: add calcWeekdayCounts utility"
```

---

## Task 7: formatBreakdown utility

**Files:**
- Create: `src/utils/formatBreakdown.ts`
- Create: `tests/utils/formatBreakdown.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/utils/formatBreakdown.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- formatBreakdown
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Implement**

Create `src/utils/formatBreakdown.ts`:

```typescript
export function formatBreakdown(fullDays: number, travelDayValue: number): string {
  const dayLabel = fullDays === 1 ? 'full day' : 'full days'
  const travel = Number.isInteger(travelDayValue)
    ? travelDayValue.toString()
    : travelDayValue.toString()
  return `${fullDays} ${dayLabel} + ${travel} travel-day value`
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- formatBreakdown
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/formatBreakdown.ts tests/utils/formatBreakdown.test.ts
git commit -m "feat: add formatBreakdown utility"
```

---

## Task 8: buildTripDays utility

**Files:**
- Create: `src/utils/buildTripDays.ts`
- Create: `tests/utils/buildTripDays.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/utils/buildTripDays.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { buildTripDays } from '../../src/utils/buildTripDays'

describe('buildTripDays', () => {
  it('produces arrival, full days, and departure for a 3-day trip', () => {
    const days = buildTripDays('2026-04-27', '2026-04-30', 0.75, 0.5, 'israel')
    expect(days).toHaveLength(4)
    expect(days[0].type).toBe('arrival')
    expect(days[0].usableValue).toBe(0.75)
    expect(days[1].type).toBe('full')
    expect(days[1].usableValue).toBe(1)
    expect(days[2].type).toBe('full')
    expect(days[3].type).toBe('departure')
    expect(days[3].usableValue).toBe(0.5)
  })

  it('produces only arrival+departure for same-day trip', () => {
    const days = buildTripDays('2026-04-27', '2026-04-27', 0.75, 0.5, 'israel')
    expect(days).toHaveLength(1)
    expect(days[0].type).toBe('arrival')
    expect(days[0].usableValue).toBe(0.75) // same-day: use max(arrival, departure) on single entry
  })

  it('marks Friday and Saturday as weekend in israel mode', () => {
    // Apr 30 2026 = Thu, May 1 = Fri, May 2 = Sat, May 3 = Sun
    const days = buildTripDays('2026-04-30', '2026-05-03', 0.75, 0.5, 'israel')
    const fri = days.find(d => d.date.toISOString().startsWith('2026-05-01'))
    const sat = days.find(d => d.date.toISOString().startsWith('2026-05-02'))
    const sun = days.find(d => d.date.toISOString().startsWith('2026-05-03'))
    expect(fri?.isWeekend).toBe(true)
    expect(sat?.isWeekend).toBe(true)
    expect(sun?.isWeekend).toBe(false)
  })

  it('marks Saturday and Sunday as weekend in international mode', () => {
    const days = buildTripDays('2026-04-30', '2026-05-03', 0.75, 0.5, 'international')
    const fri = days.find(d => d.date.toISOString().startsWith('2026-05-01'))
    const sat = days.find(d => d.date.toISOString().startsWith('2026-05-02'))
    const sun = days.find(d => d.date.toISOString().startsWith('2026-05-03'))
    expect(fri?.isWeekend).toBe(false)
    expect(sat?.isWeekend).toBe(true)
    expect(sun?.isWeekend).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- buildTripDays
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Implement**

Create `src/utils/buildTripDays.ts`:

```typescript
import type { TripDay, WeekStructure } from '../types'
import { isWeekend } from './calcWeekdayCounts'

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function dateOnly(str: string): Date {
  // Parse as local date to avoid UTC offset shifting the day
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function buildTripDays(
  arrivalDateStr: string,
  departureDateStr: string,
  arrivalScore: number,
  departureScore: number,
  weekStructure: WeekStructure
): TripDay[] {
  const arrival = dateOnly(arrivalDateStr)
  const departure = dateOnly(departureDateStr)
  const days: TripDay[] = []

  if (arrival.getTime() === departure.getTime()) {
    // Same-day trip: single entry, take max of arrival and departure scores
    days.push({
      date: arrival,
      type: 'arrival',
      isWeekend: isWeekend(arrival, weekStructure),
      usableValue: Math.max(arrivalScore, departureScore),
    })
    return days
  }

  // Arrival day
  days.push({
    date: arrival,
    type: 'arrival',
    isWeekend: isWeekend(arrival, weekStructure),
    usableValue: arrivalScore,
  })

  // Full days
  let current = addDays(arrival, 1)
  while (current.getTime() < departure.getTime()) {
    days.push({
      date: new Date(current),
      type: 'full',
      isWeekend: isWeekend(current, weekStructure),
      usableValue: 1,
    })
    current = addDays(current, 1)
  }

  // Departure day
  days.push({
    date: departure,
    type: 'departure',
    isWeekend: isWeekend(departure, weekStructure),
    usableValue: departureScore,
  })

  return days
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- buildTripDays
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/buildTripDays.ts tests/utils/buildTripDays.test.ts
git commit -m "feat: add buildTripDays utility"
```

---

## Task 9: calcTripResult orchestrator

**Files:**
- Create: `src/utils/calcTripResult.ts`
- Create: `tests/utils/calcTripResult.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/utils/calcTripResult.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- calcTripResult
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Implement**

Create `src/utils/calcTripResult.ts`:

```typescript
import type { FlightInputs, ScoringThresholds, TripResult, WeekStructure } from '../types'
import { calcNights } from './calcNights'
import { calcFullDays } from './calcFullDays'
import { calcArrivalScore } from './calcArrivalScore'
import { calcDepartureScore } from './calcDepartureScore'
import { calcWeekdayCounts } from './calcWeekdayCounts'
import { buildTripDays } from './buildTripDays'
import { getHebrewCalendarData } from './hebrewCalendar'
import { calcVacationDays } from './calcVacationDays'

export function calcTripResult(
  inputs: FlightInputs,
  thresholds: ScoringThresholds,
  weekStructure: WeekStructure
): TripResult {
  const arrivalScore = calcArrivalScore(inputs.outboundArrivalTime, thresholds)
  const departureScore = calcDepartureScore(inputs.returnDepartureTime, thresholds)
  const nights = calcNights(inputs.outboundArrivalDate, inputs.returnDepartureDate)
  const fullDays = calcFullDays(inputs.outboundArrivalDate, inputs.returnDepartureDate)

  const isSameDay = inputs.outboundArrivalDate === inputs.returnDepartureDate
  const travelDayValue = isSameDay
    ? Math.max(arrivalScore, departureScore)
    : arrivalScore + departureScore
  const usableDays = isSameDay ? travelDayValue : fullDays + travelDayValue

  const tripDays = buildTripDays(
    inputs.outboundArrivalDate,
    inputs.returnDepartureDate,
    arrivalScore,
    departureScore,
    weekStructure
  )

  // Always enrich with Hebrew calendar data
  const enrichedDays = tripDays.map(td => {
    const hData = getHebrewCalendarData(td.date)
    return {
      ...td,
      hebrewDate: hData.hebrewDate,
      holidayName: hData.holidayName ?? undefined,
      holidayTier: hData.holidayTier ?? undefined,
    }
  })

  const calendarDays = enrichedDays.length
  const allDates = enrichedDays.map(d => d.date)
  const { weekdays, weekendDays } = calcWeekdayCounts(allDates, weekStructure)
  const vacation = calcVacationDays(enrichedDays, weekStructure)

  return {
    usableDays: Math.round(usableDays * 100) / 100,
    fullDays,
    travelDayValue: Math.round(travelDayValue * 100) / 100,
    nights,
    calendarDays,
    weekdays,
    weekendDays,
    arrivalScore,
    departureScore,
    ...vacation,
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- calcTripResult
```

Expected: all tests PASS

- [ ] **Step 5: Run all tests to verify nothing broken**

```bash
npm test
```

Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/utils/calcTripResult.ts tests/utils/calcTripResult.test.ts
git commit -m "feat: add calcTripResult orchestrator"
```

---

## Task 10: hebrewCalendar utility

**Files:**
- Create: `src/utils/hebrewCalendar.ts`
- Create: `tests/utils/hebrewCalendar.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/utils/hebrewCalendar.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { getHebrewCalendarData } from '../../src/utils/hebrewCalendar'

describe('getHebrewCalendarData', () => {
  it('returns a Hebrew date string for any gregorian date', () => {
    const data = getHebrewCalendarData(new Date('2026-04-28'))
    expect(data.hebrewDate).toBeTruthy()
    expect(typeof data.hebrewDate).toBe('string')
  })

  it('returns null holidayName for a regular day', () => {
    // Apr 28 2026 is י׳ אייר, no major holiday
    const data = getHebrewCalendarData(new Date('2026-04-28'))
    expect(data.holidayName).toBeNull()
    expect(data.holidayTier).toBeNull()
  })

  it('returns full-day-off tier for Shabbat', () => {
    // May 2 2026 = Saturday = Shabbat
    const data = getHebrewCalendarData(new Date('2026-05-02'))
    expect(data.holidayName).toBe('Shabbat')
    expect(data.holidayTier).toBe('full-day-off')
  })

  it('returns workday tier for Lag BaOmer', () => {
    // Lag BaOmer 5786 = Apr 29 2026
    const data = getHebrewCalendarData(new Date('2026-04-29'))
    expect(data.holidayTier).toBe('workday')
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- hebrewCalendar
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Implement**

Create `src/utils/hebrewCalendar.ts`:

```typescript
import { HDate, HebrewCalendar, flags, Locale } from '@hebcal/core'
import type { HolidayTier } from '../types'

// Maps @hebcal/core event descriptions to holiday tiers per Israeli law/custom
const FULL_DAY_OFF_EVENTS = new Set([
  'Rosh Hashana 1',
  'Rosh Hashana 2',
  'Yom Kippur',
  'Sukkot I',
  "Shmini Atzeret",
  'Simchat Torah',
  'Pesach I',
  'Pesach VII',
  'Shavuot',
  'Independence Day',
  'Shabbat',
])

const HALF_DAY_EVENTS = new Set([
  'Erev Rosh Hashana',
  'Erev Yom Kippur',
  'Erev Sukkot',
  "Erev Shmini Atzeret",
  'Erev Pesach',
  'Erev Shavuot',
  'Yom HaZikaron', // IDF Memorial Day
])

function getHolidayTier(eventName: string): HolidayTier | null {
  if (FULL_DAY_OFF_EVENTS.has(eventName)) return 'full-day-off'
  if (HALF_DAY_EVENTS.has(eventName)) return 'half-day'
  // Workday-tier holidays: Chol HaMoed, Chanukah, Purim, etc.
  const workdayPatterns = ['Chol ha-Moed', 'Chanukah', 'Purim', 'Fast of Esther', 'Yom HaShoah', "Erev Yom HaZikaron", "Lag BaOmer"]
  if (workdayPatterns.some(p => eventName.includes(p))) return 'workday'
  return null
}

export interface HebrewDayData {
  hebrewDate: string
  holidayName: string | null
  holidayTier: HolidayTier | null
}

export function getHebrewCalendarData(date: Date): HebrewDayData {
  const hdate = new HDate(date)
  const hebrewDate = hdate.render('he')

  // Saturday = Shabbat
  if (date.getDay() === 6) {
    return { hebrewDate, holidayName: 'Shabbat', holidayTier: 'full-day-off' }
  }

  const events = HebrewCalendar.getHolidaysOnDate(hdate, true) ?? []
  // Israeli schedule: il=true filters to Israeli observance
  const ilEvents = HebrewCalendar.getHolidaysOnDate(hdate, true) ?? []

  for (const ev of ilEvents) {
    const name = ev.render('en')
    const tier = getHolidayTier(name)
    if (tier) return { hebrewDate, holidayName: name, holidayTier: tier }
  }

  // Return first event name even if no tier match (informational)
  if (ilEvents.length > 0) {
    return { hebrewDate, holidayName: ilEvents[0].render('en'), holidayTier: null }
  }

  return { hebrewDate, holidayName: null, holidayTier: null }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- hebrewCalendar
```

Expected: all tests PASS. If `render('he')` output differs, adjust the test to check `typeof data.hebrewDate === 'string'` only.

- [ ] **Step 5: Commit**

```bash
git add src/utils/hebrewCalendar.ts tests/utils/hebrewCalendar.test.ts
git commit -m "feat: add hebrewCalendar utility using @hebcal/core"
```

---

---

## Task 10b: calcVacationDays utility

**Files:**
- Create: `src/utils/calcVacationDays.ts`
- Create: `tests/utils/calcVacationDays.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/utils/calcVacationDays.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { calcVacationDays } from '../../src/utils/calcVacationDays'
import type { TripDay } from '../../src/types'

function makeDay(date: string, type: TripDay['type'], isWeekend: boolean, holidayTier?: TripDay['holidayTier'], holidayName?: string): TripDay {
  return {
    date: new Date(date),
    type,
    isWeekend,
    usableValue: type === 'full' ? 1 : 0.75,
    holidayTier,
    holidayName,
  }
}

describe('calcVacationDays', () => {
  it('returns weekday full days count when no holidays', () => {
    const days: TripDay[] = [
      makeDay('2026-04-28', 'arrival', false),
      makeDay('2026-04-29', 'full', false),   // weekday, no holiday
      makeDay('2026-04-30', 'full', false),   // weekday, no holiday
      makeDay('2026-05-01', 'full', false),   // weekday, no holiday
      makeDay('2026-05-02', 'full', true),    // weekend
      makeDay('2026-05-03', 'full', true),    // weekend
      makeDay('2026-05-04', 'departure', false),
    ]
    const result = calcVacationDays(days)
    expect(result.vacationDaysNeeded).toBe(3)  // 3 weekday full days
    expect(result.halfVacationDaysNeeded).toBe(0)
    expect(result.fullHolidaysOnWeekdays).toEqual([])
    expect(result.halfHolidaysOnWeekdays).toEqual([])
  })

  it('deducts full-day-off holidays on weekdays', () => {
    const days: TripDay[] = [
      makeDay('2026-04-28', 'arrival', false),
      makeDay('2026-04-29', 'full', false, 'full-day-off', 'Independence Day'),
      makeDay('2026-04-30', 'full', false),
      makeDay('2026-05-04', 'departure', false),
    ]
    const result = calcVacationDays(days)
    expect(result.vacationDaysNeeded).toBe(1)  // 2 weekday full days − 1 full holiday
    expect(result.fullHolidaysOnWeekdays).toEqual(['Independence Day'])
  })

  it('does not deduct full-day-off holidays on weekends', () => {
    const days: TripDay[] = [
      makeDay('2026-04-28', 'arrival', false),
      makeDay('2026-04-29', 'full', false),
      makeDay('2026-05-02', 'full', true, 'full-day-off', 'Shabbat'),  // weekend
      makeDay('2026-05-04', 'departure', false),
    ]
    const result = calcVacationDays(days)
    expect(result.vacationDaysNeeded).toBe(1)  // only 1 weekday full day
    expect(result.fullHolidaysOnWeekdays).toEqual([])
  })

  it('counts half-day holidays on weekdays', () => {
    const days: TripDay[] = [
      makeDay('2026-04-28', 'arrival', false),
      makeDay('2026-04-29', 'full', false, 'half-day', 'Erev Shavuot'),
      makeDay('2026-04-30', 'full', false),
      makeDay('2026-05-04', 'departure', false),
    ]
    const result = calcVacationDays(days)
    expect(result.vacationDaysNeeded).toBe(2)  // half-day does NOT deduct full vacation day
    expect(result.halfVacationDaysNeeded).toBe(1)
    expect(result.halfHolidaysOnWeekdays).toEqual(['Erev Shavuot'])
  })

  it('excludes arrival and departure days from calculation', () => {
    const days: TripDay[] = [
      makeDay('2026-04-28', 'arrival', false, 'full-day-off', 'Pesach I'),
      makeDay('2026-04-29', 'full', false),
      makeDay('2026-05-04', 'departure', false, 'half-day', 'Erev Shavuot'),
    ]
    const result = calcVacationDays(days)
    expect(result.vacationDaysNeeded).toBe(1)  // only 1 full weekday, arrival/departure excluded
    expect(result.halfVacationDaysNeeded).toBe(0)  // departure excluded
  })

  it('never returns negative vacation days', () => {
    const days: TripDay[] = [
      makeDay('2026-04-28', 'arrival', false),
      makeDay('2026-04-29', 'full', false, 'full-day-off', 'Independence Day'),
      makeDay('2026-04-30', 'full', false, 'full-day-off', 'Shavuot'),
      makeDay('2026-05-04', 'departure', false),
    ]
    const result = calcVacationDays(days)
    expect(result.vacationDaysNeeded).toBe(0)  // clamped at 0
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npm test -- calcVacationDays
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Implement**

Create `src/utils/calcVacationDays.ts`:

```typescript
import type { TripDay } from '../types'

interface VacationResult {
  vacationDaysNeeded: number
  halfVacationDaysNeeded: number
  fullHolidaysOnWeekdays: string[]
  halfHolidaysOnWeekdays: string[]
}

export function calcVacationDays(tripDays: TripDay[]): VacationResult {
  const fullDaysOnly = tripDays.filter(d => d.type === 'full' && !d.isWeekend)

  const fullHolidaysOnWeekdays: string[] = []
  const halfHolidaysOnWeekdays: string[] = []

  for (const day of fullDaysOnly) {
    if (day.holidayTier === 'full-day-off' && day.holidayName) {
      fullHolidaysOnWeekdays.push(day.holidayName)
    } else if (day.holidayTier === 'half-day' && day.holidayName) {
      halfHolidaysOnWeekdays.push(day.holidayName)
    }
  }

  const weekdayFullDays = fullDaysOnly.length
  const vacationDaysNeeded = Math.max(0, weekdayFullDays - fullHolidaysOnWeekdays.length)
  const halfVacationDaysNeeded = halfHolidaysOnWeekdays.length

  return {
    vacationDaysNeeded,
    halfVacationDaysNeeded,
    fullHolidaysOnWeekdays,
    halfHolidaysOnWeekdays,
  }
}
```

- [ ] **Step 4: Run tests — expect pass**

```bash
npm test -- calcVacationDays
```

Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/calcVacationDays.ts tests/utils/calcVacationDays.test.ts
git commit -m "feat: add calcVacationDays utility"
```

---

## Task 11: Global styles and App shell

**Files:**
- Modify: `src/App.css`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`
- Modify: `index.html`

- [ ] **Step 1: Set page title in index.html**

Replace `<title>Vite + React + TS</title>` in `index.html` with:

```html
<title>Trip Duration Calculator</title>
```

- [ ] **Step 2: Write global CSS**

Replace the full contents of `src/App.css` with:

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #0f1117;
  --bg-card: #1a1d27;
  --bg-input: #0f1117;
  --border: #2d3148;
  --border-accent: rgba(99, 179, 237, 0.3);
  --text: #e2e8f0;
  --text-muted: #718096;
  --text-dim: #4a5568;
  --color-arrival: #f6ad55;
  --color-full: #68d391;
  --color-weekend: #f6e05e;
  --color-departure: #fc8181;
  --color-accent: #63b3ed;
  --color-purple: #9f7aea;
  --radius-card: 16px;
  --radius-inner: 10px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  padding: 0 16px 80px;
  -webkit-font-smoothing: antialiased;
}

.app {
  max-width: 680px;
  margin: 0 auto;
}

/* Hero */
.hero {
  text-align: center;
  padding: 40px 0 28px;
}
.hero-emoji {
  font-size: 3.2rem;
  display: block;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 20px rgba(99, 179, 237, 0.4));
}
.hero h1 {
  font-size: clamp(1.5rem, 5vw, 2rem);
  font-weight: 800;
  background: linear-gradient(135deg, #63b3ed, #9f7aea, #f6ad55);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 6px;
}
.hero p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Cards */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 20px;
  margin-bottom: 14px;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.card-icon { font-size: 1.2rem; }
.card-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
}

/* Error */
.error-banner {
  background: rgba(252, 129, 129, 0.1);
  border: 1px solid rgba(252, 129, 129, 0.3);
  border-radius: var(--radius-inner);
  padding: 10px 14px;
  font-size: 0.82rem;
  color: var(--color-departure);
  margin-bottom: 14px;
}
```

- [ ] **Step 3: Write App.tsx shell**

Replace the full contents of `src/App.tsx` with:

```tsx
import { useState } from 'react'
import './App.css'
import type { FlightInputs, ScoringThresholds, WeekStructure } from './types'
import { DEFAULT_THRESHOLDS } from './types'
import FlightInputCard from './components/FlightInputCard'
import SettingsCard from './components/SettingsCard'
import ResultCard from './components/ResultCard'
import TripCalendarCard from './components/TripCalendarCard'
import { calcTripResult } from './utils/calcTripResult'

const EMPTY_INPUTS: FlightInputs = {
  outboundDepartureDate: '',
  outboundDepartureTime: '',
  outboundArrivalDate: '',
  outboundArrivalTime: '',
  returnDepartureDate: '',
  returnDepartureTime: '',
  returnArrivalDate: '',
  returnArrivalTime: '',
}

function validateInputs(inputs: FlightInputs): string | null {
  const allFilled = Object.values(inputs).every(v => v !== '')
  if (!allFilled) return null // not an error, just incomplete
  if (inputs.outboundArrivalDate > inputs.returnDepartureDate) {
    return 'Return departure must be on or after outbound arrival.'
  }
  if (
    inputs.outboundArrivalDate === inputs.returnDepartureDate &&
    inputs.outboundArrivalTime > inputs.returnDepartureTime
  ) {
    return 'Return departure time must be after outbound arrival time on the same day.'
  }
  return null
}

export default function App() {
  const [inputs, setInputs] = useState<FlightInputs>(EMPTY_INPUTS)
  const [weekStructure, setWeekStructure] = useState<WeekStructure>('israel')
  const [thresholds, setThresholds] = useState<ScoringThresholds>(DEFAULT_THRESHOLDS)

  const validationError = validateInputs(inputs)
  const isComplete = Object.values(inputs).every(v => v !== '')
  const result = isComplete && !validationError
    ? calcTripResult(inputs, thresholds, weekStructure)
    : null

  return (
    <div className="app">
      <div className="hero">
        <span className="hero-emoji">✈️</span>
        <h1>Trip Duration Calculator</h1>
        <p>Understand the real usable days of your trip</p>
      </div>

      {validationError && (
        <div className="error-banner">⚠️ {validationError}</div>
      )}

      <FlightInputCard inputs={inputs} onChange={setInputs} />
      <SettingsCard
        weekStructure={weekStructure}
        onWeekStructureChange={setWeekStructure}
        thresholds={thresholds}
        onThresholdsChange={setThresholds}
      />

      {result && (
        <>
          <ResultCard result={result} />
          <TripCalendarCard
            inputs={inputs}
            result={result}
            weekStructure={weekStructure}
            thresholds={thresholds}
          />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add index.html src/App.css src/App.tsx
git commit -m "feat: add App shell with global styles"
```

---

## Task 12: FlightInputCard component

**Files:**
- Create: `src/components/FlightInputCard.tsx`

- [ ] **Step 1: Create component**

Create `src/components/FlightInputCard.tsx`:

```tsx
import type { FlightInputs } from '../types'

interface Props {
  inputs: FlightInputs
  onChange: (inputs: FlightInputs) => void
}

interface LegConfig {
  label: string
  emoji: string
  dateKey: keyof FlightInputs
  timeKey: keyof FlightInputs
  affectsResult: boolean
}

const LEGS: LegConfig[] = [
  { label: 'Outbound Departure', emoji: '🛫', dateKey: 'outboundDepartureDate', timeKey: 'outboundDepartureTime', affectsResult: false },
  { label: 'Outbound Arrival',   emoji: '🛬', dateKey: 'outboundArrivalDate',   timeKey: 'outboundArrivalTime',   affectsResult: true  },
  { label: 'Return Departure',   emoji: '🛫', dateKey: 'returnDepartureDate',   timeKey: 'returnDepartureTime',   affectsResult: true  },
  { label: 'Return Arrival',     emoji: '🛬', dateKey: 'returnArrivalDate',     timeKey: 'returnArrivalTime',     affectsResult: false },
]

export default function FlightInputCard({ inputs, onChange }: Props) {
  function set(key: keyof FlightInputs, value: string) {
    onChange({ ...inputs, [key]: value })
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">🛫</span>
        <span className="card-title">Flight Details</span>
      </div>
      <div className="flight-grid">
        {LEGS.map(leg => (
          <div key={leg.label} className={`flight-leg${leg.affectsResult ? ' scoring' : ''}`}>
            <div className="leg-label">
              {leg.emoji} {leg.label}
              {leg.affectsResult && <span className="affects-badge">⏱ affects result</span>}
            </div>
            <input
              type="date"
              className="field-input"
              value={inputs[leg.dateKey]}
              onChange={e => set(leg.dateKey, e.target.value)}
            />
            <input
              type="time"
              className="field-input"
              value={inputs[leg.timeKey]}
              onChange={e => set(leg.timeKey, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add FlightInputCard styles to App.css**

Append to `src/App.css`:

```css
/* FlightInputCard */
.flight-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.flight-leg {
  background: #22253a;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.flight-leg.scoring {
  border-color: var(--border-accent);
  background: rgba(99, 179, 237, 0.04);
}
.leg-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.affects-badge {
  background: rgba(99, 179, 237, 0.18);
  color: var(--color-accent);
  font-size: 0.58rem;
  padding: 1px 5px;
  border-radius: 4px;
  font-weight: 600;
}
.field-input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 7px;
  padding: 7px 9px;
  font-size: 0.82rem;
  color: var(--text);
  outline: none;
  font-family: inherit;
}
.field-input:focus {
  border-color: var(--color-accent);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/FlightInputCard.tsx src/App.css
git commit -m "feat: add FlightInputCard component"
```

---

## Task 13: SettingsCard component

**Files:**
- Create: `src/components/SettingsCard.tsx`

- [ ] **Step 1: Create component**

Create `src/components/SettingsCard.tsx`:

```tsx
import { useState } from 'react'
import type { ScoringThresholds, WeekStructure } from '../types'

interface Props {
  weekStructure: WeekStructure
  onWeekStructureChange: (w: WeekStructure) => void
  thresholds: ScoringThresholds
  onThresholdsChange: (t: ScoringThresholds) => void
}

export default function SettingsCard({ weekStructure, onWeekStructureChange, thresholds, onThresholdsChange }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  function setThreshold(key: keyof ScoringThresholds, value: string | number) {
    onThresholdsChange({ ...thresholds, [key]: value })
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">⚙️</span>
        <span className="card-title">Settings</span>
      </div>

      <div className="week-toggle">
        <button
          className={`toggle-btn${weekStructure === 'israel' ? ' active' : ''}`}
          onClick={() => onWeekStructureChange('israel')}
        >
          🇮🇱 Israel <span className="toggle-sub">Fri–Sat weekend</span>
        </button>
        <button
          className={`toggle-btn${weekStructure === 'international' ? ' active' : ''}`}
          onClick={() => onWeekStructureChange('international')}
        >
          🌍 International <span className="toggle-sub">Sat–Sun weekend</span>
        </button>
      </div>

      <button className="advanced-toggle" onClick={() => setShowAdvanced(s => !s)}>
        {showAdvanced ? '▴' : '▾'} Advanced scoring thresholds
      </button>

      {showAdvanced && (
        <div className="advanced-panel">
          <div className="advanced-section-label">Arrival day score</div>
          <div className="threshold-row">
            <span>Before</span>
            <input type="time" className="field-input threshold-input" value={thresholds.arrivalEarly} onChange={e => setThreshold('arrivalEarly', e.target.value)} />
            <span>→</span>
            <input type="number" className="field-input threshold-input" step="0.25" min="0" max="1" value={thresholds.arrivalEarlyScore} onChange={e => setThreshold('arrivalEarlyScore', parseFloat(e.target.value))} />
          </div>
          <div className="threshold-row">
            <span>Before</span>
            <input type="time" className="field-input threshold-input" value={thresholds.arrivalMid} onChange={e => setThreshold('arrivalMid', e.target.value)} />
            <span>→</span>
            <input type="number" className="field-input threshold-input" step="0.25" min="0" max="1" value={thresholds.arrivalMidScore} onChange={e => setThreshold('arrivalMidScore', parseFloat(e.target.value))} />
          </div>
          <div className="threshold-row">
            <span>After →</span>
            <input type="number" className="field-input threshold-input" step="0.25" min="0" max="1" value={thresholds.arrivalLateScore} onChange={e => setThreshold('arrivalLateScore', parseFloat(e.target.value))} />
          </div>

          <div className="advanced-section-label" style={{ marginTop: 12 }}>Departure day score</div>
          <div className="threshold-row">
            <span>Before</span>
            <input type="time" className="field-input threshold-input" value={thresholds.departureEarly} onChange={e => setThreshold('departureEarly', e.target.value)} />
            <span>→</span>
            <input type="number" className="field-input threshold-input" step="0.25" min="0" max="1" value={thresholds.departureEarlyScore} onChange={e => setThreshold('departureEarlyScore', parseFloat(e.target.value))} />
          </div>
          <div className="threshold-row">
            <span>Before</span>
            <input type="time" className="field-input threshold-input" value={thresholds.departureLate} onChange={e => setThreshold('departureLate', e.target.value)} />
            <span>→</span>
            <input type="number" className="field-input threshold-input" step="0.25" min="0" max="1" value={thresholds.departureMidScore} onChange={e => setThreshold('departureMidScore', parseFloat(e.target.value))} />
          </div>
          <div className="threshold-row">
            <span>After →</span>
            <input type="number" className="field-input threshold-input" step="0.25" min="0" max="1" value={thresholds.departureLateScore} onChange={e => setThreshold('departureLateScore', parseFloat(e.target.value))} />
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add SettingsCard styles to App.css**

Append to `src/App.css`:

```css
/* SettingsCard */
.week-toggle {
  display: flex;
  background: var(--bg-input);
  border-radius: 10px;
  padding: 3px;
  gap: 3px;
}
.toggle-btn {
  flex: 1;
  padding: 9px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--text-muted);
  transition: all 0.2s;
}
.toggle-btn.active {
  background: linear-gradient(135deg, #4299e1, #9f7aea);
  color: white;
}
.toggle-sub {
  font-size: 0.7em;
  font-weight: 400;
  opacity: 0.8;
}
.advanced-toggle {
  width: 100%;
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 0.76rem;
  cursor: pointer;
  margin-top: 10px;
  text-align: center;
  padding: 4px;
  font-family: inherit;
}
.advanced-panel {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}
.advanced-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.threshold-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 0.78rem;
  color: var(--text-muted);
}
.threshold-input {
  width: 80px !important;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SettingsCard.tsx src/App.css
git commit -m "feat: add SettingsCard component"
```

---

## Task 14: ResultCard component

**Files:**
- Create: `src/components/ResultCard.tsx`

- [ ] **Step 1: Create component**

Create `src/components/ResultCard.tsx`:

```tsx
import type { TripResult } from '../types'
import { formatBreakdown } from '../utils/formatBreakdown'

interface Props {
  result: TripResult
}

const STATS = [
  { key: 'fullDays',       emoji: '☀️',  label: 'Full days'     },
  { key: 'travelDayValue', emoji: '✈️',  label: 'Travel value'  },
  { key: 'nights',         emoji: '🌙',  label: 'Nights'        },
  { key: 'calendarDays',   emoji: '📅',  label: 'Calendar days' },
  { key: 'weekdays',       emoji: '💼',  label: 'Weekdays'      },
  { key: 'weekendDays',    emoji: '🏖️', label: 'Weekend days'  },
] as const

export default function ResultCard({ result }: Props) {
  const breakdown = formatBreakdown(result.fullDays, result.travelDayValue)

  const fullFormula = result.fullHolidaysOnWeekdays.length > 0
    ? `${result.weekdays} weekdays − ${result.fullHolidaysOnWeekdays.length} full holiday (${result.fullHolidaysOnWeekdays.join(', ')})`
    : `${result.weekdays} weekdays, no public holidays`

  const halfFormula = result.halfHolidaysOnWeekdays.length > 0
    ? `${result.halfHolidaysOnWeekdays.length} Erev holiday on weekday (${result.halfHolidaysOnWeekdays.join(', ')})`
    : 'No half-day holidays on weekdays'

  return (
    <div className="result-card">
      <div className="result-headline">
        <span className="result-emoji">🗓️</span>
        <div className="result-big">{result.usableDays}</div>
        <div className="result-unit">usable days</div>
      </div>
      <div className="result-breakdown">
        {breakdown.split('+').map((part, i) => (
          <span key={i}>{i > 0 && <span> + </span>}<strong>{part.trim()}</strong></span>
        ))}
      </div>
      <div className="stats-grid">
        {STATS.map(s => (
          <div key={s.key} className="stat">
            <div className="stat-emoji">{s.emoji}</div>
            <div className="stat-value">{result[s.key]}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="vacation-section">
        <div className="vacation-title">🗂️ Work vacation required</div>
        <div className="vacation-rows">
          <div className="vrow full">
            <div className="vrow-left">
              <div className="vrow-label">🏝️ Vacation days needed</div>
              <div className="vrow-formula">{fullFormula}</div>
            </div>
            <div className="vrow-value">{result.vacationDaysNeeded}</div>
          </div>
          <div className="vrow half">
            <div className="vrow-left">
              <div className="vrow-label">🌅 Half-day vacations needed</div>
              <div className="vrow-formula">{halfFormula}</div>
            </div>
            <div className="vrow-value">{result.halfVacationDaysNeeded}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add ResultCard styles to App.css**

Append to `src/App.css`:

```css
/* ResultCard */
.result-card {
  background: linear-gradient(135deg, #1a2744, #1e1a38);
  border: 1px solid var(--border-accent);
  border-radius: var(--radius-card);
  padding: 22px;
  margin-bottom: 14px;
  position: relative;
  overflow: hidden;
}
.result-card::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 160px; height: 160px;
  background: radial-gradient(circle, rgba(99,179,237,0.14), transparent 70%);
  pointer-events: none;
}
.result-headline {
  text-align: center;
  margin-bottom: 16px;
}
.result-emoji { font-size: 2.2rem; display: block; margin-bottom: 6px; }
.result-big {
  font-size: clamp(2.2rem, 8vw, 3rem);
  font-weight: 900;
  background: linear-gradient(135deg, #63b3ed, #9f7aea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
.result-unit { color: var(--text-muted); font-size: 0.85rem; margin-top: 4px; }
.result-breakdown {
  background: rgba(255,255,255,0.05);
  border-radius: var(--radius-inner);
  padding: 10px 14px;
  text-align: center;
  font-size: 0.88rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}
.result-breakdown strong { color: var(--color-accent); }
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.stat {
  background: rgba(255,255,255,0.05);
  border-radius: var(--radius-inner);
  padding: 10px 6px;
  text-align: center;
}
.stat-emoji { font-size: 1rem; margin-bottom: 2px; }
.stat-value { font-size: 1.4rem; font-weight: 800; line-height: 1; margin-bottom: 3px; }
.stat-label { font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }

/* Vacation section */
.vacation-section {
  border-top: 1px solid rgba(255,255,255,0.08);
  padding-top: 14px;
  margin-top: 10px;
}
.vacation-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.vacation-rows { display: flex; flex-direction: column; gap: 7px; }
.vrow {
  background: rgba(255,255,255,0.04);
  border-radius: 9px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.vrow.full { border-left: 3px solid var(--color-departure); }
.vrow.half { border-left: 3px solid var(--color-weekend); }
.vrow-left { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.vrow-label { font-size: 0.78rem; font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 5px; }
.vrow-formula { font-size: 0.62rem; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vrow-value { font-size: 1.6rem; font-weight: 900; flex-shrink: 0; }
.vrow.full .vrow-value { color: var(--color-departure); }
.vrow.half .vrow-value { color: var(--color-weekend); }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ResultCard.tsx src/App.css
git commit -m "feat: add ResultCard component"
```

---

## Task 15: CalendarCell and CalendarMonth components

**Files:**
- Create: `src/components/CalendarCell.tsx`
- Create: `src/components/CalendarMonth.tsx`

- [ ] **Step 1: Create CalendarCell**

Create `src/components/CalendarCell.tsx`:

```tsx
import type { TripDay } from '../types'

interface Props {
  day: TripDay | null
  dayNumber: number | null
}

const TYPE_CLASS: Record<string, string> = {
  arrival: 'arrival',
  full: 'full-day',
  departure: 'departure',
}

const TIER_LABEL: Record<string, string> = {
  'full-day-off': 'Day off',
  'half-day': 'Half day',
  'workday': 'Workday',
}

const TIER_CLASS: Record<string, string> = {
  'full-day-off': 'tier-off',
  'half-day': 'tier-half',
  'workday': 'tier-work',
}

export default function CalendarCell({ day, dayNumber }: Props) {
  if (!dayNumber) return <div className="cal-cell" />

  if (!day) {
    return <div className="cal-cell faded"><span className="cal-num">{dayNumber}</span></div>
  }

  const typeClass = day.type === 'full' && day.isWeekend ? 'weekend-day' : TYPE_CLASS[day.type]

  return (
    <div className={`cal-cell ${typeClass}`}>
      <span className="cal-num">{dayNumber}</span>
      <span className="cal-value">
        {day.type === 'arrival' ? '🛬 ' : day.type === 'departure' ? '✈️ ' : ''}
        {day.usableValue.toString()}
      </span>
      {day.hebrewDate && (
        <span className="cal-heb">{day.hebrewDate}</span>
      )}
      {day.holidayTier && (
        <span className={`cal-tier ${TIER_CLASS[day.holidayTier]}`}>
          {TIER_LABEL[day.holidayTier]}
        </span>
      )}
      {day.holidayName && (
        <span className="cal-holiday">{day.holidayName}</span>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create CalendarMonth**

Create `src/components/CalendarMonth.tsx`:

```tsx
import type { TripDay, WeekStructure } from '../types'
import CalendarCell from './CalendarCell'

interface Props {
  year: number
  month: number  // 0-indexed
  tripDays: TripDay[]
  weekStructure: WeekStructure
}

const DOW_ISRAEL   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DOW_INTL     = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKEND_ISRAEL = new Set([5, 6])    // Fri, Sat (index in DOW_ISRAEL)
const WEEKEND_INTL   = new Set([5, 6])    // Sat, Sun (index in DOW_INTL)

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay() // 0=Sun
}

export default function CalendarMonth({ year, month, tripDays, weekStructure }: Props) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfMonth(year, month) // 0=Sun

  // Build a map of day-of-month → TripDay
  const tripDayMap = new Map<number, TripDay>()
  for (const td of tripDays) {
    if (td.date.getFullYear() === year && td.date.getMonth() === month) {
      tripDayMap.set(td.date.getDate(), td)
    }
  }

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']

  // Build grid cells
  // Israel mode: week starts Sunday (dow 0). International: week starts Monday (dow 1).
  const startOffset = weekStructure === 'israel' ? firstDow : (firstDow === 0 ? 6 : firstDow - 1)
  const headers = weekStructure === 'israel' ? DOW_ISRAEL : DOW_INTL
  const weekendIndices = weekStructure === 'israel' ? WEEKEND_ISRAEL : WEEKEND_INTL

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="cal-section">
      <div className="cal-month-header">📅 {monthNames[month]} {year}</div>
      <div className="cal-grid">
        {headers.map((h, i) => (
          <div key={h} className={`cal-dow ${weekendIndices.has(i) ? 'weekend' : 'weekday'}`}>{h}</div>
        ))}
        {cells.map((dayNum, i) => (
          <CalendarCell
            key={i}
            day={dayNum ? (tripDayMap.get(dayNum) ?? null) : null}
            dayNumber={dayNum}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add calendar styles to App.css**

Append to `src/App.css`:

```css
/* Calendar */
.cal-section { margin-bottom: 18px; }
.cal-month-header {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 6px;
}
.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
  text-align: center;
}
.cal-dow {
  font-size: 0.6rem;
  padding: 3px 2px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.cal-dow.weekend { color: var(--color-weekend); }
.cal-dow.weekday { color: var(--text-dim); }
.cal-cell {
  border-radius: 7px;
  padding: 4px 2px 5px;
  min-height: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 1px;
}
.cal-cell.faded { opacity: 0.12; }
.cal-cell.arrival  { background: rgba(246,173,85,0.17);  border: 1px solid rgba(246,173,85,0.44); }
.cal-cell.full-day { background: rgba(104,211,145,0.1);  border: 1px solid rgba(104,211,145,0.27); }
.cal-cell.weekend-day { background: rgba(246,224,94,0.09); border: 1px solid rgba(246,224,94,0.3); }
.cal-cell.departure  { background: rgba(252,129,129,0.12); border: 1px solid rgba(252,129,129,0.37); }
.cal-num { font-size: 0.8rem; font-weight: 700; }
.cal-cell.arrival    .cal-num { color: var(--color-arrival); }
.cal-cell.weekend-day .cal-num { color: var(--color-weekend); }
.cal-cell.departure  .cal-num { color: var(--color-departure); }
.cal-value { font-size: 0.58rem; font-weight: 600; opacity: 0.85; }
.cal-cell.arrival     .cal-value { color: var(--color-arrival); }
.cal-cell.full-day    .cal-value { color: var(--color-full); }
.cal-cell.weekend-day .cal-value { color: var(--color-weekend); }
.cal-cell.departure   .cal-value { color: var(--color-departure); }
.cal-heb { font-size: 0.5rem; color: var(--text-dim); }
.cal-tier {
  font-size: 0.5rem;
  border-radius: 3px;
  padding: 1px 3px;
  font-weight: 700;
  white-space: nowrap;
}
.cal-tier.tier-off  { background: rgba(104,211,145,0.25); color: var(--color-full); }
.cal-tier.tier-half { background: rgba(246,224,94,0.2);   color: var(--color-weekend); }
.cal-tier.tier-work { background: rgba(160,174,192,0.15); color: var(--text-muted); }
.cal-holiday {
  font-size: 0.5rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 52px;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/CalendarCell.tsx src/components/CalendarMonth.tsx src/App.css
git commit -m "feat: add CalendarCell and CalendarMonth components"
```

---

## Task 16: TripCalendarCard component

**Files:**
- Create: `src/components/TripCalendarCard.tsx`

- [ ] **Step 1: Create component**

Create `src/components/TripCalendarCard.tsx`:

```tsx
import type { FlightInputs, TripResult, ScoringThresholds, WeekStructure } from '../types'
import { buildTripDays } from '../utils/buildTripDays'
import { getHebrewCalendarData } from '../utils/hebrewCalendar'
import CalendarMonth from './CalendarMonth'

interface Props {
  inputs: FlightInputs
  result: TripResult
  weekStructure: WeekStructure
  thresholds: ScoringThresholds
}

export default function TripCalendarCard({
  inputs, result, weekStructure
}: Props) {
  const tripDays = buildTripDays(
    inputs.outboundArrivalDate,
    inputs.returnDepartureDate,
    result.arrivalScore,
    result.departureScore,
    weekStructure
  )

  // Always enrich with Hebrew data
  const enrichedDays = tripDays.map(td => {
    const hData = getHebrewCalendarData(td.date)
    return { ...td, hebrewDate: hData.hebrewDate, holidayName: hData.holidayName ?? undefined, holidayTier: hData.holidayTier ?? undefined }
  })

  // Determine unique months to render
  const months: Array<{ year: number; month: number }> = []
  for (const td of enrichedDays) {
    const y = td.date.getFullYear()
    const m = td.date.getMonth()
    if (!months.find(x => x.year === y && x.month === m)) {
      months.push({ year: y, month: m })
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-icon">🗺️</span>
        <span className="card-title">Trip Calendar</span>
      </div>

      <div className="cal-legend">
        <span className="legend-item"><span className="legend-dot arrival-dot" /> Arrival</span>
        <span className="legend-item"><span className="legend-dot full-dot" /> Full day</span>
        <span className="legend-item"><span className="legend-dot weekend-dot" /> Weekend</span>
        <span className="legend-item"><span className="legend-dot departure-dot" /> Departure</span>
        <span className="legend-tier tier-off">Day off</span>
        <span className="legend-tier tier-half">Half day</span>
        <span className="legend-tier tier-work">Workday</span>
      </div>

      {months.map(({ year, month }) => (
        <CalendarMonth
          key={`${year}-${month}`}
          year={year}
          month={month}
          tripDays={enrichedDays}
          weekStructure={weekStructure}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add TripCalendarCard styles to App.css**

Append to `src/App.css`:

```css
/* TripCalendarCard */
.cal-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
  align-items: center;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: var(--text-muted);
}
.legend-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.arrival-dot  { background: var(--color-arrival); }
.full-dot     { background: var(--color-full); }
.weekend-dot  { background: var(--color-weekend); }
.departure-dot { background: var(--color-departure); }
.legend-tier {
  font-size: 0.62rem;
  border-radius: 3px;
  padding: 1px 5px;
  font-weight: 700;
}
.legend-tier.tier-off  { background: rgba(104,211,145,0.25); color: var(--color-full); }
.legend-tier.tier-half { background: rgba(246,224,94,0.2);   color: var(--color-weekend); }
.legend-tier.tier-work { background: rgba(160,174,192,0.15); color: var(--text-muted); }
.heb-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
}
.heb-toggle-label {
  font-size: 0.82rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}
.pill-toggle {
  width: 40px; height: 22px;
  border-radius: 11px;
  border: none;
  cursor: pointer;
  background: var(--border);
  position: relative;
  transition: background 0.2s;
}
.pill-toggle::after {
  content: '';
  position: absolute;
  left: 3px; top: 3px;
  width: 16px; height: 16px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
}
.pill-toggle.on {
  background: linear-gradient(135deg, #4299e1, #9f7aea);
}
.pill-toggle.on::after {
  transform: translateX(18px);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TripCalendarCard.tsx src/App.css
git commit -m "feat: add TripCalendarCard component"
```

---

## Task 17: Mobile responsive polish + .gitignore

**Files:**
- Modify: `src/App.css`
- Create: `.gitignore`

- [ ] **Step 1: Add mobile breakpoints to App.css**

Append to `src/App.css`:

```css
/* Mobile responsiveness */
@media (max-width: 480px) {
  body { padding: 0 10px 80px; }
  .hero { padding: 24px 0 18px; }
  .hero-emoji { font-size: 2.4rem; }
  .card { padding: 14px; border-radius: 12px; }
  .flight-grid { gap: 7px; }
  .flight-leg { padding: 10px; }
  .leg-label { font-size: 0.58rem; }
  .affects-badge { font-size: 0.52rem; }
  .field-input { font-size: 0.76rem; padding: 6px 8px; }
  .stats-grid { gap: 6px; }
  .stat { padding: 8px 4px; }
  .stat-value { font-size: 1.1rem; }
  .stat-label { font-size: 0.55rem; }
  .cal-cell { min-height: 46px; }
  .cal-num { font-size: 0.72rem; }
  .cal-value { font-size: 0.52rem; }
  .cal-heb { font-size: 0.45rem; }
  .cal-tier { font-size: 0.44rem; }
  .cal-holiday { font-size: 0.44rem; max-width: 38px; }
  .toggle-btn { font-size: 0.72rem; }
  .toggle-sub { display: none; }
}
```

- [ ] **Step 2: Ensure .gitignore covers generated files**

Check if `.gitignore` exists:

```bash
cat .gitignore
```

If it doesn't contain `.superpowers`, append:

```bash
echo ".superpowers/" >> .gitignore
```

- [ ] **Step 3: Run the app and verify on mobile viewport**

```bash
npm run dev
```

Open http://localhost:5173 in browser. Open DevTools → Toggle device toolbar → Select iPhone 14 Pro (390px). Scroll through all cards. Verify nothing overflows.

- [ ] **Step 4: Commit**

```bash
git add src/App.css .gitignore
git commit -m "feat: add mobile responsive styles"
```

---

## Task 18: Wire everything together and smoke test

**Files:**
- No new files — verify the full app works end-to-end

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: all tests PASS

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

Open http://localhost:5173

- [ ] **Step 3: Enter a test trip**

Fill in these values:
- Outbound departure: 2026-04-28, 08:00
- Outbound arrival: 2026-04-28, 09:30
- Return departure: 2026-05-04, 16:00
- Return arrival: 2026-05-05, 01:00

Expected results:
- Total usable days: **6.25**
- Full days: **5**
- Travel-day value: **1.25**
- Nights: **6**
- Calendar days: **7**
- Calendar shows April and May grids with Apr 28 in orange, May 4 in red, days in between in green/gold

- [ ] **Step 4: Verify Hebrew calendar always shows**

Confirm Hebrew dates and holiday names appear in calendar cells without any toggle — they should always be visible.

- [ ] **Step 5: Test validation**

Set return departure to 2026-04-27 (before outbound arrival 2026-04-28). Verify red error banner appears: "Return departure must be on or after outbound arrival."

- [ ] **Step 6: Test same-day trip**

Set all four dates to 2026-04-28. Arrival time 09:30, return departure 16:00.
Expected: 0 full days, 0 nights, usable days = 0.75 (max of 0.75 arrival score and 0.5 departure score).

- [ ] **Step 7: Test week structure toggle**

Switch to "🌍 International". Verify weekend highlighting shifts from Fri/Sat to Sat/Sun in the calendar grid.

- [ ] **Step 8: Test vacation days section**

Using the test trip (Apr 28 → May 4), verify the "Work vacation required" section shows:
- Vacation days needed: some number ≥ 0
- Half-day vacations: some number ≥ 0
- Formula text visible under each row explaining the calculation

Switch week structure to International and verify weekday counts and vacation days update accordingly.

- [ ] **Step 9: Final commit**

```bash
git add -A
git commit -m "feat: trip duration calculator complete — all smoke tests pass"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered by |
|---|---|
| 4 flight datetime inputs | Task 12 FlightInputCard |
| "⏱ affects result" badge | Task 12 leg-label |
| Week structure toggle (Israel/International) | Task 13 SettingsCard |
| Configurable scoring thresholds | Task 13 advanced panel |
| calcNights | Task 3 |
| calcFullDays | Task 4 |
| calcArrivalScore | Task 5 |
| calcDepartureScore | Task 5 |
| calcWeekdayCounts | Task 6 |
| buildTripDays | Task 8 |
| formatBreakdown | Task 7 |
| calcTripResult orchestrator | Task 9 |
| Same-day trip: max(arrival, departure) | Task 9 calcTripResult |
| Validation: return ≥ arrival | Task 11 App.tsx validateInputs |
| Result card: usable days + breakdown + 6-stat grid | Task 14 |
| Calendar: 7-col week-aligned grid | Task 15 CalendarMonth |
| Cross-month: two stacked grids | Task 16 TripCalendarCard (months array) |
| Color coding per day type | Task 15 CalendarCell |
| Hebrew calendar always on (no toggle) | Task 10 + Task 16 (always enriched) |
| Vacation days needed (weekdays − full holidays) | Task 10b calcVacationDays |
| Half-day vacations needed | Task 10b calcVacationDays |
| Vacation section in result card (Option B rows) | Task 14 ResultCard |
| Hebrew date string per day | Task 10 getHebrewCalendarData |
| Holiday name per day | Task 10 |
| Holiday tier pill (Day off/Half day/Workday) | Task 15 CalendarCell + Task 10 |
| Israeli holiday schedule | Task 10 (il=true in HebrewCalendar) |
| Mobile-first responsive | Task 17 |
| Dark theme, gradient hero | Task 11 App.css |
| Auto-calculate on input change | Task 11 App.tsx (no submit button) |

All spec requirements covered. No gaps found.
