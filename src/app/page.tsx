'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [kode, setKode] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const { data: anlegg, error } = await supabase
        .from('anlegg')
        .select('*')
        .eq('unik_kode', kode)
        .single()

      if (error) throw error

      if (anlegg) {
        // TODO: Implement session management
        console.log('Innlogget som:', anlegg.navn)
      } else {
        setError('Ugyldig kode')
      }
    } catch (err) {
      setError('Kunne ikke logge inn')
      console.error(err)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Kontrollportal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Logg inn med din unike kode
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="kode" className="sr-only">
              Unik kode
            </label>
            <input
              id="kode"
              name="kode"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Skriv inn din unike kode"
              value={kode}
              onChange={(e) => setKode(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logg inn
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
