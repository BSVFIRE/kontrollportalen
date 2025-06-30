'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Anlegg, AnleggsType, PdfDokumentMedSentraltype, AnleggSentraltype } from '@/lib/supabase'
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

  // PDF state
  const [pdfDokumenter, setPdfDokumenter] = useState<PdfDokumentMedSentraltype[]>([])
  const [anleggSentraltyper, setAnleggSentraltyper] = useState<AnleggSentraltype[]>([])
  const [showPdfModal, setShowPdfModal] = useState(false)
  const [selectedAnleggsType, setSelectedAnleggsType] = useState<string>('')

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
            await hentAnleggSentraltyper(data.id)
            await hentPdfDokumenter(data.id)
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

  const hentAnleggSentraltyper = async (anleggId: string) => {
    try {
      const { data, error } = await supabase
        .from('anlegg_sentraltyper')
        .select('*')
        .eq('anlegg_id', anleggId)

      if (error) throw error
      setAnleggSentraltyper(data || [])
    } catch (err) {
      console.error('Kunne ikke hente anlegg-sentraltyper:', err)
    }
  }

  const hentPdfDokumenter = async (anleggId: string) => {
    try {
      // Hent sentraltyper for dette anlegget
      const { data: anleggSentraltyperData, error: sentraltypeError } = await supabase
        .from('anlegg_sentraltyper')
        .select('sentraltype_id')
        .eq('anlegg_id', anleggId)

      if (sentraltypeError) throw sentraltypeError

      if (anleggSentraltyperData && anleggSentraltyperData.length > 0) {
        const sentraltypeIds = anleggSentraltyperData.map(k => k.sentraltype_id)
        
        // Hent PDF-dokumenter for disse sentraltypene
        const { data: pdfData, error: pdfError } = await supabase
          .from('pdf_dokumenter')
          .select(`
            *,
            sentraltype:sentraltyper(
              *,
              leverandor:leverandorer(*)
            )
          `)
          .in('sentraltype_id', sentraltypeIds)
          .order('opprettet', { ascending: false })

        if (pdfError) throw pdfError
        setPdfDokumenter(pdfData || [])
      } else {
        setPdfDokumenter([])
      }
    } catch (err) {
      console.error('Kunne ikke hente PDF-dokumenter:', err)
      setPdfDokumenter([])
    }
  }

  const getPdfUrl = (storagePath: string) => {
    const { data } = supabase.storage
      .from('pdf-bank')
      .getPublicUrl(storagePath)
    return data.publicUrl
  }

  const openPdfModal = (anleggsType: string) => {
    setSelectedAnleggsType(anleggsType)
    setShowPdfModal(true)
  }

  const closePdfModal = () => {
    setShowPdfModal(false)
    setSelectedAnleggsType('')
  }

  const getPdfForType = (anleggsType: string) => {
    return pdfDokumenter.filter(pdf => pdf.anleggs_type === anleggsType)
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
              setAdresse(anlegg.adresse || '')
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

          {/* PDF-dokumenter */}
          {anlegg.type_logg && anlegg.type_logg.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">PDF-dokumenter</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {anlegg.type_logg.map(type => {
                  const pdfForType = getPdfForType(type)
                  const typeLabel = ANLEGGS_TYPER.find(t => t.value === type)?.label || type
                  
                  return (
                    <div key={type} className="border rounded-lg p-4 hover:bg-gray-50">
                      <h4 className="font-semibold text-gray-900 mb-2">{typeLabel}</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {pdfForType.length} PDF-dokument(er) tilgjengelig
                      </p>
                      {pdfForType.length > 0 ? (
                        <button
                          onClick={() => openPdfModal(type)}
                          className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                        >
                          Se PDF-er
                        </button>
                      ) : (
                        <p className="text-sm text-gray-500 italic">
                          Ingen PDF-er tilgjengelig for denne typen
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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

        {/* PDF-modal */}
        {showPdfModal && selectedAnleggsType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  PDF-dokumenter for {ANLEGGS_TYPER.find(t => t.value === selectedAnleggsType)?.label || selectedAnleggsType}
                </h2>
                <button
                  onClick={closePdfModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {getPdfForType(selectedAnleggsType).map(pdf => (
                  <div key={pdf.id} className="border rounded p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{pdf.tittel}</h3>
                        <p className="text-sm text-gray-600">
                          {pdf.sentraltype.leverandor.navn} - {pdf.sentraltype.navn}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {pdf.filnavn} • {(pdf.fil_storrelse || 0 / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <a
                          href={getPdfUrl(pdf.storage_path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Åpne PDF
                        </a>
                        <button
                          onClick={() => {
                            const url = getPdfUrl(pdf.storage_path)
                            window.open(url, '_blank')
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Last ned
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {getPdfForType(selectedAnleggsType).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Ingen PDF-dokumenter tilgjengelig for denne typen</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Kontakt administrator for å få lagt til dokumentasjon
                  </p>
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={closePdfModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Lukk
                </button>
              </div>
            </div>
          </div>
        )}
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