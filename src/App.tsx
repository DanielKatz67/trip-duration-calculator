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
