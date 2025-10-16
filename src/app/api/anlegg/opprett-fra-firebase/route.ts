import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Opprett Supabase-klient med service role for å kunne skrive
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// CORS headers for å tillate requests fra Firebase_BSVFire
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    // Sjekk API key for sikkerhet
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey || apiKey !== process.env.FIREBASE_SYNC_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      )
    }

    const body = await request.json()
    const { navn, adresse } = body

    if (!navn) {
      return NextResponse.json(
        { error: 'Navn er påkrevd' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Sjekk om anlegg allerede finnes
    const { data: existing } = await supabase
      .from('anlegg_ikke_linket')
      .select('id')
      .ilike('navn', navn)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { 
          success: true, 
          action: 'skipped',
          message: 'Anlegg finnes allerede',
          id: existing.id 
        },
        { status: 200, headers: corsHeaders }
      )
    }

    // Opprett nytt anlegg
    const { data, error } = await supabase
      .from('anlegg_ikke_linket')
      .insert({ navn, adresse })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(
      { 
        success: true, 
        action: 'created',
        message: 'Anlegg opprettet',
        data 
      },
      { status: 201, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Feil ved opprettelse av anlegg:', error)
    return NextResponse.json(
      { error: 'Intern serverfeil' },
      { status: 500, headers: corsHeaders }
    )
  }
}
