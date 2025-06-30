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
  tidspunkt: string
  type: string
  arsak?: string
  registrert_av?: string
  kommentar?: string
  feiltype?: string
  enhet?: string
  utkobling_tid?: string
  utkobling_uendelig?: boolean
  firma?: string
  anleggs_type?: AnleggsType
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

// PDF Bank types
export type Leverandor = {
  id: string
  navn: string
  opprettet: string
}

export type Sentraltype = {
  id: string
  leverandor_id: string
  navn: string
  opprettet: string
}

export type PdfDokument = {
  id: string
  sentraltype_id: string
  anleggs_type: string
  tittel: string
  filnavn: string
  storage_path: string
  fil_storrelse?: number
  opprettet: string
}

// Extended types with joins
export type SentraltypeMedLeverandor = Sentraltype & {
  leverandor: Leverandor
}

export type PdfDokumentMedSentraltype = PdfDokument & {
  sentraltype: SentraltypeMedLeverandor
}

// Anlegg-Sentraltype kobling
export type AnleggSentraltype = {
  id: string
  anlegg_id: string
  sentraltype_id: string
  opprettet: string
}

// Extended types with joins
export type AnleggMedSentraltyper = Anlegg & {
  anlegg_sentraltyper: (AnleggSentraltype & {
    sentraltype: SentraltypeMedLeverandor
  })[]
}

export type SentraltypeMedAnlegg = SentraltypeMedLeverandor & {
  anlegg_sentraltyper: AnleggSentraltype[]
} 