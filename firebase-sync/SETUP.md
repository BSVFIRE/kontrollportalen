# Oppsett av Firebase Synkronisering

## 📋 Oversikt

Dette oppsettet synkroniserer anlegg fra Kontrollportal til Firebase_BSVFire automatisk når anlegg opprettes eller oppdateres.

## 🚀 Rask start (Anbefalt metode)

### Metode 1: Automatisk synkronisering med Supabase Database Webhooks

Dette er den enkleste og mest pålitelige metoden.

#### Steg 1: Sett opp Database Webhook i Kontrollportal

1. Gå til **Kontrollportal Supabase Dashboard**
2. Naviger til **Database > Webhooks**
3. Klikk **"Enable Webhooks"** (hvis ikke allerede aktivert)
4. Klikk **"Create a new hook"**
5. Konfigurer webhook:
   - **Name**: `firebase-sync-anlegg`
   - **Table**: `anlegg`
   - **Events**: Velg `INSERT` og `UPDATE`
   - **Type**: `HTTP Request`
   - **HTTP Request**:
     - **Method**: `POST`
     - **URL**: `https://snyzduzqyjsllzvwuahh.supabase.co/functions/v1/sync-from-kontrollportal`
     - **Headers**: 
       ```
       Content-Type: application/json
       Authorization: Bearer [FIREBASE_SUPABASE_SERVICE_KEY]
       ```
   - **HTTP Params**: `{}`
6. Klikk **"Create webhook"**

#### Steg 2: Opprett mottaker-endepunkt i Firebase_BSVFire

Du må opprette en Supabase Edge Function i Firebase_BSVFire som mottar webhook-dataene.

**Alternativ**: Bruk en enklere løsning med direkte database-tilgang fra Kontrollportal.

### Metode 2: Manuell synkronisering (Enklere å sette opp)

Denne metoden krever manuell kjøring, men er enklere å sette opp.

#### Steg 1: Installer avhengigheter

```bash
cd /Users/eriksebastianskille/Documents/Kontrollportal/kontrollportalen
npm install
```

#### Steg 2: Konfigurer miljøvariabler

Legg til følgende i `.env.local` (i prosjektets rot):

```env
# Kontrollportal Supabase (allerede konfigurert)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key

# Firebase_BSVFire Supabase (NYTT)
FIREBASE_SUPABASE_URL=https://snyzduzqyjsllzvwuahh.supabase.co
FIREBASE_SUPABASE_SERVICE_KEY=eyJhbGc...  # Hent fra Firebase_BSVFire Dashboard
```

**Hvor finner du Service Key?**
1. Gå til Firebase_BSVFire Supabase Dashboard
2. Settings > API
3. Kopier **service_role key** (IKKE anon key!)

#### Steg 3: Kjør synkronisering

```bash
npm run sync:firebase
```

Dette vil:
- Hente alle anlegg fra Kontrollportal
- For hvert anlegg med `unik_kode`, sjekke om det finnes i Firebase_BSVFire
- Oppdatere eksisterende anlegg med nye data fra Kontrollportal

#### Steg 4: Automatiser (valgfritt)

Sett opp en cron-job for å kjøre synkroniseringen regelmessig:

```bash
# Kjør hver time
0 * * * * cd /Users/eriksebastianskille/Documents/Kontrollportal/kontrollportalen && npm run sync:firebase
```

## 📊 Hvordan det fungerer

### Dataflyt:

```
Kontrollportal (anlegg)
    ↓
    ↓ Når anlegg opprettes/oppdateres
    ↓
Synkronisering (webhook eller manuell)
    ↓
    ↓ Sjekker om anlegg finnes i Firebase_BSVFire (basert på unik_kode)
    ↓
Firebase_BSVFire (anlegg)
    ↓
    ↓ Oppdaterer: unik_kode, kontrollportal_url
    ↓
✅ Synkronisert
```

### Feltmapping:

| Kontrollportal | Firebase_BSVFire | Beskrivelse |
|----------------|------------------|-------------|
| `unik_kode` | `unik_kode` | **Matching-nøkkel** og synkronisert felt |
| `qr_url` | `kontrollportal_url` | Link til loggbok |

**Viktig:** Kun `unik_kode` og `kontrollportal_url` synkroniseres fra Kontrollportal. Alle andre felt (navn, adresse, kontroll_type, etc.) administreres kun i Firebase_BSVFire.

## ⚠️ Viktig informasjon

### Forutsetninger:

1. **Anlegg må først opprettes i Firebase_BSVFire**
   - Anlegget må ha en kunde-kobling (kundenr)
   - Anlegget må ha samme `unik_kode` som i Kontrollportal

2. **Synkroniseringen oppretter IKKE nye anlegg**
   - Den oppdaterer kun eksisterende anlegg
   - Dette er fordi Firebase_BSVFire krever kunde-kobling som ikke finnes i Kontrollportal

### Arbeidsflyt:

1. **QR-klistremerke settes opp på anlegget:**
   - Klistremerket har en unik kode (f.eks. "ABC123")
   - Koden er forhåndsgenerert i Kontrollportal

2. **Kunde/tekniker registrerer anlegg i Kontrollportal:**
   - Skann QR-kode eller skriv inn "ABC123"
   - Fyll inn navn, adresse, type_logg
   - Lagre → Anlegg opprettet i Kontrollportal

3. **Opprett samme anlegg i Firebase_BSVFire:**
   - Velg kunde
   - Fyll inn anleggsnavn, adresse, kontroll_type
   - **Legg inn samme `unik_kode`: "ABC123"** (fra klistremerket)
   - Lagre

4. **Synkronisering skjer:**
   - Automatisk (hvis webhook er satt opp)
   - Eller manuelt (kjør `npm run sync:firebase`)

5. **Verifiser i Firebase_BSVFire:**
   - Åpne anlegget
   - Sjekk at `kontrollportal_url` er oppdatert
   - Navn, adresse og kontroll_type forblir uendret (administreres kun i Firebase_BSVFire)

## 🧪 Testing

### Test manuell synkronisering:

```bash
# Kjør synkronisering
npm run sync:firebase

# Forventet output:
# 🔄 Starter synkronisering av anlegg...
# 📋 Fant X anlegg i Kontrollportal
# ✅ Oppdatert: Anleggsnavn (ABC123)
# ⏭️  Hoppet over: AnnetAnlegg (må opprettes manuelt med kunde)
# 📊 Synkronisering fullført:
#    ✅ Synkronisert: X
#    ⏭️  Hoppet over: Y
#    ❌ Feil: 0
```

### Test webhook (hvis satt opp):

1. Opprett eller oppdater et anlegg i Kontrollportal
2. Sjekk webhook-logger i Kontrollportal Dashboard (Database > Webhooks > Logs)
3. Verifiser at anlegget er oppdatert i Firebase_BSVFire

## 🔧 Feilsøking

### Problem: "Firebase Supabase credentials mangler"

**Løsning**: Sjekk at `FIREBASE_SUPABASE_SERVICE_KEY` er satt i `.env.local`

### Problem: "Anlegg finnes ikke i Firebase_BSVFire"

**Løsning**: Anlegget må først opprettes manuelt i Firebase_BSVFire med samme `unik_kode`

### Problem: Synkroniseringen kjører ikke automatisk

**Løsning**: 
- Sjekk at Database Webhook er korrekt konfigurert
- Sjekk webhook-logger for feilmeldinger
- Verifiser at URL og Authorization header er korrekte

### Problem: "Cannot find module 'tsx'"

**Løsning**: 
```bash
npm install
```

## 📞 Support

Ved problemer, sjekk:
1. Supabase Dashboard logs (begge prosjekter)
2. Console output fra `npm run sync:firebase`
3. README.md for mer detaljert dokumentasjon
