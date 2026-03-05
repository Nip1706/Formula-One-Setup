'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const F1_TRACKS = [
  'Bahrain', 'Saudi Arabia', 'Australia', 'Japan', 'China', 'Miami',
  'Emilia Romagna', 'Monaco', 'Canada', 'Spain', 'Austria', 'Great Britain',
  'Hungary', 'Belgium', 'Netherlands', 'Italy', 'Azerbaijan', 'Singapore',
  'United States', 'Mexico', 'Brazil', 'Las Vegas', 'Qatar', 'Abu Dhabi',
]

const F1_CARS = [
  'Red Bull RB20', 'Ferrari SF-24', 'Mercedes W15', 'McLaren MCL38',
  'Aston Martin AMR24', 'Alpine A524', 'Williams FW46', 'RB VCARB 01',
  'Haas VF-24', 'Kick Sauber C44',
]

type FieldConfig = { label: string; key: string; min: number; max: number; step?: number }

const AERO: FieldConfig[] = [
  { label: 'Front Wing', key: 'front_wing', min: 1, max: 50 },
  { label: 'Rear Wing', key: 'rear_wing', min: 1, max: 50 },
]
const TRANSMISSION: FieldConfig[] = [
  { label: 'On Throttle %', key: 'on_throttle', min: 50, max: 100 },
  { label: 'Off Throttle %', key: 'off_throttle', min: 50, max: 100 },
]
const GEOMETRY: FieldConfig[] = [
  { label: 'Front Camber', key: 'front_camber', min: -3.5, max: -2.5, step: 0.1 },
  { label: 'Rear Camber', key: 'rear_camber', min: -2.0, max: -1.0, step: 0.1 },
  { label: 'Front Toe', key: 'front_toe', min: 0.05, max: 0.15, step: 0.01 },
  { label: 'Rear Toe', key: 'rear_toe', min: 0.2, max: 0.5, step: 0.01 },
]
const SUSPENSION: FieldConfig[] = [
  { label: 'Front Suspension', key: 'front_suspension', min: 1, max: 10 },
  { label: 'Rear Suspension', key: 'rear_suspension', min: 1, max: 10 },
  { label: 'Front Anti-Roll Bar', key: 'front_anti_roll_bar', min: 1, max: 10 },
  { label: 'Rear Anti-Roll Bar', key: 'rear_anti_roll_bar', min: 1, max: 10 },
  { label: 'Front Ride Height', key: 'front_ride_height', min: 1, max: 10 },
  { label: 'Rear Ride Height', key: 'rear_ride_height', min: 1, max: 10 },
]
const BRAKES: FieldConfig[] = [
  { label: 'Brake Pressure %', key: 'brake_pressure', min: 80, max: 100 },
  { label: 'Brake Bias %', key: 'brake_bias', min: 50, max: 70 },
]
const TYRES: FieldConfig[] = [
  { label: 'Front Left (PSI)', key: 'front_left_tyre_pressure', min: 21.0, max: 25.0, step: 0.1 },
  { label: 'Front Right (PSI)', key: 'front_right_tyre_pressure', min: 21.0, max: 25.0, step: 0.1 },
  { label: 'Rear Left (PSI)', key: 'rear_left_tyre_pressure', min: 21.0, max: 25.0, step: 0.1 },
  { label: 'Rear Right (PSI)', key: 'rear_right_tyre_pressure', min: 21.0, max: 25.0, step: 0.1 },
]

export default function NewSetupPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [track, setTrack] = useState(F1_TRACKS[0])
  const [car, setCar] = useState(F1_CARS[0])
  const [notes, setNotes] = useState('')
  const [values, setValues] = useState<Record<string, number>>({
    front_wing: 25, rear_wing: 25, on_throttle: 75, off_throttle: 75,
    front_camber: -3.0, rear_camber: -1.5, front_toe: 0.10, rear_toe: 0.35,
    front_suspension: 5, rear_suspension: 5, front_anti_roll_bar: 5,
    rear_anti_roll_bar: 5, front_ride_height: 5, rear_ride_height: 5,
    brake_pressure: 90, brake_bias: 58,
    front_left_tyre_pressure: 23.0, front_right_tyre_pressure: 23.0,
    rear_left_tyre_pressure: 22.0, rear_right_tyre_pressure: 22.0,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth')
      else setUserId(data.user.id)
    })
  }, [])

  function set(key: string, val: number) {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setError('')
    setLoading(true)

    const { data, error } = await supabase
      .from('setups')
      .insert({ ...values, title, track, car, notes, user_id: userId })
      .select('id')
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/setups/${data.id}`)
    }
  }

  function renderFields(fields: FieldConfig[]) {
    return fields.map(({ label, key, min, max, step = 1 }) => (
      <div key={key} className="flex items-center justify-between gap-4">
        <label className="text-sm text-zinc-400 w-40">{label}</label>
        <div className="flex items-center gap-3 flex-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={values[key]}
            onChange={(e) => set(key, parseFloat(e.target.value))}
            className="flex-1 accent-red-500"
          />
          <span className="text-sm font-mono w-12 text-right text-white">
            {values[key]}
          </span>
        </div>
      </div>
    ))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New Setup</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Setup title (e.g. Monaco Quali Setup)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
          <div className="flex gap-3">
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
            >
              {F1_TRACKS.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select
              value={car}
              onChange={(e) => setCar(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white focus:outline-none focus:border-red-500"
            >
              {F1_CARS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {[
          { title: 'Aerodynamics', fields: AERO },
          { title: 'Transmission', fields: TRANSMISSION },
          { title: 'Suspension Geometry', fields: GEOMETRY },
          { title: 'Suspension', fields: SUSPENSION },
          { title: 'Brakes', fields: BRAKES },
          { title: 'Tyre Pressures', fields: TYRES },
        ].map(({ title: sectionTitle, fields }) => (
          <div key={sectionTitle} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">{sectionTitle}</h2>
            {renderFields(fields)}
          </div>
        ))}

        <textarea
          placeholder="Notes (optional) — lap times, conditions, tips..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 rounded transition-colors"
        >
          {loading ? 'Saving...' : 'Publish Setup'}
        </button>
      </form>
    </div>
  )
}
