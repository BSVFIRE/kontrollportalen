'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import QRCode from 'react-qr-code'
import type { Anlegg, AnleggsType } from '@/lib/supabase'
import Link from 'next/link'

const ADMIN_PASSWORD = 'BsvFire!'

const ANLEGGS_TYPER: { value: AnleggsType; label: string }[] = [
  { value: 'brannalarm', label: 'Brannalarm' },
  { value: 'sprinkler', label: 'Sprinkler' },
  { value: 'roykluker', label: 'Røykluker' },
  { value: 'slukkeutstyr', label: 'Slukkeutstyr' },
  { value: 'ventilasjon', label: 'Ventilasjon' },
  { value: 'romningsveier', label: 'Rømningsveier' },
]

export default function AdminPage() {
  const [navn, setNavn] = useState('')
  const [adresse, setAdresse] = useState('')
  const [kode, setKode] = useState('')
  const [ledigeKoder, setLedigeKoder] = useState<{ unik_kode: string }[]>([])
  const [valgtKode, setValgtKode] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<AnleggsType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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

  useEffect(() => {
    const hentLedigeKoder = async () => {
      const { data, error } = await supabase
        .from('ledige_koder')
        .select('unik_kode')
        .order('opprettet', { ascending: true })

      if (error) {
        console.error('Feil ved henting av ledige koder:', error)
        return
      }

      setLedigeKoder(data || [])
    }

    hentLedigeKoder()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTypes.length === 0) {
      setError('Velg minst én type')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    let brukerKode = valgtKode || kode
    
    // Hvis ingen kode er valgt eller skrevet inn, generer en automatisk
    if (!brukerKode) {
      brukerKode = Math.random().toString(36).substring(2, 10).toUpperCase()
    }

    try {
      // Sjekk om koden allerede er i bruk
      const { data: eksisterende } = await supabase
        .from('anlegg')
        .select('id')
        .eq('unik_kode', brukerKode)
        .single()

      if (eksisterende) {
        setError('Denne koden er allerede i bruk')
        setLoading(false)
        return
      }

      // Opprett nytt anlegg
      const { error: insertError } = await supabase
        .from('anlegg')
        .insert([
          {
            navn,
            adresse,
            unik_kode: brukerKode,
            qr_url: `${window.location.origin}/anlegg?kode=${brukerKode}`,
            type_logg: selectedTypes
          }
        ])

      if (insertError) throw insertError

      // Hvis vi brukte en ledig kode, slett den fra ledige_koder tabellen
      if (valgtKode) {
        await supabase
          .from('ledige_koder')
          .delete()
          .eq('unik_kode', valgtKode)

        // Oppdater listen over ledige koder
        setLedigeKoder(prev => prev.filter(k => k.unik_kode !== valgtKode))
      }

      setSuccess('Anlegg registrert!')
      setNavn('')
      setAdresse('')
      setKode('')
      setValgtKode('')
      setSelectedTypes([])
    } catch (err) {
      console.error('Feil ved registrering:', err)
      setError('Kunne ikke registrere anlegg')
    } finally {
      setLoading(false)
    }
  }

  const toggleType = (type: AnleggsType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
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

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Admin Panel - Kontrollportal</h1>

        {/* Registrer nytt anlegg */}
        <div className="mb-12 p-6 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Registrer nytt anlegg</h2>
          <div className="mb-8">
            <Link
              href="/admin/etiketter"
              className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
            >
              Generer tomme etiketter
            </Link>
          </div>
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Velg type(r)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ANLEGGS_TYPER.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => toggleType(type.value)}
                    className={`p-2 rounded border ${
                      selectedTypes.includes(type.value)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Velg en ledig kode
                </label>
                <select
                  value={valgtKode}
                  onChange={(e) => {
                    setValgtKode(e.target.value)
                    setKode('') // Nullstill manuell kode når man velger en ledig
                  }}
                  className="border rounded px-3 py-2 w-full text-gray-900"
                >
                  <option value="">Velg en kode</option>
                  {ledigeKoder.map(k => (
                    <option key={k.unik_kode} value={k.unik_kode}>
                      {k.unik_kode}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Eller skriv inn en ny kode
                </label>
                <input
                  type="text"
                  value={kode}
                  onChange={(e) => {
                    setKode(e.target.value)
                    setValgtKode('') // Nullstill valgt kode når man skriver manuelt
                  }}
                  placeholder="Skriv inn kode"
                  className="border rounded px-3 py-2 w-full text-gray-900"
                />
              </div>
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
        </div>

        {/* Søkefelt og eksport */}
        <div className="bg-white p-6 rounded-lg shadow mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Alle anlegg</h2>
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Søk etter anlegg..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-1/3 text-gray-900"
            />
            <div>
              <button
                onClick={eksporterTilCSV}
                disabled={selected.length === 0}
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
              >
                Eksporter valgte ({selected.length})
              </button>
            </div>
          </div>

          {loadingAnlegg ? (
            <div>Laster anlegg...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 border-r">
                      <input type="checkbox" onChange={handleSelectAll} checked={selectAll} />
                    </th>
                    <th className="p-3 border-r">Anlegg</th>
                    <th className="p-3 border-r">Unik kode</th>
                    <th className="p-3 border-r">QR-kode</th>
                    <th className="p-3 border-r text-center">Hendelseslogg</th>
                    <th className="p-3 text-center">Registrer hendelse</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrerteAnlegg.map(anlegg => (
                    <tr key={anlegg.id} className="border-b text-gray-800">
                      <td className="p-3 border-r">
                        <input type="checkbox" onChange={() => toggleSelect(anlegg.id)} checked={selected.includes(anlegg.id)} />
                      </td>
                      <td className="p-3 border-r">
                        <div className="font-semibold text-base">{anlegg.navn}</div>
                        <div className="text-xs text-gray-600">{anlegg.adresse}</div>
                      </td>
                      <td className="p-3 border-r font-mono">{anlegg.unik_kode}</td>
                      <td className="p-3 border-r">
                        <div className="w-24 h-24 p-1 bg-white border rounded-md">
                          <QRCode value={anlegg.qr_url || ''} size={96} />
                        </div>
                      </td>
                      <td className="p-3 border-r text-center">
                        <Link href={`/logg?kode=${anlegg.unik_kode}`} className="text-indigo-600 hover:underline">
                          Se logg
                        </Link>
                      </td>
                      <td className="p-3 text-center">
                        <Link href={`/registrer-hendelse?kode=${anlegg.unik_kode}`} className="text-green-600 hover:underline">
                          Registrer
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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