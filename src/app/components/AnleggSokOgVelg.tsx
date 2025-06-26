import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface AnleggData {
  id: string
  navn: string
  adresse?: string
}

export default function AnleggSokOgVelg({ onSelect }: { onSelect: (anlegg: AnleggData) => void }) {
  const [sok, setSok] = useState('')
  const [sokResultat, setSokResultat] = useState<AnleggData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sok.length > 2) {
      setLoading(true)
      supabase
        .from('anlegg_ikke_linket')
        .select('*')
        .ilike('navn', `%${sok}%`)
        .then(({ data }) => {
          setSokResultat(data || [])
          setLoading(false)
        })
    } else {
      setSokResultat([])
    }
  }, [sok])

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
              onClick={() => onSelect(anlegg)}
            >
              {anlegg.navn} {anlegg.adresse && `- ${anlegg.adresse}`}
            </li>
          ))}
        </ul>
      )}
      {sok.length > 2 && !loading && sokResultat.length === 0 && (
        <div className="text-gray-500 mt-2">Ingen anlegg funnet, legg inn nytt manuelt.</div>
      )}
    </div>
  )
} 