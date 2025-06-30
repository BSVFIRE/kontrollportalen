'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import QRCode from 'react-qr-code'
import type { Anlegg, AnleggsType } from '@/lib/supabase'
import Link from 'next/link'
import AnleggSokOgVelg from '@/app/components/AnleggSokOgVelg'

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
  const [valgtAnleggFraIkkeLinket, setValgtAnleggFraIkkeLinket] = useState<{ id: string, navn: string, adresse?: string } | null>(null)
  
  // Redigeringsstate
  const [isEditing, setIsEditing] = useState(false)
  const [editingAnlegg, setEditingAnlegg] = useState<Anlegg | null>(null)
  const [editNavn, setEditNavn] = useState('')
  const [editAdresse, setEditAdresse] = useState('')
  const [editTypes, setEditTypes] = useState<AnleggsType[]>([])
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem('admin_authed') === 'true') {
        setAuthed(true)
      }
    }
  }, [])

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

  useEffect(() => {
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

    if (!navn.trim()) {
      setError('Anleggsnavn er påkrevd')
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
        .select('id, navn')
        .eq('unik_kode', brukerKode)
        .single()

      if (eksisterende) {
        setError(`Koden ${brukerKode} er allerede i bruk av anlegg: ${eksisterende.navn}`)
        setLoading(false)
        return
      }

      // Sjekk om anleggsnavnet allerede eksisterer (valgfritt - fjern hvis du vil tillate duplikater)
      const { data: eksisterendeNavn } = await supabase
        .from('anlegg')
        .select('id, unik_kode')
        .eq('navn', navn.trim())
        .single()

      if (eksisterendeNavn) {
        setError(`Anlegg med navn "${navn}" eksisterer allerede med kode: ${eksisterendeNavn.unik_kode}`)
        setLoading(false)
        return
      }

      // Opprett nytt anlegg
      const { error: insertError } = await supabase
        .from('anlegg')
        .insert([
          {
            navn: navn.trim(),
            adresse: adresse.trim() || null,
            unik_kode: brukerKode,
            qr_url: `${window.location.origin}/anlegg?kode=${brukerKode}`,
            type_logg: selectedTypes
          }
        ])

      if (insertError) throw insertError

      // Hvis anlegget kom fra anlegg_ikke_linket, slett det derfra
      if (valgtAnleggFraIkkeLinket) {
        await supabase
          .from('anlegg_ikke_linket')
          .delete()
          .eq('id', valgtAnleggFraIkkeLinket.id)
      }

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
      setValgtAnleggFraIkkeLinket(null)
      
      // Oppdater listen over anlegg
      hentAlleAnlegg()
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

  const toggleEditType = (type: AnleggsType) => {
    setEditTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const openEditModal = (anlegg: Anlegg) => {
    setEditingAnlegg(anlegg)
    setEditNavn(anlegg.navn)
    setEditAdresse(anlegg.adresse || '')
    setEditTypes(anlegg.type_logg || [])
    setEditError('')
    setEditSuccess('')
    setIsEditing(true)
  }

  const closeEditModal = () => {
    setIsEditing(false)
    setEditingAnlegg(null)
    setEditNavn('')
    setEditAdresse('')
    setEditTypes([])
    setEditError('')
    setEditSuccess('')
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editTypes.length === 0) {
      setEditError('Velg minst én type')
      return
    }

    if (!editingAnlegg) return

    setEditLoading(true)
    setEditError('')
    setEditSuccess('')

    try {
      // Oppdater anlegg
      const { error: updateError } = await supabase
        .from('anlegg')
        .update({
          navn: editNavn,
          adresse: editAdresse,
          type_logg: editTypes
        })
        .eq('id', editingAnlegg.id)

      if (updateError) throw updateError

      setEditSuccess('Anlegg oppdatert!')
      
      // Oppdater listen over anlegg
      hentAlleAnlegg()
      
      // Lukk modal etter 2 sekunder
      setTimeout(() => {
        closeEditModal()
      }, 2000)
    } catch (err) {
      console.error('Feil ved oppdatering:', err)
      setEditError('Kunne ikke oppdatere anlegg')
    } finally {
      setEditLoading(false)
    }
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
            <AnleggSokOgVelg onSelect={(anlegg) => {
              setNavn(anlegg.navn)
              setAdresse(anlegg.adresse || '')
              
              // Hvis anlegget kommer fra anlegg_ikke_linket, lagre det for senere sletting
              if (anlegg.source === 'anlegg_ikke_linket' && anlegg.id) {
                setValgtAnleggFraIkkeLinket({
                  id: anlegg.id,
                  navn: anlegg.navn,
                  adresse: anlegg.adresse
                })
              } else {
                setValgtAnleggFraIkkeLinket(null)
              }
            }} />

            {valgtAnleggFraIkkeLinket && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Anlegg fra ikke-linket liste valgt:</strong> {valgtAnleggFraIkkeLinket.navn}
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Dette anlegget vil bli flyttet til hovedlisten når du registrerer det med type og kode.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        <div className="flex flex-col gap-2">
                          <Link href={`/registrer-hendelse?kode=${anlegg.unik_kode}`} className="text-green-600 hover:underline">
                            Registrer
                          </Link>
                          <button
                            onClick={() => openEditModal(anlegg)}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Rediger
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Redigeringsmodal */}
        {isEditing && editingAnlegg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Rediger anlegg</h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anleggsnavn
                  </label>
                  <input
                    type="text"
                    value={editNavn}
                    onChange={(e) => setEditNavn(e.target.value)}
                    className="border rounded px-3 py-2 w-full text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={editAdresse}
                    onChange={(e) => setEditAdresse(e.target.value)}
                    className="border rounded px-3 py-2 w-full text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unik kode (kan ikke endres)
                  </label>
                  <input
                    type="text"
                    value={editingAnlegg.unik_kode}
                    className="border rounded px-3 py-2 w-full text-gray-500 bg-gray-100"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Koden kan ikke endres for å unngå forvirring med QR-koder og hendelseslogger.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Velg type(r)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {ANLEGGS_TYPER.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => toggleEditType(type.value)}
                        className={`p-2 rounded border ${
                          editTypes.includes(type.value)
                            ? 'bg-blue-100 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {editError && (
                  <div className="text-red-500 text-sm">{editError}</div>
                )}

                {editSuccess && (
                  <div className="text-green-500 text-sm">{editSuccess}</div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {editLoading ? 'Oppdaterer...' : 'Oppdater anlegg'}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
                  >
                    Avbryt
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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