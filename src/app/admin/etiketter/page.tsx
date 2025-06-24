'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { nanoid, customAlphabet } from 'nanoid'

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
          <title>Etiketter</title>
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
            .kode {
              font-size: 24px;
              font-weight: bold;
              margin: 10px 0;
            }
            .qr-code {
              margin: 10px 0;
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
              <div class="kode">${k.kode}</div>
              <div class="qr-code">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(k.qr_url)}" 
                     alt="QR Kode" 
                     style="width: 150px; height: 150px;" />
              </div>
              <div>Scan QR-koden eller besøk:</div>
              <div style="margin-top: 5px;">${window.location.origin}/anlegg</div>
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
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Generer Tomme Etiketter</h1>
        
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
            <button
              onClick={skrivUtEtiketter}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Skriv ut {genererte.length} etiketter
            </button>
            
            <div className="border rounded p-4 bg-gray-50">
              <h2 className="font-semibold mb-2">Genererte koder:</h2>
              <ul className="space-y-1">
                {genererte.map(k => (
                  <li key={k.kode} className="font-mono">{k.kode}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 