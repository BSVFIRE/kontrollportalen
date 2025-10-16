# Matching-strategi for Anlegg

## 🎯 Problemet

Hvordan sikrer vi at riktig `unik_kode` fra Kontrollportal kobles til riktig anlegg i Firebase_BSVFire?

## 📌 To scenarioer

### Scenario A: Anlegg finnes ALLEREDE i Firebase_BSVFire
- Anlegget er registrert med kunde, navn, adresse
- Mangler kun `unik_kode` og `kontrollportal_url`
- **Løsning**: Legg til `unik_kode` på eksisterende anlegg

### Scenario B: Nytt anlegg (finnes ikke i Firebase_BSVFire)
- Anlegget må opprettes fra scratch
- Krever kunde-kobling
- **Løsning**: Opprett anlegg med `unik_kode` fra start

## ✅ Løsning: Manuell kobling via unik_kode

### Strategi 1: Manuell kobling (Anbefalt)

**Korrekt arbeidsflyt:**

1. **QR-klistremerke settes opp på brannsentralen:**
   - Klistremerket har en unik kode (f.eks. "ABC123")
   - Koden er forhåndsgenerert i Kontrollportal (ledige_koder tabell)

2. **Kunde/tekniker skanner QR-kode og registrerer i Kontrollportal:**
   - Skann QR-kode eller skriv inn unik kode "ABC123"
   - Fyll inn anleggsnavn, adresse, type_logg
   - Lagre - anlegget opprettes i Kontrollportal med `unik_kode: "ABC123"`

3. **Opprett samme anlegg i Firebase_BSVFire:**
   - Velg kunde
   - Fyll inn anleggsnavn, adresse, kontroll_type
   - **Legg inn samme `unik_kode`: "ABC123"** (fra klistremerket)
   - Lagre

4. **Synkronisering skjer automatisk:**
   - Når anlegget oppdateres i Kontrollportal
   - Eller kjør manuell synkronisering: `npm run sync:firebase`
   - Firebase_BSVFire får automatisk `kontrollportal_url` oppdatert
   - Kobling er etablert! ✅

**Alternativ flyt (hvis anlegg allerede finnes i Firebase_BSVFire):**

1. **Anlegg finnes allerede i Firebase_BSVFire** (uten unik_kode)
2. **QR-kode settes opp og registreres i Kontrollportal** (unik_kode: "ABC123")
3. **Koble manuelt:**
   - Rediger anlegget i Firebase_BSVFire
   - Legg inn `unik_kode: "ABC123"` (fra klistremerket)
   - Lagre
4. **Synkronisering** oppdaterer `kontrollportal_url` automatisk

### Strategi 2: Matching basert på navn og adresse (Automatisk, men risikabelt)

**⚠️ Ikke anbefalt** - kan føre til feil koblinger hvis flere anlegg har lignende navn.

### Strategi 3: Import-script med mapping-fil (For bulk-import)

Hvis du har mange eksisterende anlegg som skal kobles:

1. **Eksporter anlegg fra begge systemer**
2. **Opprett en mapping-fil** (CSV/JSON)
3. **Kjør import-script** som kobler basert på mapping

## 🔒 Sikkerhetstiltak

### 1. Validering før synkronisering

Synkroniseringen sjekker alltid:
- ✅ Anlegget finnes i Firebase_BSVFire med samme `unik_kode`
- ✅ Kun eksisterende anlegg oppdateres (nye opprettes ikke)
- ✅ Kun `unik_kode` og `kontrollportal_url` oppdateres

### 2. Unik kode må være unik

- Hver `unik_kode` må være unik i begge systemer
- Kontrollportal har allerede `UNIQUE` constraint på `unik_kode`
- Firebase_BSVFire har indeks på `unik_kode` for rask søk

### 3. Logging og verifisering

Synkroniseringsskriptet logger:
- ✅ Hvilke anlegg som oppdateres
- ⏭️ Hvilke anlegg som hoppes over
- ❌ Eventuelle feil

## 📋 Anbefalt arbeidsflyt (Steg-for-steg)

### Scenario A: Anlegg finnes ALLEREDE i Firebase_BSVFire (Mest vanlig)

```
1. Anlegg finnes allerede i Firebase_BSVFire:
   - Kunde: "Bedrift AS"
   - Anleggsnavn: "Hovedkontor"
   - Adresse: "Storgata 1"
   - Unik kode: (tom) ← Mangler

2. QR-klistremerke "ABC123" settes på brannsentralen

3. Kunde/tekniker registrerer i Kontrollportal:
   - Skann QR-kode → "ABC123"
   - Fyll inn navn, adresse, type
   - Lagre → Anlegg opprettet i Kontrollportal

4. Koble til eksisterende anlegg i Firebase_BSVFire:
   - Finn anlegget "Hovedkontor" (bruk matching-rapport hvis mange anlegg)
   - Rediger anlegget
   - Legg inn unik kode: "ABC123" ← Fra klistremerket
   - Lagre

5. Synkronisering:
   - Kjør `npm run sync:firebase`
   - kontrollportal_url oppdateres automatisk
   - ✅ Kobling etablert!
```

### Scenario B: Nytt anlegg (finnes IKKE i Firebase_BSVFire):

```
1. QR-klistremerke med unik kode "XYZ789" settes på brannsentralen

2. Kunde/tekniker skanner QR og registrerer i Kontrollportal:
   - Kode: "XYZ789" (automatisk fra QR)
   - Navn: "Hovedkontor"
   - Adresse: "Storgata 1"
   - Type: Brannalarm, Nødlys
   - Lagre → Anlegg opprettet i Kontrollportal

3. Opprett samme anlegg i Firebase_BSVFire:
   - Kunde: "Bedrift AS"
   - Anleggsnavn: "Hovedkontor"
   - Adresse: "Storgata 1"
   - Kontroll_type: Brannalarm, Nødlys
   - Unik kode: "XYZ789" ← Skriv inn koden fra klistremerket
   - Lagre

4. Synkronisering:
   - Kjør automatisk eller manuelt
   - Firebase_BSVFire får nå kontrollportal_url
   - Kobling er etablert! ✅
```


## 🛠️ Verktøy for å hjelpe med kobling

### Matching-rapport script

Jeg kan lage et script som:
1. Henter alle anlegg fra begge systemer
2. Foreslår mulige matches basert på navn/adresse
3. Genererer en rapport du kan bruke for manuell kobling

Vil du at jeg lager dette?

## ❓ Vanlige spørsmål

### Hva skjer hvis jeg legger inn feil unik_kode?

- Synkroniseringen vil oppdatere feil anlegg
- **Løsning**: Rett opp `unik_kode` i Firebase_BSVFire og kjør synkronisering på nytt

### Kan jeg endre unik_kode senere?

- Ja, du kan endre `unik_kode` i Firebase_BSVFire når som helst
- Neste synkronisering vil bruke den nye koden

### Hva hvis to anlegg har samme unik_kode?

- Dette skal ikke være mulig (UNIQUE constraint)
- Hvis det skjer, vil synkroniseringen feile med feilmelding

### Kan jeg se hvilke anlegg som mangler unik_kode?

Ja, kjør denne SQL-spørringen i Firebase_BSVFire:

```sql
SELECT 
  id,
  anleggsnavn,
  adresse,
  kundenr
FROM anlegg
WHERE unik_kode IS NULL OR unik_kode = ''
ORDER BY anleggsnavn;
```

## 🎯 Konklusjon

**Anbefalt tilnærming:**

1. ✅ **Manuell kobling** - Legg inn `unik_kode` manuelt i Firebase_BSVFire
2. ✅ **Verifiser** - Sjekk at koden er riktig før du lagrer
3. ✅ **Synkroniser** - La systemet automatisk holde `kontrollportal_url` oppdatert

Dette gir full kontroll og minimerer risiko for feil koblinger.
