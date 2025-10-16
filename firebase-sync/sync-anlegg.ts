/**
 * Synkroniserer anlegg fra Kontrollportal til Firebase_BSVFire
 * 
 * Dette scriptet:
 * 1. Henter alle anlegg fra Kontrollportal Supabase
 * 2. For hvert anlegg med unik_kode, oppdaterer i Firebase_BSVFire
 * 3. Synkroniserer KUN unik_kode og kontrollportal_url (ikke adresse eller type_logg)
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Last inn miljøvariabler fra .env.local
config({ path: '.env.local' })

// Kontrollportal Supabase
const kontrollportalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const kontrollportalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const kontrollportalClient = createClient(kontrollportalUrl, kontrollportalKey)

// Firebase_BSVFire Supabase
const firebaseUrl = process.env.FIREBASE_SUPABASE_URL!
const firebaseKey = process.env.FIREBASE_SUPABASE_SERVICE_KEY!
const firebaseClient = createClient(firebaseUrl, firebaseKey)

interface KontrollportalAnlegg {
  id: string
  navn: string
  adresse: string | null
  unik_kode: string
  qr_url: string | null
  opprettet: string
  type_logg: string[]
}

interface FirebaseAnlegg {
  id: string
  kundenr: string
  anleggsnavn: string
  adresse: string | null
  unik_kode: string | null
  kontrollportal_url: string | null
  kontroll_type: string[] | null
  opprettet_dato: string
  sist_oppdatert: string | null
}

async function syncAnlegg() {
  console.log('🔄 Starter synkronisering av anlegg...')
  
  try {
    // Hent alle anlegg fra Kontrollportal
    const { data: kontrollportalAnlegg, error: fetchError } = await kontrollportalClient
      .from('anlegg')
      .select('*')
      .order('opprettet', { ascending: false })
    
    if (fetchError) {
      throw new Error(`Feil ved henting fra Kontrollportal: ${fetchError.message}`)
    }
    
    if (!kontrollportalAnlegg || kontrollportalAnlegg.length === 0) {
      console.log('ℹ️  Ingen anlegg funnet i Kontrollportal')
      return
    }
    
    console.log(`📋 Fant ${kontrollportalAnlegg.length} anlegg i Kontrollportal`)
    
    let synced = 0
    let skipped = 0
    let errors = 0
    
    for (const kpAnlegg of kontrollportalAnlegg) {
      try {
        // Sjekk om anlegget allerede finnes i Firebase_BSVFire basert på unik_kode
        let { data: existingAnlegg, error: checkError } = await firebaseClient
          .from('anlegg')
          .select('*')
          .eq('unik_kode', kpAnlegg.unik_kode)
          .maybeSingle()
        
        if (checkError) {
          console.error(`❌ Feil ved sjekk av anlegg ${kpAnlegg.navn}:`, checkError.message)
          errors++
          continue
        }
        
        // Hvis ikke funnet basert på unik_kode, prøv å finne basert på navn
        if (!existingAnlegg && kpAnlegg.navn) {
          const { data: anleggByName, error: nameError } = await firebaseClient
            .from('anlegg')
            .select('*')
            .ilike('anleggsnavn', `%${kpAnlegg.navn}%`)
          
          if (!nameError && anleggByName && anleggByName.length > 0) {
            existingAnlegg = anleggByName[0]
            console.log(`🔍 Fant anlegg basert på navn: "${kpAnlegg.navn}" → "${existingAnlegg.anleggsnavn}"`)
          }
        }
        
        // Bygg kontrollportal URL
        const kontrollportalUrl = kpAnlegg.qr_url || `https://kontrollportal.no/logg?kode=${kpAnlegg.unik_kode}`
        
        if (existingAnlegg) {
          // Oppdater eksisterende anlegg - KUN unik_kode og kontrollportal_url
          const { error: updateError } = await firebaseClient
            .from('anlegg')
            .update({
              unik_kode: kpAnlegg.unik_kode,
              kontrollportal_url: kontrollportalUrl,
              sist_oppdatert: new Date().toISOString()
            })
            .eq('id', existingAnlegg.id)
          
          if (updateError) {
            console.error(`❌ Feil ved oppdatering av ${kpAnlegg.navn}:`, updateError.message)
            errors++
          } else {
            console.log(`✅ Oppdatert: ${kpAnlegg.navn} (${kpAnlegg.unik_kode})`)
            synced++
          }
        } else {
          // Anlegget finnes ikke - hopp over (må opprettes manuelt med kunde-kobling)
          console.log(`⏭️  Hoppet over: ${kpAnlegg.navn} (må opprettes manuelt med kunde)`)
          skipped++
        }
      } catch (err) {
        console.error(`❌ Feil ved behandling av ${kpAnlegg.navn}:`, err)
        errors++
      }
    }
    
    console.log('\n📊 Synkronisering fullført:')
    console.log(`   ✅ Synkronisert: ${synced}`)
    console.log(`   ⏭️  Hoppet over: ${skipped}`)
    console.log(`   ❌ Feil: ${errors}`)
    
  } catch (error) {
    console.error('💥 Kritisk feil:', error)
    process.exit(1)
  }
}

// Kjør synkronisering
syncAnlegg()
  .then(() => {
    console.log('✨ Synkronisering ferdig!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Synkronisering feilet:', error)
    process.exit(1)
  })
