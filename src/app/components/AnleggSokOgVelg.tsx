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

  const handleAnleggSelect = async (anlegg: AnleggData) => {
    // Hvis anlegget kommer fra anlegg_ikke_linket, flytt det til anlegg
    if (anlegg.source === 'anlegg_ikke_linket') {
      try {
        // Opprett nytt anlegg i anlegg-tabellen
        const { data: newAnlegg, error: insertError } = await supabase
          .from('anlegg')
          .insert([{
            navn: anlegg.navn,
            adresse: anlegg.adresse,
            unik_kode: Math.random().toString(36).substring(2, 10).toUpperCase(),
            qr_url: `${window.location.origin}/anlegg?kode=${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            type_logg: []
          }])
          .select()
          .single()

        if (insertError) throw insertError

        // Slett fra anlegg_ikke_linket
        await supabase
          .from('anlegg_ikke_linket')
          .delete()
          .eq('id', anlegg.id)

        // Oppdater søkeresultatet
        setSokResultat(prev => prev.filter(item => item.id !== anlegg.id))
        
        // Kall onSelect med det nye anlegget
        onSelect({
          id: newAnlegg.id,
          navn: newAnlegg.navn,
          adresse: newAnlegg.adresse,
          source: 'anlegg'
        })
      } catch (error) {
        console.error('Feil ved flytting av anlegg:', error)
        // Hvis flyttingen feiler, kall onSelect med original data
        onSelect(anlegg)
      }
    } else {
      // Hvis anlegget allerede er i anlegg-tabellen, kall onSelect direkte
      onSelect(anlegg)
    }
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
      {sok.length > 2 && !loading && sokResultat.length === 0 && (
        <div className="text-gray-500 mt-2 flex flex-col gap-2">
          <span>Ingen anlegg funnet, legg inn nytt manuelt.</span>
          <button
            type="button"
            className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 w-fit"
            onClick={() => onSelect({ id: '', navn: sok, adresse: '', source: 'anlegg' })}
          >
            Registrer nytt anlegg
          </button>
        </div>
      )}
    </div>
  )
} 