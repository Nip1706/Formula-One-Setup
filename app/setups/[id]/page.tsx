'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

type Setup = {
  id: string; title: string; track: string; car: string; notes: string; created_at: string
  front_wing: number; rear_wing: number; on_throttle: number; off_throttle: number
  front_camber: number; rear_camber: number; front_toe: number; rear_toe: number
  front_suspension: number; rear_suspension: number; front_anti_roll_bar: number
  rear_anti_roll_bar: number; front_ride_height: number; rear_ride_height: number
  brake_pressure: number; brake_bias: number
  profiles: { username: string; id: string }
}

type Comment = {
  id: string; content: string; created_at: string
  profiles: { username: string }
}

const SECTIONS = [
  { title: 'Aerodynamics', fields: [['Front Wing', 'front_wing'], ['Rear Wing', 'rear_wing']] },
  { title: 'Transmission', fields: [['On Throttle %', 'on_throttle'], ['Off Throttle %', 'off_throttle']] },
  { title: 'Suspension Geometry', fields: [['Front Camber', 'front_camber'], ['Rear Camber', 'rear_camber'], ['Front Toe', 'front_toe'], ['Rear Toe', 'rear_toe']] },
  { title: 'Suspension', fields: [['Front Suspension', 'front_suspension'], ['Rear Suspension', 'rear_suspension'], ['Front ARB', 'front_anti_roll_bar'], ['Rear ARB', 'rear_anti_roll_bar'], ['Front Ride Height', 'front_ride_height'], ['Rear Ride Height', 'rear_ride_height']] },
  { title: 'Brakes', fields: [['Brake Pressure %', 'brake_pressure'], ['Brake Bias %', 'brake_bias']] },
]

export default function SetupPage() {
  const { id } = useParams<{ id: string }>()
  const [setup, setSetup] = useState<Setup | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const [{ data: setupData }, { data: commentData }, { data: userData }] = await Promise.all([
        supabase.from('setups').select('*, profiles(username, id)').eq('id', id).single(),
        supabase.from('comments').select('*, profiles(username)').eq('setup_id', id).order('created_at'),
        supabase.auth.getUser(),
      ])
      setSetup(setupData as unknown as Setup)
      setComments((commentData as unknown as Comment[]) ?? [])
      setUser(userData.user)
      setLoading(false)
    }
    load()
  }, [id])

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !comment.trim()) return
    setSubmitting(true)
    const { data } = await supabase
      .from('comments')
      .insert({ setup_id: id, user_id: user.id, content: comment.trim() })
      .select('*, profiles(username)')
      .single()
    if (data) {
      setComments((prev) => [...prev, data as unknown as Comment])
      setComment('')
    }
    setSubmitting(false)
  }

  async function deleteSetup() {
    if (!confirm('Delete this setup?')) return
    await supabase.from('setups').delete().eq('id', id)
    router.push('/')
  }

  if (loading) return <p className="text-zinc-500">Loading...</p>
  if (!setup) return <p className="text-zinc-500">Setup not found.</p>

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{setup.title}</h1>
            <p className="text-zinc-400 text-sm mt-1">
              {setup.track} · {setup.car} · by {setup.profiles?.username} · {new Date(setup.created_at).toLocaleDateString()}
            </p>
          </div>
          {user?.id === setup.profiles?.id && (
            <button onClick={deleteSetup} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">
              Delete
            </button>
          )}
        </div>
      </div>

      {SECTIONS.map(({ title, fields }) => (
        <div key={title} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-3">{title}</h2>
          <div className="grid grid-cols-2 gap-2">
            {fields.map(([label, key]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-zinc-400">{label}</span>
                <span className="font-mono text-white">{(setup as unknown as Record<string, unknown>)[key] as string}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {setup.notes && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">Notes</h2>
          <p className="text-sm text-zinc-300 whitespace-pre-line">{setup.notes}</p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Comments ({comments.length})</h2>
        <div className="flex flex-col gap-3 mb-4">
          {comments.length === 0 && <p className="text-zinc-500 text-sm">No comments yet.</p>}
          {comments.map((c) => (
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-zinc-300">{c.profiles?.username}</span>
                <span className="text-xs text-zinc-600">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-zinc-400">{c.content}</p>
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={submitComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 text-sm"
            />
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Post
            </button>
          </form>
        ) : (
          <p className="text-zinc-500 text-sm">
            <a href="/auth" className="text-red-400 hover:underline">Log in</a> to comment.
          </p>
        )}
      </div>
    </div>
  )
}
