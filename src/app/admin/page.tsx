'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import QRCode from 'react-qr-code'
import type { Anlegg } from '@/lib/supabase'

export default function AdminPage() {
  const [navn, setNavn] = useState('')
  const [adresse, setAdresse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newAnlegg, setNewAnlegg] = useState<Anlegg | null>(null)

  const generateUniqueCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const unik_kode = generateUniqueCode()
      const qr_url = `${window.location.origin}/registrer-hendelse?kode=${unik_kode}`

      const { data, error } = await supabase
        .from('anlegg')
        .insert([
          {
            navn,
            adresse,
            unik_kode,
            qr_url
          }
        ])
        .select()
        .single()

      if (error) throw error

      setSuccess('Anlegg registrert!')
      setNewAnlegg(data)
      setNavn('')
      setAdresse('')
    } catch (err) {
      setError('Kunne ikke registrere anlegg')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Registrer nytt anlegg</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="navn" className="block text-sm font-medium text-gray-700">
              Anleggsnavn
            </label>
            <input
              type="text"
              id="navn"
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">
              Adresse
            </label>
            <input
              type="text"
              id="adresse"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {success && (
            <div className="text-green-500 text-sm">{success}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Registrerer...' : 'Registrer anlegg'}
          </button>
        </form>

        {newAnlegg && (
          <div className="mt-8 p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Anlegg registrert!</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Unik kode:</p>
                <p className="text-lg font-mono">{newAnlegg.unik_kode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">QR-kode:</p>
                <div className="p-4 bg-white inline-block">
                  <QRCode value={newAnlegg.qr_url ?? ''} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 