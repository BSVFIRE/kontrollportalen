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
  type: 'brannalarm' | 'forvarsel' | 'feil' | 'utkobling' | 'egenkontroll' | 'avvik' | 'kontroll' | 'utbedringer'
  tidspunkt: string | null
  enhet: string | null
  arsak: string | null
  registrert_av: string | null
  kommentar: string | null
  feiltype: string | null
  sloyfe_sone: string | null
  utkobling_tid: number | null
  utkobling_uendelig: boolean | null
  firma: string | null
  anleggs_type: AnleggsType
  opprettet: string
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

export type LedigKode = {
  id: string
  unik_kode: string
  qr_url: string
  opprettet: string
}

export type Database = {
  public: {
    Tables: {
      anlegg: {
        Row: Anlegg
        Insert: Omit<Anlegg, 'id' | 'opprettet'>
        Update: Partial<Omit<Anlegg, 'id' | 'opprettet'>>
      }
      ledige_koder: {
        Row: LedigKode
        Insert: Omit<LedigKode, 'id' | 'opprettet'>
        Update: Partial<Omit<LedigKode, 'id' | 'opprettet'>>
      }
    }
  }
} 