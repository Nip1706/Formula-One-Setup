'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-red-500 font-bold text-lg tracking-tight">
          F1 Setups
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
            Parcourir
          </Link>
          {user ? (
            <>
              <Link
                href="/setups/new"
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors"
              >
                + Nouveau Setup
              </Link>
              <button
                onClick={logout}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors"
            >
              Connexion / Inscription
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
