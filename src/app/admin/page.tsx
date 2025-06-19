'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import QRCode from 'react-qr-code'
import type { Anlegg } from '@/lib/supabase'

const ADMIN_PASSWORD = 'BsvFire!'

export default function AdminPage() {
  const [navn, setNavn] = useState('')
  const [adresse, setAdresse] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newAnlegg, setNewAnlegg] = useState<Anlegg | null>(null)
  const [alleAnlegg, setAlleAnlegg] = useState<Anlegg[]>([])
  const [loadingAnlegg, setLoadingAnlegg] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_authed') === 'true') {
        setAuthed(true)
      }
    }
  }, [])

  useEffect(() => {
    const hentAlleAnlegg = async () => {
      setLoadingAnlegg(true)
      try {
        const { data, error } = await supabase
          .from('anlegg')
          .select('*')
          .order('opprettet', { ascending: false })

        if (error) throw error
        setAlleAnlegg(data || [])
      } catch (err) {
        console.error('Kunne ikke hente anlegg:', err)
      } finally {
        setLoadingAnlegg(false)
      }
    }
    hentAlleAnlegg()
  }, [])

  const handlePwSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true)
      setPwError('')
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('admin_authed', 'true')
      }
    } else {
      setPwError('Feil passord')
    }
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <form onSubmit={handlePwSubmit} className="bg-white p-8 rounded-lg shadow max-w-sm w-full space-y-6">
          <h1 className="text-2xl font-bold text-center text-gray-900">Admin pålogging</h1>
          <input
            type="password"
            placeholder="Skriv inn admin-passord"
            value={pw}
            onChange={e => setPw(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-gray-700 placeholder-gray-500"
            autoFocus
          />
          {pwError && <div className="text-red-600 text-center text-sm">{pwError}</div>}
          <button
            type="submit"
            className="w-full py-2 px-4 rounded bg-indigo-600 text-white font-semibold"
          >
            Logg inn
          </button>
        </form>
      </main>
    )
  }

  const generateUniqueCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // Filtrert liste basert på søk
  const filtrerteAnlegg = alleAnlegg.filter(anlegg =>
    anlegg.navn.toLowerCase().includes(search.toLowerCase()) ||
    (anlegg.adresse?.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  // Håndter avkrysning
  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const handleSelectAll = () => {
    if (selectAll) {
      setSelected([])
      setSelectAll(false)
    } else {
      setSelected(filtrerteAnlegg.map(a => a.id))
      setSelectAll(true)
    }
  }

  // Eksporter kun valgte anlegg til CSV
  const eksporterTilCSV = () => {
    const eksportAnlegg = filtrerteAnlegg.filter(a => selected.includes(a.id))
    if (eksportAnlegg.length === 0) return
    const csvHeader = 'anlegg_navn,unik_kode,qr_url\n'
    const csvData = eksportAnlegg.map(anlegg => 
      `"${anlegg.navn}","${anlegg.unik_kode}","${anlegg.qr_url}"`
    ).join('\n')
    const csvContent = csvHeader + csvData
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'anlegg_data.csv')
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
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
      
      // Oppdater listen med anlegg
      setAlleAnlegg(prev => [data, ...prev])
    } catch (err) {
      setError('Kunne ikke registrere anlegg')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Admin Panel - Kontrollportal</h1>

        {/* Registrer nytt anlegg */}
        <div className="mb-12 p-6 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Registrer nytt anlegg</h2>
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
            <div className="mt-8 p-6 border rounded-lg bg-white">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Anlegg registrert!</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Unik kode:</p>
                  <p className="text-lg font-mono">{newAnlegg.unik_kode}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">QR-kode:</p>
                  <div className="p-4 bg-white inline-block border">
                    <QRCode value={newAnlegg.qr_url ?? ''} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Søkefelt og eksport */}
        <div className="p-6 border rounded-lg bg-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Søk etter anleggsnavn eller adresse..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-gray-700 placeholder-gray-500"
              />
            </div>
            <button
              onClick={eksporterTilCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
              disabled={selected.length === 0}
            >
              Eksporter valgte til CSV
            </button>
          </div>

          {loadingAnlegg ? (
            <div className="text-center py-8">Laster anlegg...</div>
          ) : filtrerteAnlegg.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Ingen anlegg funnet</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="col-span-full flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="mr-2"
                  id="selectAll"
                />
                <label htmlFor="selectAll" className="text-sm font-medium text-gray-700">Velg alle</label>
              </div>
              {filtrerteAnlegg.map((anlegg) => (
                <div key={anlegg.id} className="p-4 border rounded-lg bg-gray-50 relative">
                  <input
                    type="checkbox"
                    checked={selected.includes(anlegg.id)}
                    onChange={() => toggleSelect(anlegg.id)}
                    className="absolute top-3 left-3"
                    aria-label={`Velg ${anlegg.navn}`}
                  />
                  <h3 className="font-semibold text-lg mb-2 ml-6 text-gray-900">{anlegg.navn}</h3>
                  {anlegg.adresse && (
                    <p className="text-sm text-gray-600 mb-2 ml-6">{anlegg.adresse}</p>
                  )}
                  <div className="mb-3 ml-6">
                    <p className="text-sm font-medium text-gray-500">Unik kode:</p>
                    <p className="font-mono text-lg text-red-600">{anlegg.unik_kode}</p>
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-medium text-gray-500 mb-2">QR-kode:</p>
                    <div className="p-3 bg-white inline-block border rounded">
                      <QRCode 
                        value={anlegg.qr_url ?? ''} 
                        size={120}
                      />
                    </div>
                  </div>
                  <div className="mt-3 ml-6">
                    <p className="text-xs text-gray-500">URL:</p>
                    <p className="text-xs font-mono break-all">{anlegg.qr_url}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instruksjoner for Epson Label Editor */}
        <div className="mt-8 p-6 border rounded-lg bg-blue-50">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Instruksjoner for Epson Label Editor</h2>
          <div className="space-y-3 text-blue-800">
            <p><strong>1.</strong> Last ned CSV-filen ved å klikke &quot;Eksporter til CSV&quot; knappen over</p>
            <p><strong>2.</strong> Åpne Epson Label Editor</p>
            <p><strong>3.</strong> Åpne mal-filen <code className="bg-blue-100 px-1 rounded">kontrollportal_etikett_mal.nlbl</code></p>
            <p><strong>4.</strong> Importer CSV-filen som datasource</p>
            <p><strong>5.</strong> Skriv ut etiketter for alle anlegg</p>
            <p className="text-sm mt-4">
              <strong>Merk:</strong> Mal-filen er lagret som <code className="bg-blue-100 px-1 rounded">kontrollportal_etikett_mal.nlbl</code> i prosjektmappen.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
} 