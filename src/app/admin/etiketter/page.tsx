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
    // Åpne utskriftsvindu med etikettene - 75x55mm format for Epson TM-C3500
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      setError('Kunne ikke åpne utskriftsvindu. Sjekk at popup-vinduer er tillatt.')
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kontrollportal Etiketter</title>
          <style>
            @page {
              size: 75mm 55mm;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
            .etikett {
              width: 75mm;
              height: 55mm;
              padding: 3mm;
              page-break-after: always;
              page-break-inside: avoid;
              display: flex;
              flex-direction: row;
              background: white;
              position: relative;
            }
            .etikett:last-child {
              page-break-after: auto;
            }
            .venstre-kolonne {
              writing-mode: vertical-rl;
              text-orientation: mixed;
              transform: rotate(180deg);
              display: flex;
              align-items: center;
              justify-content: center;
              width: 12mm;
              background: #1a1a2e;
              color: white;
              font-size: 8pt;
              font-weight: bold;
              letter-spacing: 1px;
              padding: 2mm;
            }
            .midt-seksjon {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              padding: 2mm 3mm;
            }
            .logo-seksjon {
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .bsv-logo {
              height: 10mm;
              width: auto;
            }
            .registrer-seksjon {
              text-align: center;
            }
            .registrer-tittel {
              font-size: 6pt;
              font-weight: bold;
              color: #333;
              margin-bottom: 1mm;
            }
            .registrer-tekst {
              font-size: 5pt;
              color: #666;
            }
            .kode-seksjon {
              text-align: center;
            }
            .kode-label {
              font-size: 6pt;
              color: #333;
            }
            .kode-verdi {
              font-size: 12pt;
              font-weight: bold;
              color: #ff6b00;
            }
            .qr-seksjon {
              display: flex;
              justify-content: center;
            }
            .qr-seksjon img {
              width: 18mm;
              height: 18mm;
            }
            .hoyre-kolonne {
              writing-mode: vertical-rl;
              text-orientation: mixed;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 10mm;
              background: #1a1a2e;
              color: white;
              font-size: 7pt;
              font-weight: bold;
              letter-spacing: 0.5px;
              padding: 2mm;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          ${genererte.map(k => `
            <div class="etikett">
              <div class="venstre-kolonne">WWW.KONTROLLPORTAL.NO</div>
              <div class="midt-seksjon">
                <div class="logo-seksjon">
                  <img src="https://bsvfire.no/wp-content/uploads/2023/01/BSV-logo.png" alt="BSV" class="bsv-logo" onerror="this.style.display='none'" />
                </div>
                <div class="registrer-seksjon">
                  <div class="registrer-tittel">REGISTRER NY HENDELSE:</div>
                  <div class="registrer-tekst">Benytt QR kode eller anleggsside på www.kontrollportal.no</div>
                </div>
                <div class="kode-seksjon">
                  <div class="kode-label">UNIK ANLEGGS KODE:</div>
                  <div class="kode-verdi">${k.kode}</div>
                </div>
                <div class="qr-seksjon">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(k.qr_url)}" alt="QR" />
                </div>
              </div>
              <div class="hoyre-kolonne">DIGITAL LOGGBOK BRANNSENTRAL</div>
            </div>
          `).join('')}
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    
    // Vent på at bildene lastes før utskrift
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 500)
    }
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