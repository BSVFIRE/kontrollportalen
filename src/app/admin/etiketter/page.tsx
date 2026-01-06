'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { customAlphabet } from 'nanoid'

export default function GenererEtiketter() {
  const [antall, setAntall] = useState(1)
  const [genererte, setGenererte] = useState<{ kode: string; qr_url: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const genererKoder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      console.log('Starter generering av', antall, 'koder')
      // Kun store bokstaver og tall
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const generateKode = customAlphabet(alphabet, 8)
      const koder = Array.from({ length: antall }, () => {
        const kode = generateKode()
        return {
          kode,
          qr_url: `${window.location.origin}/anlegg?kode=${kode}`
        }
      })

      console.log('Genererte koder:', koder)

      // Lagre de tomme kodene i en ny tabell 'ledige_koder'
      const { data, error } = await supabase
        .from('ledige_koder')
        .insert(koder.map(k => ({
          unik_kode: k.kode,
          qr_url: k.qr_url
        })))
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Database feil: ${error.message}`)
      }

      console.log('Lagret i database:', data)
      setGenererte(koder)
    } catch (err) {
      console.error('Feil ved generering av koder:', err)
      setError(err instanceof Error ? err.message : 'Kunne ikke generere koder')
    } finally {
      setLoading(false)
    }
  }

  const eksporterTilCSV = () => {
    if (genererte.length === 0) return

    // Opprett CSV-innhold med tom anleggsnavn
    const headers = ['anlegg_navn', 'unik_kode', 'qr_url']
    const csvContent = [
      headers.join(','),
      ...genererte.map(k => `,${k.kode},${k.qr_url}`)
    ].join('\n')

    // Opprett og last ned fil
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `tomme_etiketter_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const skrivUtEtiketter = () => {
    // Åpne utskriftsvindu med etikettene
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setError('Kunne ikke åpne utskriftsvindu. Sjekk at popup-vinduer er tillatt.')
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tomme Etiketter</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .etikett {
              border: 1px solid #ccc;
              padding: 15px;
              margin: 10px;
              width: 300px;
              page-break-inside: avoid;
              display: inline-block;
              text-align: center;
            }
            .tittel {
              font-size: 16px;
              font-weight: bold;
              margin: 5px 0;
              color: #666;
            }
            .anleggsnavn {
              font-size: 18px;
              font-weight: bold;
              margin: 10px 0;
              color: #999;
              font-style: italic;
            }
            .kode {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
            }
            .qr-code {
              margin: 10px 0;
            }
            .instruksjon {
              font-size: 12px;
              color: #666;
              margin-top: 10px;
            }
            @media print {
              .etikett {
                border: 1px solid #000;
              }
            }
          </style>
        </head>
        <body>
          ${genererte.map(k => `
            <div class="etikett">
              <div class="tittel">Kontrollportal</div>
              <div class="anleggsnavn">[Tom - fylles ved første scanning]</div>
              <div class="kode">${k.kode}</div>
              <div class="qr-code">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(k.qr_url)}" 
                     alt="QR Kode" 
                     style="width: 150px; height: 150px;" />
              </div>
              <div class="instruksjon">Scan QR-koden for å registrere anlegg</div>
            </div>
          `).join('')}
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <main className="min-h-screen p-8 bg-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Generer Tomme Etiketter</h1>
        
        <form onSubmit={genererKoder} className="mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Antall etiketter
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={antall}
              onChange={(e) => setAntall(parseInt(e.target.value))}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Genererer...' : 'Generer Etiketter'}
          </button>
        </form>

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        {genererte.length > 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={eksporterTilCSV}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Eksporter til CSV ({genererte.length} etiketter)
              </button>
              <button
                onClick={skrivUtEtiketter}
                className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Skriv ut {genererte.length} etiketter
              </button>
            </div>
            
            <div className="border rounded p-4 bg-gray-50">
              <h2 className="font-bold mb-2 text-gray-900">Genererte koder:</h2>
              <ul className="space-y-1">
                {genererte.map(k => (
                  <li key={k.kode} className="font-mono text-lg font-bold text-gray-900">{k.kode}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 