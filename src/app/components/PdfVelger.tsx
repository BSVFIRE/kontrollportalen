'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { PdfDokumentMedSentraltype } from '@/lib/supabase'

interface PdfVelgerProps {
  anleggsType: string
  onClose: () => void
}

export default function PdfVelger({ anleggsType, onClose }: PdfVelgerProps) {
  const [pdfDokumenter, setPdfDokumenter] = useState<PdfDokumentMedSentraltype[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLeverandor, setSelectedLeverandor] = useState('')
  const [selectedSentraltype, setSelectedSentraltype] = useState('')

  useEffect(() => {
    hentPdfDokumenter()
  }, [anleggsType])

  const hentPdfDokumenter = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('pdf_dokumenter')
        .select(`
          *,
          sentraltype:sentraltyper(
            *,
            leverandor:leverandorer(*)
          )
        `)
        .eq('anleggs_type', anleggsType)
        .order('opprettet', { ascending: false })

      setPdfDokumenter(data || [])
    } catch (err) {
      console.error('Feil ved henting av PDF-dokumenter:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPdfUrl = (storagePath: string) => {
    const { data } = supabase.storage
      .from('pdf-bank')
      .getPublicUrl(storagePath)
    return data.publicUrl
  }

  const filtrertePdf = pdfDokumenter.filter(pdf => {
    if (selectedLeverandor && pdf.sentraltype.leverandor.id !== selectedLeverandor) return false
    if (selectedSentraltype && pdf.sentraltype.id !== selectedSentraltype) return false
    return true
  })

  const leverandorer = Array.from(new Set(pdfDokumenter.map(pdf => pdf.sentraltype.leverandor)))
  const sentraltyper = Array.from(new Set(
    pdfDokumenter
      .filter(pdf => !selectedLeverandor || pdf.sentraltype.leverandor.id === selectedLeverandor)
      .map(pdf => pdf.sentraltype)
  ))

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center">Laster PDF-dokumenter...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            PDF-installasjoner for {anleggsType}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {pdfDokumenter.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Ingen PDF-dokumenter funnet for {anleggsType}</p>
            <p className="text-sm text-gray-400 mt-2">
              Kontakt administrator for å få lagt til dokumentasjon
            </p>
          </div>
        ) : (
          <>
            {/* Filtrer */}
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={selectedLeverandor}
                  onChange={(e) => {
                    setSelectedLeverandor(e.target.value)
                    setSelectedSentraltype('')
                  }}
                  className="border rounded px-3 py-2 bg-white text-gray-900 font-semibold shadow-sm"
                >
                  <option value="">Alle leverandører</option>
                  {leverandorer.map(leverandor => (
                    <option key={leverandor.id} value={leverandor.id}>
                      {leverandor.navn}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedSentraltype}
                  onChange={(e) => setSelectedSentraltype(e.target.value)}
                  className="border rounded px-3 py-2 bg-white text-gray-900 font-semibold shadow-sm"
                  disabled={!selectedLeverandor}
                >
                  <option value="">Alle sentraltyper</option>
                  {sentraltyper.map(sentraltype => (
                    <option key={sentraltype.id} value={sentraltype.id}>
                      {sentraltype.navn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PDF-liste */}
            <div className="space-y-4">
              {filtrertePdf.map(pdf => (
                <div key={pdf.id} className="border rounded p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{pdf.tittel}</h3>
                      <p className="text-sm text-gray-900 font-semibold">{pdf.sentraltype.leverandor.navn} - {pdf.sentraltype.navn}</p>
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

            {filtrertePdf.length === 0 && (selectedLeverandor || selectedSentraltype) && (
              <div className="text-center py-8">
                <p className="text-gray-500">Ingen PDF-dokumenter matcher valgte filtre</p>
              </div>
            )}
          </>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Lukk
          </button>
        </div>
      </div>
    </div>
  )
} 