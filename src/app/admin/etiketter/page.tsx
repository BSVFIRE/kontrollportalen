'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { customAlphabet } from 'nanoid'

interface LedigKode {
  id: string
  unik_kode: string
  qr_url: string
  opprettet: string
}

export default function GenererEtiketter() {
  const [antall, setAntall] = useState(1)
  const [genererte, setGenererte] = useState<{ kode: string; qr_url: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ledigeKoder, setLedigeKoder] = useState<LedigKode[]>([])
  const [loadingLedige, setLoadingLedige] = useState(true)
  const [valgteKoder, setValgteKoder] = useState<string[]>([])

  // Hent eksisterende ledige koder ved oppstart
  useEffect(() => {
    hentLedigeKoder()
  }, [])

  const hentLedigeKoder = async () => {
    setLoadingLedige(true)
    try {
      const { data, error } = await supabase
        .from('ledige_koder')
        .select('*')
        .order('opprettet', { ascending: false })

      if (error) throw error
      setLedigeKoder(data || [])
    } catch (err) {
      console.error('Feil ved henting av ledige koder:', err)
    } finally {
      setLoadingLedige(false)
    }
  }

  const toggleKodeValg = (kode: string) => {
    setValgteKoder(prev => 
      prev.includes(kode) 
        ? prev.filter(k => k !== kode)
        : [...prev, kode]
    )
  }

  const velgAlle = () => {
    if (valgteKoder.length === ledigeKoder.length) {
      setValgteKoder([])
    } else {
      setValgteKoder(ledigeKoder.map(k => k.unik_kode))
    }
  }

  const brukValgteKoder = () => {
    const valgte = ledigeKoder
      .filter(k => valgteKoder.includes(k.unik_kode))
      .map(k => ({ kode: k.unik_kode, qr_url: k.qr_url }))
    setGenererte(valgte)
  }

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
      // Oppdater listen over ledige koder
      hentLedigeKoder()
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Etiketter</h1>
        
        {/* Eksisterende ledige koder */}
        <div className="mb-8 p-6 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Eksisterende blanke etiketter</h2>
          
          {loadingLedige ? (
            <div className="text-gray-500">Laster...</div>
          ) : ledigeKoder.length === 0 ? (
            <div className="text-gray-500">Ingen blanke etiketter funnet. Generer nye nedenfor.</div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{ledigeKoder.length} blanke etiketter tilgjengelig</span>
                <button
                  type="button"
                  onClick={velgAlle}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {valgteKoder.length === ledigeKoder.length ? 'Fjern alle' : 'Velg alle'}
                </button>
              </div>
              
              <div className="max-h-48 overflow-y-auto border rounded bg-white p-2">
                {ledigeKoder.map(kode => (
                  <label key={kode.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={valgteKoder.includes(kode.unik_kode)}
                      onChange={() => toggleKodeValg(kode.unik_kode)}
                      className="w-4 h-4"
                    />
                    <span className="font-mono font-bold text-gray-900">{kode.unik_kode}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(kode.opprettet).toLocaleDateString('nb-NO')}
                    </span>
                  </label>
                ))}
              </div>
              
              {valgteKoder.length > 0 && (
                <button
                  type="button"
                  onClick={brukValgteKoder}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Bruk {valgteKoder.length} valgte etiketter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Generer nye etiketter */}
        <div className="mb-8 p-6 border rounded-lg bg-blue-50">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Generer nye etiketter</h2>
          <form onSubmit={genererKoder} className="space-y-4">
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
                className="border rounded px-3 py-2 w-full text-gray-900"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Genererer...' : 'Generer nye etiketter'}
            </button>
          </form>
        </div>

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