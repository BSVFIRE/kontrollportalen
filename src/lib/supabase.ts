import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type AnleggsType = 'brannalarm' | 'sprinkler' | 'roykluker' | 'slukkeutstyr' | 'ventilasjon' | 'romningsveier'

export type Anlegg = {
  id: string
  navn: string
  adresse: string | null
  unik_kode: string
  qr_url: string | null
  opprettet: string
  type_logg: AnleggsType[]
}

export type Hendelse = {
  id: string
  anlegg_id: string
  type: 'egenkontroll' | 'avvik' | 'kontroll'
  beskrivelse: string | null
  opprettet: string
  anleggs_type: AnleggsType
}

export type Kontaktperson = {
  id: string
  anlegg_id: string
  navn: string
  epost: string | null
  telefon: string | null
}

export type Rapport = {
  id: string
  anlegg_id: string
  fil_url: string
  dato: string
  beskrivelse: string | null
}

export type KontaktHenvendelse = {
  id: string
  navn: string
  epost: string
  telefon: string | null
  melding: string
  status: 'ny' | 'under_behandling' | 'fullført'
  opprettet: string
} 