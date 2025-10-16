# 🚀 Quick Start Guide - Koble Kontrollportal og Firebase_BSVFire

## 📌 Scenario A: Anlegg finnes ALLEREDE i Firebase_BSVFire (90% av tilfellene)

Dette er den vanligste situasjonen - du har allerede anlegg registrert i Firebase_BSVFire og vil koble dem til Kontrollportal.

### Steg-for-steg:

#### 1️⃣ Sett opp QR-klistremerke på anlegget
```
🏢 Anlegg: Hovedkontor, Bedrift AS
📋 QR-klistremerke: "ABC123"
```

#### 2️⃣ Kunde/tekniker registrerer i Kontrollportal
- Skann QR-kode eller skriv inn "ABC123"
- Fyll inn anleggsinformasjon
- Lagre

**Resultat:** Anlegg opprettet i Kontrollportal med `unik_kode: "ABC123"`

#### 3️⃣ Koble til eksisterende anlegg i Firebase_BSVFire

**Metode 1: Manuell søk (hvis få anlegg)**
1. Gå til Anlegg-siden i Firebase_BSVFire
2. Søk etter "Hovedkontor"
3. Klikk "Rediger"
4. Legg inn **Unik kode**: `ABC123`
5. Lagre

**Metode 2: Bruk matching-rapport (hvis mange anlegg)**
```bash
npm run sync:report
```

Rapporten viser:
```
❓ UKOBLEDE FIREBASE_BSVFIRE ANLEGG:

   📍 Firebase: Hovedkontor
      Adresse: Storgata 1
      Unik kode: (tom - må fylles inn)

      🎯 Mulige matches:
         85% - Hovedkontor
         Unik kode: ABC123
         Navn: 85%, Adresse: 85%
```

Basert på rapporten:
1. Gå til anlegget "Hovedkontor" i Firebase_BSVFire
2. Rediger og legg inn `unik_kode: ABC123`
3. Lagre

#### 4️⃣ Synkroniser
```bash
npm run sync:firebase
```

**Output:**
```
✅ Oppdatert: Hovedkontor (ABC123)
📊 Synkronisering fullført:
   ✅ Synkronisert: 1
```

#### 5️⃣ Verifiser
1. Gå til anlegget i Firebase_BSVFire
2. Sjekk at **Kontrollportal URL** er fylt ut
3. Klikk på linken for å åpne loggboken i Kontrollportal

✅ **Ferdig!** Anlegget er nå koblet.

---

## 📌 Scenario B: Nytt anlegg (finnes IKKE i Firebase_BSVFire)

Dette er når du skal opprette et helt nytt anlegg.

### Steg-for-steg:

#### 1️⃣ Sett opp QR-klistremerke
```
📋 QR-klistremerke: "XYZ789"
```

#### 2️⃣ Kunde/tekniker registrerer i Kontrollportal
- Skann QR-kode → "XYZ789"
- Fyll inn anleggsinformasjon
- Lagre

**Resultat:** Anlegg opprettet i Kontrollportal

#### 3️⃣ Opprett anlegg i Firebase_BSVFire
1. Gå til Anlegg → "Nytt anlegg"
2. Velg **Kunde**
3. Fyll inn:
   - Anleggsnavn
   - Adresse
   - Kontroll_type
   - **Unik kode**: `XYZ789` ← Fra klistremerket
4. Lagre

#### 4️⃣ Synkroniser
```bash
npm run sync:firebase
```

#### 5️⃣ Verifiser
Sjekk at **Kontrollportal URL** er fylt ut i Firebase_BSVFire

✅ **Ferdig!** Anlegget er koblet.

---

## 🔄 Bulk-kobling av mange anlegg

Hvis du har mange eksisterende anlegg som skal kobles:

### 1. Generer matching-rapport
```bash
npm run sync:report
```

### 2. Gå gjennom rapporten
Rapporten foreslår matches basert på navn og adresse:
- ✅ Koblede anlegg (allerede ferdig)
- ❓ Ukoblede anlegg med forslag
- ❌ Ukoblede uten forslag

### 3. Koble anlegg manuelt
For hvert anlegg:
1. Noter `unik_kode` fra rapporten
2. Finn anlegget i Firebase_BSVFire
3. Rediger og legg inn `unik_kode`
4. Lagre

### 4. Synkroniser alle
```bash
npm run sync:firebase
```

---

## 💡 Tips og triks

### Finn anlegg som mangler unik_kode

Kjør denne SQL-spørringen i Firebase_BSVFire:

```sql
SELECT 
  anleggsnavn,
  adresse,
  poststed
FROM anlegg
WHERE unik_kode IS NULL OR unik_kode = ''
ORDER BY anleggsnavn;
```

### Automatisk synkronisering

**Raskeste måte (GitHub Actions):**

1. Opprett `.github/workflows/sync-firebase.yml`:
```yaml
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
      - run: npm install
      - run: npm run sync:firebase
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          FIREBASE_SUPABASE_URL: ${{ secrets.FIREBASE_SUPABASE_URL }}
          FIREBASE_SUPABASE_SERVICE_KEY: ${{ secrets.FIREBASE_SUPABASE_SERVICE_KEY }}
```

2. Legg til secrets i GitHub (Settings > Secrets)

✅ Synkronisering kjører nå automatisk hver 15. minutt!

**Se AUTO_SYNC.md for flere alternativer:**
- Database Webhook (sanntid)
- Cron job på server
- Vercel Cron Jobs

### Verifiser kobling

Sjekk om et anlegg er koblet:

```sql
-- I Firebase_BSVFire
SELECT 
  anleggsnavn,
  unik_kode,
  kontrollportal_url
FROM anlegg
WHERE unik_kode = 'ABC123';
```

---

## ❓ Vanlige spørsmål

### Hva hvis jeg legger inn feil unik_kode?

Bare rediger anlegget og rett opp koden. Kjør synkronisering på nytt.

### Kan jeg endre unik_kode senere?

Ja, du kan endre den når som helst. Neste synkronisering vil bruke den nye koden.

### Hva hvis to anlegg har samme unik_kode?

Dette skal ikke være mulig (UNIQUE constraint). Hvis det skjer, vil synkroniseringen feile.

### Må jeg kjøre synkronisering manuelt?

Nei, du kan sette opp automatisk synkronisering via webhook eller cron-job. Se SETUP.md for detaljer.

---

## 📚 Mer informasjon

- **SETUP.md** - Detaljert oppsettsinstruksjoner
- **MATCHING_STRATEGY.md** - Matching-strategier og sikkerhet
- **README.md** - Teknisk dokumentasjon
