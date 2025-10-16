# Firebase Synkronisering

Denne mappen inneholder verktøy for å synkronisere anlegg mellom Kontrollportal og Firebase_BSVFire.

## Løsninger

### 1. Automatisk synkronisering (Anbefalt)

Bruker Supabase Database Webhooks og Edge Functions for automatisk sanntidssynkronisering.

#### Oppsett:

1. **Deploy Edge Function:**
   ```bash
   cd /Users/eriksebastianskille/Documents/Kontrollportal/kontrollportalen
   supabase functions deploy sync-to-firebase
   ```

2. **Sett opp miljøvariabler for Edge Function:**
   
   I Supabase Dashboard for Kontrollportal:
   - Gå til Edge Functions > sync-to-firebase > Settings
   - Legg til secrets:
     - `FIREBASE_SUPABASE_URL`: https://snyzduzqyjsllzvwuahh.supabase.co
     - `FIREBASE_SUPABASE_SERVICE_KEY`: [Service role key fra Firebase_BSVFire]

3. **Sett opp Database Webhook:**
   
   I Supabase Dashboard for Kontrollportal:
   - Gå til Database > Webhooks
   - Klikk "Create a new hook"
   - Konfigurer:
     - Name: `firebase-sync-anlegg`
     - Table: `anlegg`
     - Events: `INSERT`, `UPDATE`
     - Type: `Supabase Edge Functions`
     - Edge Function: `sync-to-firebase`

4. **Kjør SQL-migrasjonen (valgfritt):**
   ```sql
   -- Kjør i Kontrollportal Supabase SQL Editor
   -- Dette setter opp trigger-funksjonen
   ```

### 2. Manuell synkronisering

Bruk TypeScript-scriptet for å synkronisere manuelt eller via cron-job.

#### Oppsett:

1. **Opprett `.env.local` fil** (hvis den ikke finnes):
   ```env
   # Kontrollportal Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-kontrollportal-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-kontrollportal-anon-key
   
   # Firebase_BSVFire Supabase
   FIREBASE_SUPABASE_URL=https://snyzduzqyjsllzvwuahh.supabase.co
   FIREBASE_SUPABASE_SERVICE_KEY=your-firebase-service-key
   ```

2. **Installer avhengigheter** (hvis ikke allerede gjort):
   ```bash
   npm install @supabase/supabase-js
   npm install -D tsx
   ```

3. **Kjør synkronisering:**
   ```bash
   npx tsx firebase-sync/sync-anlegg.ts
   ```

## Hvordan det fungerer

### Dataflyt:

```
Kontrollportal (anlegg)
    ↓
    ↓ (INSERT/UPDATE trigger)
    ↓
Edge Function (sync-to-firebase)
    ↓
    ↓ (Sjekker om anlegg finnes basert på unik_kode)
    ↓
Firebase_BSVFire (anlegg)
    ↓
    ↓ (Oppdaterer: unik_kode, kontrollportal_url)
    ↓
✅ Synkronisert
```

### Feltmapping:

| Kontrollportal | Firebase_BSVFire | Beskrivelse |
|----------------|------------------|-------------|
| `unik_kode` | `unik_kode` | Matching-nøkkel og synkronisert felt |
| `qr_url` | `kontrollportal_url` | Link til loggbok |

**Merk:** Kun `unik_kode` og `kontrollportal_url` synkroniseres. Adresse, navn og type_logg administreres kun i Firebase_BSVFire.

### Viktig:

- **Anlegg må først opprettes i Firebase_BSVFire** med kunde-kobling og unik_kode
- Synkroniseringen **oppdaterer kun eksisterende anlegg** basert på `unik_kode`
- Synkroniseringen **oppretter ikke nye anlegg** (krever kunde-kobling som ikke finnes i Kontrollportal)

## Matching-rapport

For å få oversikt over hvilke anlegg som er koblet og hvilke som mangler kobling:

```bash
npm run sync:report
```

Dette genererer en detaljert rapport som viser:
- ✅ Anlegg som allerede er koblet
- ❌ Anlegg i Firebase_BSVFire som mangler unik_kode
- ❌ Anlegg i Kontrollportal som ikke er koblet til Firebase_BSVFire
- 🎯 Forslag til mulige matches basert på navn og adresse

## Testing

Test synkroniseringen ved å:

1. Opprett et anlegg i Firebase_BSVFire med en unik_kode (f.eks. "TEST123")
2. Opprett samme anlegg i Kontrollportal med samme unik_kode
3. Kjør synkronisering: `npm run sync:firebase`
4. Verifiser at `kontrollportal_url` er oppdatert i Firebase_BSVFire

## Feilsøking

### Edge Function logger:

```bash
supabase functions logs sync-to-firebase
```

### Vanlige problemer:

1. **"Firebase Supabase credentials mangler"**
   - Sjekk at miljøvariabler er satt i Edge Function settings

2. **"Anlegg finnes ikke i Firebase_BSVFire"**
   - Anlegget må først opprettes manuelt i Firebase_BSVFire med unik_kode

3. **Webhook trigges ikke**
   - Sjekk at Database Webhook er korrekt konfigurert i Supabase Dashboard
