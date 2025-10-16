/**
 * Genererer en matching-rapport mellom Kontrollportal og Firebase_BSVFire
 * 
 * Dette scriptet:
 * 1. Henter alle anlegg fra begge systemer
 * 2. Identifiserer anlegg som allerede er koblet (via unik_kode)
 * 3. Foreslår mulige matches for ukoblede anlegg basert på navn/adresse
 * 4. Genererer en rapport som kan brukes for manuell kobling
 */

import { createClient } from '@supabase/supabase-js'

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
}

interface FirebaseAnlegg {
  id: string
  anleggsnavn: string
  adresse: string | null
  unik_kode: string | null
  kundenr: string
}

interface Match {
  firebase_id: string
  firebase_navn: string
  firebase_adresse: string | null
  kontrollportal_unik_kode: string
  kontrollportal_navn: string
  kontrollportal_adresse: string | null
  match_score: number
  match_reason: string
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 1.0
  
  // Enkel Levenshtein-lignende matching
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(s1, s2)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

async function generateMatchingReport() {
  console.log('🔍 Genererer matching-rapport...\n')
  
  try {
    // Hent alle anlegg fra Kontrollportal
    const { data: kpAnlegg, error: kpError } = await kontrollportalClient
      .from('anlegg')
      .select('*')
      .order('navn')
    
    if (kpError) throw new Error(`Feil ved henting fra Kontrollportal: ${kpError.message}`)
    
    // Hent alle anlegg fra Firebase_BSVFire
    const { data: fbAnlegg, error: fbError } = await firebaseClient
      .from('anlegg')
      .select('id, anleggsnavn, adresse, unik_kode, kundenr')
      .order('anleggsnavn')
    
    if (fbError) throw new Error(`Feil ved henting fra Firebase_BSVFire: ${fbError.message}`)
    
    console.log(`📊 Statistikk:`)
    console.log(`   Kontrollportal: ${kpAnlegg?.length || 0} anlegg`)
    console.log(`   Firebase_BSVFire: ${fbAnlegg?.length || 0} anlegg\n`)
    
    // Kategoriser anlegg
    const koblet: Array<{ firebase: FirebaseAnlegg, kontrollportal: KontrollportalAnlegg }> = []
    const ukobletFirebase: FirebaseAnlegg[] = []
    const ukobletKontrollportal: KontrollportalAnlegg[] = []
    
    // Finn koblede anlegg
    for (const fb of fbAnlegg || []) {
      if (fb.unik_kode) {
        const kp = kpAnlegg?.find(k => k.unik_kode === fb.unik_kode)
        if (kp) {
          koblet.push({ firebase: fb, kontrollportal: kp })
        } else {
          ukobletFirebase.push(fb)
        }
      } else {
        ukobletFirebase.push(fb)
      }
    }
    
    // Finn ukoblede Kontrollportal-anlegg
    for (const kp of kpAnlegg || []) {
      const erKoblet = koblet.some(k => k.kontrollportal.unik_kode === kp.unik_kode)
      if (!erKoblet) {
        ukobletKontrollportal.push(kp)
      }
    }
    
    console.log(`✅ Koblede anlegg: ${koblet.length}`)
    console.log(`❌ Ukoblede Firebase_BSVFire: ${ukobletFirebase.length}`)
    console.log(`❌ Ukoblede Kontrollportal: ${ukobletKontrollportal.length}\n`)
    
    // Generer forslag for ukoblede anlegg
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 MATCHING-RAPPORT')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // Vis koblede anlegg
    if (koblet.length > 0) {
      console.log('✅ ALLEREDE KOBLEDE ANLEGG:\n')
      for (const k of koblet) {
        console.log(`   Firebase: ${k.firebase.anleggsnavn}`)
        console.log(`   Kontrollportal: ${k.kontrollportal.navn}`)
        console.log(`   Unik kode: ${k.firebase.unik_kode}`)
        console.log(`   ─────────────────────────────────────────────────────────\n`)
      }
    }
    
    // Foreslå matches for ukoblede Firebase-anlegg
    if (ukobletFirebase.length > 0) {
      console.log('\n❓ UKOBLEDE FIREBASE_BSVFIRE ANLEGG (forslag):\n')
      
      for (const fb of ukobletFirebase) {
        console.log(`   📍 Firebase: ${fb.anleggsnavn}`)
        console.log(`      Adresse: ${fb.adresse || 'Ingen adresse'}`)
        console.log(`      Unik kode: ${fb.unik_kode || '(tom - må fylles inn)'}`)
        
        // Finn beste matches
        const matches: Match[] = []
        for (const kp of ukobletKontrollportal) {
          const navnScore = calculateSimilarity(fb.anleggsnavn, kp.navn)
          const adresseScore = fb.adresse && kp.adresse 
            ? calculateSimilarity(fb.adresse, kp.adresse)
            : 0
          
          const totalScore = (navnScore * 0.7) + (adresseScore * 0.3)
          
          if (totalScore > 0.5) {
            matches.push({
              firebase_id: fb.id,
              firebase_navn: fb.anleggsnavn,
              firebase_adresse: fb.adresse,
              kontrollportal_unik_kode: kp.unik_kode,
              kontrollportal_navn: kp.navn,
              kontrollportal_adresse: kp.adresse,
              match_score: totalScore,
              match_reason: `Navn: ${(navnScore * 100).toFixed(0)}%, Adresse: ${(adresseScore * 100).toFixed(0)}%`
            })
          }
        }
        
        matches.sort((a, b) => b.match_score - a.match_score)
        
        if (matches.length > 0) {
          console.log(`\n      🎯 Mulige matches:`)
          for (const match of matches.slice(0, 3)) {
            console.log(`         ${(match.match_score * 100).toFixed(0)}% - ${match.kontrollportal_navn}`)
            console.log(`         Unik kode: ${match.kontrollportal_unik_kode}`)
            console.log(`         ${match.match_reason}`)
            console.log(`         ─────────────────────────────────────────────`)
          }
        } else {
          console.log(`      ⚠️  Ingen gode matches funnet`)
        }
        console.log(`\n      ─────────────────────────────────────────────────────────\n`)
      }
    }
    
    // Vis ukoblede Kontrollportal-anlegg
    if (ukobletKontrollportal.length > 0) {
      console.log('\n❓ UKOBLEDE KONTROLLPORTAL ANLEGG:\n')
      for (const kp of ukobletKontrollportal) {
        console.log(`   📍 ${kp.navn}`)
        console.log(`      Unik kode: ${kp.unik_kode}`)
        console.log(`      Adresse: ${kp.adresse || 'Ingen adresse'}`)
        console.log(`      ─────────────────────────────────────────────────────────\n`)
      }
    }
    
    // Generer SQL-script for kobling
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📝 ANBEFALTE HANDLINGER')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    console.log('1. Gå gjennom forslagene ovenfor')
    console.log('2. For hvert anlegg du vil koble:')
    console.log('   - Gå til Firebase_BSVFire')
    console.log('   - Rediger anlegget')
    console.log('   - Legg inn riktig unik_kode')
    console.log('   - Lagre')
    console.log('3. Kjør synkronisering: npm run sync:firebase\n')
    
  } catch (error) {
    console.error('💥 Feil:', error)
    process.exit(1)
  }
}

// Kjør rapport
generateMatchingReport()
  .then(() => {
    console.log('✨ Rapport generert!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Feil ved generering av rapport:', error)
    process.exit(1)
  })
