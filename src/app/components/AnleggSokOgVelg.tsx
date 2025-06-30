import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AnleggData {
  id: string
  navn: string
  adresse?: string
  source?: 'anlegg' | 'anlegg_ikke_linket'
}

export default function AnleggSokOgVelg({ onSelect }: { onSelect: (anlegg: AnleggData) => void }) {
  const [sok, setSok] = useState('')
  const [sokResultat, setSokResultat] = useState<AnleggData[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewFacilityForm, setShowNewFacilityForm] = useState(false)
  const [newFacilityName, setNewFacilityName] = useState('')
  const [newFacilityAddress, setNewFacilityAddress] = useState('')

  useEffect(() => {
    if (sok.length > 2) {
      setLoading(true)
      
      // Søk i både anlegg_ikke_linket og anlegg tabellene
      Promise.all([
        supabase
          .from('anlegg_ikke_linket')
          .select('id, navn, adresse')
          .ilike('navn', `%${sok}%`),
        supabase
          .from('anlegg')
          .select('id, navn, adresse')
          .ilike('navn', `%${sok}%`)
      ]).then(([ikkeLinketResult, anleggResult]) => {
        const ikkeLinket = (ikkeLinketResult.data || []).map(item => ({
          ...item,
          source: 'anlegg_ikke_linket' as const
        }))
        const anlegg = (anleggResult.data || []).map(item => ({
          ...item,
          source: 'anlegg' as const
        }))
        
        setSokResultat([...ikkeLinket, ...anlegg])
        setLoading(false)
      }).catch(() => {
        setSokResultat([])
        setLoading(false)
      })
    } else {
      setSokResultat([])
    }
  }, [sok])

  const handleAnleggSelect = (anlegg: AnleggData) => {
    // Kall onSelect med anlegget slik at skjemaet fylles ut
    // La brukeren fylle ut resten av informasjonen (type, kode) før registrering
    onSelect(anlegg)
  }

  const handleCreateNewFacility = () => {
    setNewFacilityName(sok)
    setShowNewFacilityForm(true)
  }

  const handleSubmitNewFacility = () => {
    if (newFacilityName.trim()) {
      onSelect({ 
        id: '', 
        navn: newFacilityName.trim(), 
        adresse: newFacilityAddress.trim(), 
        source: 'anlegg' 
      })
      setShowNewFacilityForm(false)
      setNewFacilityName('')
      setNewFacilityAddress('')
    }
  }

  const handleCancelNewFacility = () => {
    setShowNewFacilityForm(false)
    setNewFacilityName('')
    setNewFacilityAddress('')
  }

  return (
    <div className="mb-4">
      <label className="block font-bold mb-1 text-gray-900">Søk etter eksisterende anlegg</label>
      <input
        type="text"
        value={sok}
        onChange={e => setSok(e.target.value)}
        className="border rounded px-3 py-2 w-full text-gray-900 placeholder-gray-500"
        placeholder="Skriv inn navn på anlegg"
      />
      {loading && <div className="text-gray-500 mt-2">Laster...</div>}
      {sokResultat.length > 0 && (
        <ul className="border rounded bg-white mt-1 max-h-40 overflow-y-auto">
          {sokResultat.map(anlegg => (
            <li
              key={anlegg.id}
              className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
              onClick={() => handleAnleggSelect(anlegg)}
            >
              <div className="flex justify-between items-center">
                <span>{anlegg.navn} {anlegg.adresse && `- ${anlegg.adresse}`}</span>
                {anlegg.source === 'anlegg_ikke_linket' && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Ikke linket
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {sok.length > 2 && !loading && sokResultat.length === 0 && !showNewFacilityForm && (
        <div className="text-gray-500 mt-2 flex flex-col gap-2">
          <span>Ingen anlegg funnet. Vil du opprette et nytt anlegg?</span>
          <button
            type="button"
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-fit"
            onClick={handleCreateNewFacility}
          >
            Registrer nytt anlegg
          </button>
        </div>
      )}
      
      {showNewFacilityForm && (
        <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h3 className="font-semibold text-blue-900 mb-3">Opprett nytt anlegg</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anleggsnavn
              </label>
              <input
                type="text"
                value={newFacilityName}
                onChange={(e) => setNewFacilityName(e.target.value)}
                className="border rounded px-3 py-2 w-full text-gray-900"
                placeholder="Skriv inn anleggsnavn"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse (valgfritt)
              </label>
              <input
                type="text"
                value={newFacilityAddress}
                onChange={(e) => setNewFacilityAddress(e.target.value)}
                className="border rounded px-3 py-2 w-full text-gray-900"
                placeholder="Skriv inn adresse"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmitNewFacility}
                disabled={!newFacilityName.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                Legg til i skjema
              </button>
              <button
                type="button"
                onClick={handleCancelNewFacility}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Avbryt
              </button>
            </div>
            <p className="text-xs text-blue-700">
              Anlegget vil bli lagt til i skjemaet nedenfor. Du må fortsatt velge type(r) og kode før registrering.
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 