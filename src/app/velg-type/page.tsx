'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { AnleggsType } from '@/lib/supabase'

const TYPE_ICONS: Record<AnleggsType, { icon: string; label: string }> = {
  brannalarm: {
    icon: '🔔',
    label: 'Brannalarm'
  },
  sprinkler: {
    icon: '💧',
    label: 'Sprinkler'
  },
  roykluker: {
    icon: '💨',
    label: 'Røykluker'
  },
  slukkeutstyr: {
    icon: '🧯',
    label: 'Slukkeutstyr'
  },
  ventilasjon: {
    icon: '🌪️',
    label: 'Ventilasjon'
  },
  romningsveier: {
    icon: '🚪',
    label: 'Rømningsveier'
  }
}

function VelgTypeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const kode = searchParams.get('kode') || ''
  const [anleggsTyper, setAnleggsTyper] = useState<AnleggsType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const hentAnlegg = async () => {
      try {
        const { data: anlegg, error } = await supabase
          .rpc('anlegg_for_kode', { p_kode: kode })
          .select('type_logg')
          .maybeSingle()

        if (error) throw error
        if (anlegg?.type_logg) {
          setAnleggsTyper(anlegg.type_logg)
        }
      } catch (err) {
        setError('Kunne ikke hente anleggsinformasjon')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (kode) {
      hentAnlegg()
    }
  }, [kode])

  const handleTypeClick = (type: AnleggsType) => {
    if (type === 'brannalarm') {
      router.push(`/registrer-hendelse?kode=${kode}&anleggs_type=${type}`)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div>Laster inn...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-500">{error}</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          Velg Logbok
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {anleggsTyper.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeClick(type)}
              className={`p-6 text-center border rounded-lg shadow-sm hover:shadow-md transition-shadow
                ${type === 'brannalarm' ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 cursor-not-allowed'}
              `}
              disabled={type !== 'brannalarm'}
            >
              <div className="text-4xl mb-2">{TYPE_ICONS[type].icon}</div>
              <div className="font-medium text-gray-900">{TYPE_ICONS[type].label}</div>
              {type !== 'brannalarm' && (
                <div className="mt-2 text-sm text-gray-500">Under utvikling</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}

export default function VelgTypePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div>Laster inn...</div>
      </main>
    }>
      <VelgTypeContent />
    </Suspense>
  )
} 