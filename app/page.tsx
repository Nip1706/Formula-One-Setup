'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Setup = {
  id: string
  title: string
  track: string
  car: string
  created_at: string
  profiles: { username: string }
}

export default function Home() {
  const [setups, setSetups] = useState<Setup[]>([])
  const [track, setTrack] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      setLoading(true)
      let query = supabase
        .from('setups')
        .select('id, title, track, car, created_at, profiles(username)')
        .order('created_at', { ascending: false })

      if (track) query = query.ilike('track', `%${track}%`)

      const { data } = await query
      setSetups((data as unknown as Setup[]) ?? [])
      setLoading(false)
    }
    load()
  }, [track])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Setups</h1>
        <input
          type="text"
          placeholder="Filter by track..."
          value={track}
          onChange={(e) => setTrack(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
        />
      </div>

      {loading ? (
        <p className="text-zinc-500">Loading...</p>
      ) : setups.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <p className="text-lg mb-2">No setups yet.</p>
          <Link href="/setups/new" className="text-red-500 hover:underline">
            Create your first setup!
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {setups.map((s) => (
            <Link
              key={s.id}
              href={`/setups/${s.id}`}
              className="block bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-red-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <h2 className="font-semibold text-white">{s.title}</h2>
                <span className="text-xs text-zinc-500">
                  {new Date(s.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mt-1">{s.track}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                  {s.car}
                </span>
                <span className="text-xs text-zinc-500">by {s.profiles?.username}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
