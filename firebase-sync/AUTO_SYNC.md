# 🔄 Automatisk Synkronisering

## 📌 Oversikt

Synkroniseringen kan kjøres **helt automatisk** på to måter:

1. **Database Webhook** (Sanntid) - Synkroniserer umiddelbart når anlegg opprettes/oppdateres
2. **Cron Job** (Periodisk) - Synkroniserer hvert X minutt/time

## ⚡ Metode 1: Database Webhook (Anbefalt - Sanntid)

Synkroniserer **umiddelbart** når noe endres i Kontrollportal.

### Oppsett:

#### Steg 1: Sett opp Database Webhook i Kontrollportal Supabase

1. Gå til **Kontrollportal Supabase Dashboard**
2. Naviger til **Database > Webhooks**
3. Klikk **"Create a new hook"**
4. Konfigurer:

```
Name: firebase-sync-anlegg
Table: anlegg
Events: ✓ INSERT, ✓ UPDATE
Type: HTTP Request
Method: POST
URL: https://[din-server]/api/sync-webhook
Headers:
  Content-Type: application/json
  Authorization: Bearer [SECRET_KEY]
```

#### Steg 2: Opprett webhook-endepunkt

Du trenger en server som mottar webhook og kjører synkroniseringen.

**Alternativ A: Bruk Supabase Edge Function**

Opprett en Edge Function i Kontrollportal som sender data til Firebase_BSVFire:

```typescript
// supabase/functions/sync-to-firebase/index.ts
// (Allerede opprettet!)
```

Deploy:
```bash
supabase functions deploy sync-to-firebase
```

Sett miljøvariabler i Supabase Dashboard:
- `FIREBASE_SUPABASE_URL`
- `FIREBASE_SUPABASE_SERVICE_KEY`

Oppdater webhook URL til:
```
https://[kontrollportal-project].supabase.co/functions/v1/sync-to-firebase
```

**Alternativ B: Bruk egen server (Node.js/Express)**

```typescript
// server.ts
import express from 'express'
import { createClient } from '@supabase/supabase-js'

const app = express()
app.use(express.json())

const firebaseClient = createClient(
  process.env.FIREBASE_SUPABASE_URL!,
  process.env.FIREBASE_SUPABASE_SERVICE_KEY!
)

app.post('/api/sync-webhook', async (req, res) => {
  const { type, record } = req.body
  
  // Verifiser authorization
  if (req.headers.authorization !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  if (type === 'INSERT' || type === 'UPDATE') {
    const kontrollportalUrl = record.qr_url || 
      `https://kontrollportal.no/logg?kode=${record.unik_kode}`
    
    // Finn anlegg i Firebase_BSVFire
    const { data: existingAnlegg } = await firebaseClient
      .from('anlegg')
      .select('*')
      .eq('unik_kode', record.unik_kode)
      .maybeSingle()
    
    if (existingAnlegg) {
      // Oppdater
      await firebaseClient
        .from('anlegg')
        .update({
          unik_kode: record.unik_kode,
          kontrollportal_url: kontrollportalUrl,
          sist_oppdatert: new Date().toISOString()
        })
        .eq('id', existingAnlegg.id)
      
      console.log('✅ Synkronisert:', record.navn)
    }
  }
  
  res.json({ success: true })
})

app.listen(3000)
```

### Resultat:

```
Anlegg oppdateres i Kontrollportal
         ↓ (umiddelbart)
Webhook trigges
         ↓ (< 1 sekund)
Firebase_BSVFire oppdateres
         ↓
✅ Ferdig!
```

**Fordeler:**
- ⚡ Sanntid (< 1 sekund forsinkelse)
- 🎯 Kun endringer synkroniseres
- 🔒 Sikker (webhook med authorization)

**Ulemper:**
- 🛠️ Krever server eller Edge Function
- 🔧 Litt mer kompleks oppsett

---

## 🕐 Metode 2: Cron Job (Enklere - Periodisk)

Synkroniserer **hvert X minutt/time**.

### Oppsett:

#### Alternativ A: Cron på server (Linux/Mac)

```bash
# Rediger crontab
crontab -e

# Legg til (synkroniser hver time)
0 * * * * cd /Users/eriksebastianskille/Documents/Kontrollportal/kontrollportalen && npm run sync:firebase >> /var/log/firebase-sync.log 2>&1

# Eller hvert 15. minutt
*/15 * * * * cd /Users/eriksebastianskille/Documents/Kontrollportal/kontrollportalen && npm run sync:firebase >> /var/log/firebase-sync.log 2>&1
```

#### Alternativ B: GitHub Actions (Gratis)

Opprett `.github/workflows/sync-firebase.yml`:

```yaml
name: Sync Firebase

on:
  schedule:
    # Kjør hver time
    - cron: '0 * * * *'
  workflow_dispatch: # Tillat manuell kjøring

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run sync
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          FIREBASE_SUPABASE_URL: ${{ secrets.FIREBASE_SUPABASE_URL }}
          FIREBASE_SUPABASE_SERVICE_KEY: ${{ secrets.FIREBASE_SUPABASE_SERVICE_KEY }}
        run: npm run sync:firebase
```

Legg til secrets i GitHub:
- Settings > Secrets and variables > Actions
- Legg til alle miljøvariabler

#### Alternativ C: Vercel Cron Jobs

Hvis du deployer til Vercel, bruk Vercel Cron:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/sync-firebase",
      "schedule": "0 * * * *"
    }
  ]
}
```

```typescript
// pages/api/sync-firebase.ts
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  // Verifiser at det er Vercel Cron som kaller
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  // Kjør synkronisering
  const kontrollportalClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const firebaseClient = createClient(
    process.env.FIREBASE_SUPABASE_URL!,
    process.env.FIREBASE_SUPABASE_SERVICE_KEY!
  )
  
  // Hent anlegg fra Kontrollportal
  const { data: kpAnlegg } = await kontrollportalClient
    .from('anlegg')
    .select('*')
  
  let synced = 0
  
  for (const kp of kpAnlegg || []) {
    const { data: fbAnlegg } = await firebaseClient
      .from('anlegg')
      .select('*')
      .eq('unik_kode', kp.unik_kode)
      .maybeSingle()
    
    if (fbAnlegg) {
      await firebaseClient
        .from('anlegg')
        .update({
          unik_kode: kp.unik_kode,
          kontrollportal_url: kp.qr_url || `https://kontrollportal.no/logg?kode=${kp.unik_kode}`,
          sist_oppdatert: new Date().toISOString()
        })
        .eq('id', fbAnlegg.id)
      
      synced++
    }
  }
  
  res.json({ success: true, synced })
}
```

### Resultat:

```
Hver time (eller hvert 15. minutt):
         ↓
Cron job kjører
         ↓
Synkroniseringsskript kjører
         ↓
Alle endringer synkroniseres
         ↓
✅ Ferdig!
```

**Fordeler:**
- ✅ Enkel å sette opp
- 🔧 Ingen server nødvendig (med GitHub Actions)
- 📊 Enkel logging

**Ulemper:**
- ⏱️ Forsinkelse (opp til 1 time)
- 🔄 Synkroniserer alt hver gang (ikke bare endringer)

---

## 🎯 Anbefaling

### For produksjon:
**Metode 1: Database Webhook** med Supabase Edge Function
- Sanntid synkronisering
- Mest effektiv
- Profesjonell løsning

### For utvikling/testing:
**Metode 2: Cron Job** med GitHub Actions
- Enklere å sette opp
- Gratis
- God nok for de fleste brukstilfeller

---

## 🔍 Overvåking og logging

### Webhook-logging

Sjekk webhook-logger i Supabase Dashboard:
```
Database > Webhooks > [din webhook] > Logs
```

### Cron-logging

Sjekk loggen:
```bash
tail -f /var/log/firebase-sync.log
```

Eller i GitHub Actions:
```
Actions > Sync Firebase > [latest run]
```

### Varsling ved feil

Legg til Slack/Discord webhook for varsling:

```typescript
// I synkroniseringsskriptet
if (errors > 0) {
  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `⚠️ Firebase sync feilet: ${errors} feil`
    })
  })
}
```

---

## 📊 Sammenligning

| Funksjon | Webhook (Sanntid) | Cron (Periodisk) |
|----------|-------------------|------------------|
| Forsinkelse | < 1 sekund | 15 min - 1 time |
| Kompleksitet | Middels | Enkel |
| Kostnad | Gratis* | Gratis |
| Effektivitet | Høy (kun endringer) | Lav (alt hver gang) |
| Pålitelighet | Høy | Middels |
| Anbefalt for | Produksjon | Utvikling/Testing |

*Gratis med Supabase Edge Functions (innenfor free tier)

---

## 🚀 Quick Start

### Raskeste vei til automatisk synkronisering:

**1. Sett opp GitHub Actions (5 minutter):**

```bash
# 1. Opprett workflow-fil
mkdir -p .github/workflows
cat > .github/workflows/sync-firebase.yml << 'EOF'
name: Sync Firebase
on:
  schedule:
    - cron: '*/15 * * * *'  # Hver 15. minutt
  workflow_dispatch:
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run sync:firebase
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          FIREBASE_SUPABASE_URL: ${{ secrets.FIREBASE_SUPABASE_URL }}
          FIREBASE_SUPABASE_SERVICE_KEY: ${{ secrets.FIREBASE_SUPABASE_SERVICE_KEY }}
EOF

# 2. Commit og push
git add .github/workflows/sync-firebase.yml
git commit -m "Add automatic Firebase sync"
git push

# 3. Legg til secrets i GitHub
# Settings > Secrets and variables > Actions
```

**2. Test:**
```
GitHub > Actions > Sync Firebase > Run workflow
```

✅ **Ferdig!** Synkronisering kjører nå automatisk hver 15. minutt.
