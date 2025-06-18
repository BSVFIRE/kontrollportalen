'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const HENDELSE_TYPER = [
  { value: 'brannalarm', label: 'Brannalarm' },
  { value: 'forvarsel', label: 'Forvarsel' },
  { value: 'feil', label: 'Feil' },
  { value: 'utkobling', label: 'Utkobling' },
  { value: 'egenkontroll', label: 'Egenkontroll' },
  { value: 'avvik', label: 'Avvik' },
  { value: 'kontroll', label: 'Kontroll' },
  { value: 'utbedringer', label: 'Utbedringer' },
]

const FEIL_TYPER = [
  'Batterifeil',
  'Strømbrudd',
  'Enhetsfeil',
  'Sløyfefeil',
  'Jordfeil',
  'Manglende Enhet',
  'Punkt Svarer ikke',
  'Annet',
]

export default function RegistrerHendelseForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const anleggKode = searchParams.get('kode') || ''

  const [type, setType] = useState('brannalarm')
  const [dato, setDato] = useState('')
  const [tid, setTid] = useState('')
  const [enhet, setEnhet] = useState('')
  const [arsak, setArsak] = useState('')
  const [registrertAv, setRegistrertAv] = useState('')
  const [kommentar, setKommentar] = useState('')
  const [feiltype, setFeiltype] = useState('')
  const [sloyfeSone, setSloyfeSone] = useState('')
  const [utkoblingTid, setUtkoblingTid] = useState('')
  const [utkoblingUendelig, setUtkoblingUendelig] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Hent anlegg_id basert på unik kode
  const [anleggId, setAnleggId] = useState<string | null>(null)
  useEffect(() => {
    if (anleggKode) {
      supabase
        .from('anlegg')
        .select('id')
        .eq('unik_kode', anleggKode)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching anlegg:', error)
            setError('Kunne ikke hente anlegg informasjon')
            return
          }
          setAnleggId(data?.id ?? null)
        })
    }
  }, [anleggKode])

  // Sett initialverdier for dato og tid til nåværende tidspunkt
  useEffect(() => {
    const now = new Date();
    // yyyy-mm-dd
    const dateStr = now.toISOString().slice(0, 10);
    // hh:mm (24-timers)
    const timeStr = now.toTimeString().slice(0, 5);
    setDato(dateStr);
    setTid(timeStr);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!anleggId) {
      setError('Kunne ikke finne anlegg ID')
      setLoading(false)
      return
    }

    // Kombiner dato og tid til timestamp
    const tidspunkt = dato && tid ? `${dato}T${tid}` : null

    const payload: Record<string, unknown> = {
      anlegg_id: anleggId,
      type,
      tidspunkt,
      enhet,
      arsak,
      registrert_av: registrertAv,
      kommentar,
    }
    if (type === 'feil') payload.feiltype = feiltype
    if (type === 'utkobling') {
      payload.sloyfe_sone = sloyfeSone
      payload.utkobling_tid = utkoblingUendelig ? null : Number(utkoblingTid)
      payload.utkobling_uendelig = utkoblingUendelig
    }

    try {
      const { error } = await supabase.from('hendelser').insert([payload])
      if (error) {
        console.error('Database error:', error)
        throw new Error(error.message || 'Kunne ikke registrere hendelse')
      }
      setSuccess(true)
      // Nullstill skjema
      setDato('')
      setTid('')
      setEnhet('')
      setArsak('')
      setRegistrertAv('')
      setKommentar('')
      setFeiltype('')
      setSloyfeSone('')
      setUtkoblingTid('')
      setUtkoblingUendelig(false)
    } catch (err) {
      setError('Kunne ikke registrere hendelse')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-lg w-full p-8 bg-white rounded-lg shadow space-y-6">
        <h1 className="text-2xl font-bold text-center">Registrer hendelse</h1>
        {success ? (
          <div className="text-green-600 text-center space-y-4">
            <p>Hendelsen er registrert!</p>
            <button
              className="w-full py-2 px-4 rounded bg-indigo-600 text-white font-semibold"
              onClick={() => setSuccess(false)}
            >
              Registrer ny hendelse
            </button>
            <button
              className="w-full py-2 px-4 rounded bg-gray-200 text-gray-800 font-semibold"
              onClick={() => router.push(`/logg?kode=${anleggKode}`)}
            >
              Gå til hendelseslogg
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block font-medium mb-1 text-gray-900">Hendelsestype</label>
              <select
                className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                {HENDELSE_TYPER.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block font-medium mb-1 text-gray-900">Dato</label>
                <input type="date" className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value={dato} onChange={e => setDato(e.target.value)} required />
              </div>
              <div className="flex-1">
                <label className="block font-medium mb-1 text-gray-900">Tid</label>
                <input type="time" className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value={tid} onChange={e => setTid(e.target.value)} required step="60" />
              </div>
            </div>
            {(type === 'brannalarm' || type === 'forvarsel' || type === 'utkobling') && (
              <div>
                <label className="block font-medium mb-1 text-gray-900">Enhet <span title="Enhet som har meldt om alarm eller forvarsel, eks. 01.001">ℹ️</span></label>
                <input type="text" className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value={enhet} onChange={e => setEnhet(e.target.value)} required />
              </div>
            )}
            {type === 'utkobling' && (
              <div>
                <label className="block font-medium mb-1 text-gray-900">Sløyfe/Sone</label>
                <input type="text" className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value={sloyfeSone} onChange={e => setSloyfeSone(e.target.value)} />
                <div className="flex items-center gap-2 mt-2 text-gray-900">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={utkoblingUendelig} onChange={e => setUtkoblingUendelig(e.target.checked)} />
                    Koblet ut uendelig
                  </label>
                  {!utkoblingUendelig && (
                    <>
                      <span>|</span>
                      <label className="flex items-center gap-2">
                        Koblet ut på tid?
                        <input type="number" min="1" className="w-20 border rounded px-2 py-1" value={utkoblingTid} onChange={e => setUtkoblingTid(e.target.value)} />
                        min
                      </label>
                    </>
                  )}
                </div>
              </div>
            )}
            {type === 'feil' && (
              <div>
                <label className="block font-medium mb-1 text-gray-900">Type feil</label>
                <select className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value={feiltype} onChange={e => setFeiltype(e.target.value)} required>
                  <option value="">Velg type</option>
                  {FEIL_TYPER.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block font-medium mb-1 text-gray-900">Årsak</label>
              <input type="text" className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value={arsak} onChange={e => setArsak(e.target.value)} required />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-900">Registrert av</label>
              <input type="text" className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value={registrertAv} onChange={e => setRegistrertAv(e.target.value)} required />
            </div>
            <div>
              <label className="block font-medium mb-1 text-gray-900">Kommentar</label>
              <textarea className="w-full border rounded px-3 py-2 text-gray-900 bg-white" value={kommentar} onChange={e => setKommentar(e.target.value)} />
            </div>
            {error && <div className="text-red-500 text-center">{error}</div>}
            <button
              type="submit"
              className="w-full py-2 px-4 rounded bg-indigo-600 text-white font-semibold"
              disabled={loading}
            >
              {loading ? 'Sender...' : 'Registrer hendelse'}
            </button>
            <button
              type="button"
              className="w-full py-2 px-4 rounded bg-gray-200 text-gray-800 font-semibold mt-2"
              onClick={() => router.push(`/logg?kode=${anleggKode}`)}
            >
              Gå til hendelseslogg
            </button>
          </form>
        )}
      </div>
    </main>
  )
} 