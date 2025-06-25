'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Anlegg, AnleggsType } from '@/lib/supabase'
import QRCode from 'react-qr-code'
import AnleggSokOgVelg from '@/app/components/AnleggSokOgVelg'

const ANLEGGS_TYPER: { value: AnleggsType; label: string }[] = [
  { value: 'brannalarm', label: 'Brannalarm' },
  { value: 'sprinkler', label: 'Sprinkler' },
  { value: 'roykluker', label: 'Røykluker' },
  { value: 'slukkeutstyr', label: 'Slukkeutstyr' },
  { value: 'ventilasjon', label: 'Ventilasjon' },
  { value: 'romningsveier', label: 'Rømningsveier' },
]

function AnleggContent() {
  const searchParams = useSearchParams()
  const kode = searchParams.get('kode')
  
  const [anlegg, setAnlegg] = useState<Anlegg | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  
  // Registreringsskjema state
  const [navn, setNavn] = useState('')
  const [adresse, setAdresse] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<AnleggsType[]>([])
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState(false)

  useEffect(() => {
    if (kode) {
      const hentAnlegg = async () => {
        try {
          const { data, error } = await supabase
            .from('anlegg')
            .select('*')
            .eq('unik_kode', kode)
            .single()

          if (error && error.code !== 'PGRST116') {
            throw error
          }

          if (data) {
            setAnlegg(data)
          } else {
            // Koden finnes ikke i anlegg-tabellen, sjekk om den finnes i ledige_koder
            const { data: ledigKode } = await supabase
              .from('ledige_koder')
              .select('unik_kode')
              .eq('unik_kode', kode)
              .single()

            if (ledigKode) {
              // Koden finnes som ledig kode, vis registreringsskjema
              setIsRegistering(true)
            } else {
              setError('Ugyldig kode')
            }
          }
        } catch (err) {
          console.error('Feil ved henting av anlegg:', err)
          setError('Kunne ikke hente anlegg')
        } finally {
          setLoading(false)
        }
      }
      
      hentAnlegg()
    } else {
      setLoading(false)
    }
  }, [kode])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTypes.length === 0) {
      setRegisterError('Velg minst én type')
      return
    }

    setRegisterLoading(true)
    setRegisterError('')

    try {
      // Opprett nytt anlegg med den eksisterende koden
      const { data: newAnlegg, error: insertError } = await supabase
        .from('anlegg')
        .insert([
          {
            navn,
            adresse,
            unik_kode: kode!,
            qr_url: `${window.location.origin}/anlegg?kode=${kode}`,
            type_logg: selectedTypes
          }
        ])
        .select()
        .single()

      if (insertError) throw insertError

      // Slett koden fra ledige_koder tabellen
      await supabase
        .from('ledige_koder')
        .delete()
        .eq('unik_kode', kode)

      setAnlegg(newAnlegg)
      setIsRegistering(false)
      setRegisterSuccess(true)
    } catch (err) {
      console.error('Feil ved registrering:', err)
      setRegisterError('Kunne ikke registrere anlegg')
    } finally {
      setRegisterLoading(false)
    }
  }

  const toggleType = (type: AnleggsType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laster...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Feil</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </main>
    )
  }

  if (isRegistering) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h1 className="text-2xl font-bold text-blue-900 mb-2">Registrer nytt anlegg</h1>
            <p className="text-blue-700">
              QR-koden <strong>{kode}</strong> er ikke knyttet til noe anlegg ennå. 
              Fyll ut informasjonen nedenfor for å registrere anlegget.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <AnleggSokOgVelg onSelect={(anlegg) => {
              setNavn(anlegg.navn)
              setAdresse(anlegg.adresse)
              setSelectedTypes(anlegg.type_logg || [])
            }} />

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

            {registerError && (
              <div className="text-red-500">{registerError}</div>
            )}

            <button
              type="submit"
              disabled={registerLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {registerLoading ? 'Registrerer...' : 'Registrer anlegg'}
            </button>
          </form>
        </div>
      </main>
    )
  }

  if (!anlegg) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ingen kode funnet</h1>
          <p className="text-gray-600">Skann en gyldig QR-kode for å komme i gang.</p>
        </div>
      </main>
    )
  }

  // Vis eksisterende anlegg (som før)
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {registerSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700 font-medium">
              ✅ Anlegg registrert! Du kan nå registrere hendelser for dette anlegget.
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{anlegg.navn}</h1>
              {anlegg.adresse && (
                <p className="text-gray-600 text-lg">{anlegg.adresse}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">Kode: {anlegg.unik_kode}</p>
            </div>
            <div className="text-right">
              <div className="bg-gray-100 p-4 rounded-lg">
                <QRCode value={anlegg.qr_url ?? ''} size={128} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Registrer hendelse</h2>
              <a
                href={`/registrer-hendelse?kode=${anlegg.unik_kode}`}
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Registrer ny hendelse
              </a>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Se hendelser</h2>
              <a
                href={`/logg?kode=${anlegg.unik_kode}`}
                className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Se hendelseslogg
              </a>
            </div>
          </div>

          {anlegg.type_logg && anlegg.type_logg.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">Anleggstyper</h3>
              <div className="flex flex-wrap gap-2">
                {anlegg.type_logg.map(type => (
                  <span
                    key={type}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {ANLEGGS_TYPER.find(t => t.value === type)?.label || type}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function AnleggPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laster...</p>
        </div>
      </main>
    }>
      <AnleggContent />
    </Suspense>
  )
} 