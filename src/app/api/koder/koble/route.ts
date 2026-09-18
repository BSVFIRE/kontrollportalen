/**
 * POST /api/koder/koble – kalles av FireCtrl (Edge Function sync-to-kontrollportal)
 * når en QR-kode kobles til eller frikobles fra et anlegg.
 *
 * Body:
 *   { kode: "7F3KQ2ZX", merkelapp: "Sentral 2" | null,
 *     anlegg: { firebase_anlegg_id, navn, adresse, kunde, kontroll_type } | null }
 *
 * anlegg = null  → koden frikobles (raden slettes her)
 * anlegg satt    → finn portal-anlegget (samme FireCtrl-id via en annen kode, eller gammel unik_kode),
 *                  ellers opprett det. Oppdater navn/adresse. Upsert koder-raden.
 */
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

// FireCtrl-kontrolltype → portalens type_logg. Førstehjelp/Ekstern har ingen loggtype i portalen.
const TYPE_MAP: Record<string, string> = {
  Brannalarm: 'brannalarm', Nødlys: 'romningsveier', Slukkeutstyr: 'slukkeutstyr', Røykluker: 'roykluker',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey || apiKey !== process.env.FIREBASE_SYNC_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
  }

  try {
    const body = await request.json()
    const kode: string = String(body.kode ?? '').toUpperCase()
    if (!/^[A-Z0-9]{8}$/.test(kode)) {
      return NextResponse.json({ error: 'Ugyldig kode' }, { status: 400, headers: corsHeaders })
    }

    // Frikobling
    if (!body.anlegg) {
      await supabase.from('koder').delete().eq('kode', kode)
      return NextResponse.json({ success: true, action: 'frikoblet' }, { headers: corsHeaders })
    }

    const { firebase_anlegg_id, navn, adresse, kontroll_type } = body.anlegg as {
      firebase_anlegg_id: string; navn: string | null; adresse: string | null; kontroll_type?: string[]
    }
    if (!navn) return NextResponse.json({ error: 'Anleggsnavn mangler' }, { status: 400, headers: corsHeaders })

    const typeLogg = Array.from(new Set((kontroll_type ?? []).map(t => TYPE_MAP[t]).filter(Boolean)))

    // 1. Finnes portal-anlegget allerede? (annen kode på samme FireCtrl-anlegg, eller gammel unik_kode)
    let anleggId: string | null = null
    const { data: viaFirectrl } = await supabase.from('koder').select('anlegg_id').eq('firectrl_anlegg_id', firebase_anlegg_id).limit(1).maybeSingle()
    if (viaFirectrl) anleggId = viaFirectrl.anlegg_id
    if (!anleggId) {
      const { data: viaKode } = await supabase.from('koder').select('anlegg_id').eq('kode', kode).maybeSingle()
      if (viaKode) anleggId = viaKode.anlegg_id
    }
    if (!anleggId) {
      const { data: viaUnik } = await supabase.from('anlegg').select('id').eq('unik_kode', kode).maybeSingle()
      if (viaUnik) anleggId = viaUnik.id
    }

    // 2. Oppdater eller opprett
    let action: 'oppdatert' | 'opprettet'
    if (anleggId) {
      const oppdatering: Record<string, unknown> = { navn, adresse }
      if (typeLogg.length) oppdatering.type_logg = typeLogg
      const { error } = await supabase.from('anlegg').update(oppdatering).eq('id', anleggId)
      if (error) throw error
      action = 'oppdatert'
    } else {
      const { data, error } = await supabase.from('anlegg').insert({
        navn, adresse, unik_kode: kode,
        qr_url: `https://www.kontrollportal.no/anlegg?kode=${kode}`,
        type_logg: typeLogg.length ? typeLogg : ['brannalarm'],
      }).select('id').single()
      if (error) throw error
      anleggId = data.id
      action = 'opprettet'
    }

    // 3. Kode → anlegg
    const { error: kodeError } = await supabase.from('koder').upsert({
      kode, anlegg_id: anleggId, firectrl_anlegg_id: firebase_anlegg_id, merkelapp: body.merkelapp ?? null, oppdatert: new Date().toISOString(),
    })
    if (kodeError) throw kodeError

    // Rydd: koden er ikke lenger «ledig» i den gamle flyten
    await supabase.from('ledige_koder').delete().eq('unik_kode', kode)

    return NextResponse.json({ success: true, action, anlegg_id: anleggId }, { headers: corsHeaders })
  } catch (error) {
    console.error('koder/koble:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ukjent feil' }, { status: 500, headers: corsHeaders })
  }
}
