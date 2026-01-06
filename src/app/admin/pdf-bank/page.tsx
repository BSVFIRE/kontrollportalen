'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Leverandor, SentraltypeMedLeverandor, PdfDokumentMedSentraltype } from '@/lib/supabase'

const ANLEGGS_TYPER = [
  { value: 'brannalarm', label: 'Brannalarm' },
  { value: 'sprinkler', label: 'Sprinkler' },
  { value: 'roykluker', label: 'Røykluker' },
  { value: 'slukkeutstyr', label: 'Slukkeutstyr' },
  { value: 'ventilasjon', label: 'Ventilasjon' },
  { value: 'romningsveier', label: 'Rømningsveier' },
]

export default function PdfBankPage() {
  const [leverandorer, setLeverandorer] = useState<Leverandor[]>([])
  const [sentraltyper, setSentraltyper] = useState<SentraltypeMedLeverandor[]>([])
  const [pdfDokumenter, setPdfDokumenter] = useState<PdfDokumentMedSentraltype[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [newLeverandor, setNewLeverandor] = useState('')
  const [newSentraltype, setNewSentraltype] = useState('')
  const [selectedLeverandor, setSelectedLeverandor] = useState('')
  const [selectedSentraltype, setSelectedSentraltype] = useState('')
  const [selectedAnleggsType, setSelectedAnleggsType] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfTittel, setPdfTittel] = useState('')
  
  // UI states
  const [activeTab, setActiveTab] = useState<'leverandorer' | 'sentraltyper' | 'pdf'>('leverandorer')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    hentData()
  }, [])

  const hentData = async () => {
    setLoading(true)
    try {
      // Hent leverandører
      const { data: leverandorData } = await supabase
        .from('leverandorer')
        .select('*')
        .order('navn')
      
      // Hent sentraltyper med leverandør
      const { data: sentraltypeData } = await supabase
        .from('sentraltyper')
        .select(`
          *,
          leverandor:leverandorer(*)
        `)
        .order('navn')
      
      // Hent PDF-dokumenter med sentraltype og leverandør
      const { data: pdfData } = await supabase
        .from('pdf_dokumenter')
        .select(`
          *,
          sentraltype:sentraltyper(
            *,
            leverandor:leverandorer(*)
          )
        `)
        .order('opprettet', { ascending: false })

      setLeverandorer(leverandorData || [])
      setSentraltyper(sentraltypeData || [])
      setPdfDokumenter(pdfData || [])
    } catch (err) {
      console.error('Feil ved henting av data:', err)
      setError('Kunne ikke hente data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddLeverandor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLeverandor.trim()) return

    try {
      const { error } = await supabase
        .from('leverandorer')
        .insert([{ navn: newLeverandor.trim() }])

      if (error) throw error

      setNewLeverandor('')
      setSuccess('Leverandør lagt til!')
      hentData()
    } catch (err) {
      console.error('Feil ved lagring av leverandør:', err)
      setError('Kunne ikke lagre leverandør')
    }
  }

  const handleAddSentraltype = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSentraltype.trim() || !selectedLeverandor) return

    try {
      const { error } = await supabase
        .from('sentraltyper')
        .insert([{
          navn: newSentraltype.trim(),
          leverandor_id: selectedLeverandor
        }])

      if (error) throw error

      setNewSentraltype('')
      setSelectedLeverandor('')
      setSuccess('Sentraltype lagt til!')
      hentData()
    } catch (err) {
      console.error('Feil ved lagring av sentraltype:', err)
      setError('Kunne ikke lagre sentraltype')
    }
  }

  const handleUploadPdf = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pdfFile || !selectedSentraltype || !selectedAnleggsType || !pdfTittel.trim()) {
      setError('Fyll ut alle feltene')
      return
    }

    try {
      // Gjør leverandør, sentraltype og filnavn "safe"
      const leverandor = sentraltyper.find(s => s.id === selectedSentraltype)?.leverandor.navn || ''
      const sentraltype = sentraltyper.find(s => s.id === selectedSentraltype)?.navn || ''
      const safeLeverandor = leverandor.toLowerCase().replace(/ /g, '_').normalize('NFKD').replace(/[^\w.-]/g, '')
      const safeSentraltype = sentraltype.toLowerCase().replace(/ /g, '_').normalize('NFKD').replace(/[^\w.-]/g, '')
      const safeAnleggsType = selectedAnleggsType.toLowerCase().replace(/ /g, '_').normalize('NFKD').replace(/[^\w.-]/g, '')
      const safeFileName = pdfFile.name.replace(/ /g, '_').normalize('NFKD').replace(/[^\w.-]/g, '')
      // NB: Ikke ha bucket-navn i path!
      const storagePath = `${safeLeverandor}/${safeSentraltype}/${safeAnleggsType}/${safeFileName}`

      // Last opp fil til Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('pdf-bank')
        .upload(storagePath, pdfFile)

      if (uploadError) throw uploadError

      // Lagre PDF-informasjon i database
      const { error: dbError } = await supabase
        .from('pdf_dokumenter')
        .insert([{
          sentraltype_id: selectedSentraltype,
          anleggs_type: selectedAnleggsType,
          tittel: pdfTittel.trim(),
          filnavn: pdfFile.name,
          storage_path: storagePath,
          fil_storrelse: pdfFile.size
        }])

      if (dbError) throw dbError

      setPdfFile(null)
      setPdfTittel('')
      setSelectedSentraltype('')
      setSelectedAnleggsType('')
      setSuccess('PDF lastet opp!')
      hentData()
    } catch (err) {
      console.error('Feil ved opplasting av PDF:', err)
      setError('Kunne ikke laste opp PDF')
    }
  }

  const handleDeletePdf = async (id: string, storagePath: string) => {
    if (!confirm('Er du sikker på at du vil slette denne PDF-en?')) return

    try {
      // Slett fra storage
      await supabase.storage
        .from('pdf-bank')
        .remove([storagePath])

      // Slett fra database
      const { error } = await supabase
        .from('pdf_dokumenter')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccess('PDF slettet!')
      hentData()
    } catch (err) {
      console.error('Feil ved sletting av PDF:', err)
      setError('Kunne ikke slette PDF')
    }
  }

  const getPdfUrl = (storagePath: string) => {
    const { data } = supabase.storage
      .from('pdf-bank')
      .getPublicUrl(storagePath)
    return data.publicUrl
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Laster PDF-bank...</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">PDF-bank Administrasjon</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('leverandorer')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'leverandorer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Leverandører
          </button>
          <button
            onClick={() => setActiveTab('sentraltyper')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'sentraltyper'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sentraltyper
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'pdf'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            PDF-dokumenter
          </button>
        </div>

        {/* Leverandører */}
        {activeTab === 'leverandorer' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Leverandører</h2>
            
            <form onSubmit={handleAddLeverandor} className="mb-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newLeverandor}
                  onChange={(e) => setNewLeverandor(e.target.value)}
                  placeholder="Leverandørnavn"
                  className="flex-1 border border-gray-400 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newLeverandor.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Legg til
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leverandorer.map(leverandor => (
                <div key={leverandor.id} className="border rounded p-4 bg-gray-50">
                  <h3 className="font-bold text-gray-900 text-lg">{leverandor.navn}</h3>
                  <p className="text-sm text-gray-700">
                    {sentraltyper.filter(s => s.leverandor_id === leverandor.id).length} sentraltyper
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sentraltyper */}
        {activeTab === 'sentraltyper' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Sentraltyper</h2>
            
            <form onSubmit={handleAddSentraltype} className="mb-6">
              <div className="flex gap-4">
                <select
                  value={selectedLeverandor}
                  onChange={(e) => setSelectedLeverandor(e.target.value)}
                  className="border border-gray-400 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Velg leverandør</option>
                  {leverandorer.map(leverandor => (
                    <option key={leverandor.id} value={leverandor.id}>
                      {leverandor.navn}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newSentraltype}
                  onChange={(e) => setNewSentraltype(e.target.value)}
                  placeholder="Sentraltype"
                  className="flex-1 border border-gray-400 rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newSentraltype.trim() || !selectedLeverandor}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Legg til
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sentraltyper.map(sentraltype => (
                <div key={sentraltype.id} className="border rounded p-4 bg-gray-50">
                  <h3 className="font-bold text-gray-900 text-lg">{sentraltype.navn}</h3>
                  <p className="text-sm text-gray-900 font-semibold">{sentraltype.leverandor.navn}</p>
                  <p className="text-sm text-gray-700">
                    {pdfDokumenter.filter(p => p.sentraltype_id === sentraltype.id).length} PDF-er
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF-dokumenter */}
        {activeTab === 'pdf' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">PDF-dokumenter</h2>
            
            <form onSubmit={handleUploadPdf} className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={selectedLeverandor}
                  onChange={(e) => {
                    setSelectedLeverandor(e.target.value)
                    setSelectedSentraltype('')
                  }}
                  className="border border-gray-400 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Velg leverandør</option>
                  {leverandorer.map(leverandor => (
                    <option key={leverandor.id} value={leverandor.id}>
                      {leverandor.navn}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedSentraltype}
                  onChange={(e) => setSelectedSentraltype(e.target.value)}
                  className="border border-gray-400 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!selectedLeverandor}
                >
                  <option value="">Velg sentraltype</option>
                  {sentraltyper
                    .filter(s => s.leverandor_id === selectedLeverandor)
                    .map(sentraltype => (
                      <option key={sentraltype.id} value={sentraltype.id}>
                        {sentraltype.navn}
                      </option>
                    ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={selectedAnleggsType}
                  onChange={(e) => setSelectedAnleggsType(e.target.value)}
                  className="border border-gray-400 rounded px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Velg anleggstype</option>
                  {ANLEGGS_TYPER.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                
                <input
                  type="text"
                  value={pdfTittel}
                  onChange={(e) => setPdfTittel(e.target.value)}
                  placeholder="PDF-tittel"
                  className="border rounded px-3 py-2 bg-white text-gray-900 placeholder-gray-700 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="border rounded px-3 py-2 w-full text-gray-900 font-semibold bg-white file:font-semibold file:text-gray-900 file:bg-gray-200 file:border-0 file:rounded file:px-3 file:py-2 file:shadow-sm"
                />
              </div>
              
              <button
                type="submit"
                disabled={!pdfFile || !selectedSentraltype || !selectedAnleggsType || !pdfTittel.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Last opp PDF
              </button>
            </form>

            <div className="space-y-4">
              {pdfDokumenter.map(pdf => (
                <div key={pdf.id} className="border rounded p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{pdf.tittel}</h3>
                    <p className="text-sm text-gray-900 font-semibold">{pdf.sentraltype.leverandor.navn} - {pdf.sentraltype.navn} - {pdf.anleggs_type}</p>
                    <p className="text-sm text-gray-500">{pdf.filnavn}</p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={getPdfUrl(pdf.storage_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Se PDF
                    </a>
                    <button
                      onClick={() => handleDeletePdf(pdf.id, pdf.storage_path)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Slett
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 