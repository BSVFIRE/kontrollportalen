# 🚀 Oppsett av Database Webhook (Metode 1)

## 📋 Oversikt

Dette oppsettet gir **sanntidssynkronisering** direkte i Supabase - ingen eksterne servere nødvendig!

```
Kontrollportal Supabase
    ↓ (anlegg INSERT/UPDATE)
Database Webhook
    ↓ (< 1 sekund)
Edge Function (sync-to-firebase)
    ↓
Firebase_BSVFire Supabase
    ↓
✅ Synkronisert!
```

---

## 🛠️ Steg-for-steg oppsett

### Steg 1: Sett opp miljøvariabler for Edge Function

1. Gå til **Kontrollportal Supabase Dashboard**
2. Naviger til **Edge Functions** (i venstre meny)
3. Klikk på **"sync-to-firebase"** (hvis den finnes, ellers gå til steg 2)
4. Gå til **Settings** (øverst)
5. Under **"Secrets"**, legg til:

```
FIREBASE_SUPABASE_URL
Verdi: https://snyzduzqyjsllzvwuahh.supabase.co

FIREBASE_SUPABASE_SERVICE_KEY
Verdi: [Hent fra Firebase_BSVFire Dashboard]
```

**Hvor finner du Service Key?**
1. Gå til **Firebase_BSVFire Supabase Dashboard**
2. Settings > API
3. Kopier **service_role** key (IKKE anon key!)
4. Lim inn som `FIREBASE_SUPABASE_SERVICE_KEY`

---

### Steg 2: Deploy Edge Function

Edge Function-koden er allerede opprettet i:
```
supabase/functions/sync-to-firebase/index.ts
```

**Deploy funksjonen:**

```bash
# Naviger til Kontrollportal-prosjektet
cd /Users/eriksebastianskille/Documents/Kontrollportal/kontrollportalen

# Logg inn på Supabase (hvis ikke allerede gjort)
npx supabase login

# Link til prosjektet (første gang)
npx supabase link --project-ref [din-project-ref]

# Deploy Edge Function
npx supabase functions deploy sync-to-firebase
```

**Finn project-ref:**
- Gå til Kontrollportal Supabase Dashboard
- Settings > General
- Kopier **Reference ID**

**Forventet output:**
```
Deploying sync-to-firebase (project ref: xxxxx)
Bundled sync-to-firebase in 234ms.
Deployed sync-to-firebase in 1.2s.
```

**Få Edge Function URL:**
```
https://[din-project-ref].supabase.co/functions/v1/sync-to-firebase
```

---

### Steg 3: Sett opp Database Webhook

1. Gå til **Kontrollportal Supabase Dashboard**
2. Naviger til **Database > Webhooks**
3. Klikk **"Enable Webhooks"** (hvis ikke allerede aktivert)
4. Klikk **"Create a new hook"**

**Konfigurer webhook:**

```
Name: firebase-sync-anlegg
Table: anlegg
Events: ✓ INSERT, ✓ UPDATE (ikke DELETE)
Type: Supabase Edge Functions
Edge Function: sync-to-firebase
HTTP Headers: (la stå tom)
```

5. Klikk **"Create webhook"**

---

### Steg 4: Test oppsettet

#### Test 1: Opprett nytt anlegg i Kontrollportal

1. Gå til Kontrollportal (frontend)
2. Opprett et nytt anlegg med unik_kode (f.eks. "TEST123")
3. Lagre

**Sjekk webhook-logg:**
1. Gå til **Database > Webhooks** i Kontrollportal Dashboard
2. Klikk på **"firebase-sync-anlegg"**
3. Se **"Logs"**-fanen
4. Du skal se en ny entry med status **200 OK**

**Sjekk Edge Function-logg:**
```bash
npx supabase functions logs sync-to-firebase
```

Eller i Dashboard:
1. **Edge Functions > sync-to-firebase > Logs**

#### Test 2: Oppdater anlegg

1. Finn et anlegg i Firebase_BSVFire som har `unik_kode: "TEST123"`
2. Gå til Kontrollportal og oppdater samme anlegg
3. Sjekk at `kontrollportal_url` oppdateres i Firebase_BSVFire

---

## 🔍 Feilsøking

### Problem: "Edge Function ikke funnet"

**Løsning:**
```bash
# List alle funksjoner
npx supabase functions list

# Hvis sync-to-firebase ikke finnes, deploy på nytt
npx supabase functions deploy sync-to-firebase
```

### Problem: "Webhook feiler med 500 error"

**Sjekk Edge Function logs:**
```bash
npx supabase functions logs sync-to-firebase --tail
```

**Vanlige årsaker:**
1. Miljøvariabler mangler (FIREBASE_SUPABASE_URL eller FIREBASE_SUPABASE_SERVICE_KEY)
2. Service key er feil
3. Firebase_BSVFire Supabase er nede

**Løsning:**
1. Gå til Edge Functions > sync-to-firebase > Settings
2. Verifiser at begge secrets er satt
3. Test service key manuelt

### Problem: "Anlegg oppdateres ikke i Firebase_BSVFire"

**Sjekk:**
1. Har anlegget samme `unik_kode` i begge systemer?
2. Kjør matching-rapport:
```bash
npm run sync:report
```

**Manuell test av Edge Function:**
```bash
curl -X POST \
  'https://[din-project-ref].supabase.co/functions/v1/sync-to-firebase' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "UPDATE",
    "table": "anlegg",
    "record": {
      "id": "test-id",
      "navn": "Test Anlegg",
      "unik_kode": "TEST123",
      "qr_url": "https://kontrollportal.no/logg?kode=TEST123"
    }
  }'
```

### Problem: "Webhook trigges ikke"

**Sjekk:**
1. Er webhook aktivert? (Database > Webhooks)
2. Er events (INSERT/UPDATE) valgt?
3. Er Edge Function deployet?

**Test webhook manuelt:**
1. Database > Webhooks > firebase-sync-anlegg
2. Klikk **"Send test event"**
3. Sjekk logs

---

## 📊 Overvåking

### Se webhook-aktivitet

**Dashboard:**
1. Database > Webhooks > firebase-sync-anlegg
2. Se **"Logs"**-fanen
3. Filtrer på status (200 = success, 500 = error)

### Se Edge Function-aktivitet

**CLI:**
```bash
# Sanntidslogging
npx supabase functions logs sync-to-firebase --tail

# Siste 100 entries
npx supabase functions logs sync-to-firebase --limit 100
```

**Dashboard:**
1. Edge Functions > sync-to-firebase > Logs
2. Se alle kjøringer med timestamps og output

### Varsling ved feil

Legg til Slack/Discord webhook i Edge Function:

```typescript
// I sync-to-firebase/index.ts
if (updateError) {
  // Send varsling
  await fetch(Deno.env.get('SLACK_WEBHOOK_URL')!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `⚠️ Firebase sync feilet for anlegg: ${anlegg.navn}\nFeil: ${updateError.message}`
    })
  })
  throw new Error(`Feil ved oppdatering: ${updateError.message}`)
}
```

Legg til `SLACK_WEBHOOK_URL` som secret i Edge Function settings.

---

## ✅ Verifisering

Når alt er satt opp riktig:

1. **Opprett anlegg i Kontrollportal** → Webhook trigges umiddelbart
2. **Edge Function kjører** → Logger vises i Supabase
3. **Firebase_BSVFire oppdateres** → kontrollportal_url fylles ut
4. **Total tid:** < 1 sekund

**Test komplett flyt:**

```
1. Opprett anlegg i Kontrollportal med unik_kode "VERIFY123"
2. Opprett samme anlegg i Firebase_BSVFire med unik_kode "VERIFY123"
3. Oppdater noe i Kontrollportal-anlegget
4. Sjekk at kontrollportal_url oppdateres i Firebase_BSVFire (< 1 sekund)
5. ✅ Hvis URL er oppdatert = Alt fungerer!
```

---

## 🎯 Fordeler med denne løsningen

✅ **Sanntid** - Synkronisering skjer umiddelbart (< 1 sekund)
✅ **Alt i Supabase** - Ingen eksterne servere nødvendig
✅ **Gratis** - Innenfor Supabase free tier (1M requests/måned)
✅ **Skalerbar** - Håndterer høy trafikk automatisk
✅ **Pålitelig** - Supabase håndterer retry ved feil
✅ **Enkel overvåking** - Innebygd logging i Dashboard

---

## 📚 Neste steg

1. ✅ Deploy Edge Function
2. ✅ Sett opp Database Webhook
3. ✅ Test med et anlegg
4. ✅ Overvåk logs første dagene
5. ✅ Sett opp varsling (valgfritt)

**Trenger du hjelp?**
- Sjekk Edge Function logs: `npx supabase functions logs sync-to-firebase`
- Sjekk webhook logs: Database > Webhooks > Logs
- Kjør matching-rapport: `npm run sync:report`
