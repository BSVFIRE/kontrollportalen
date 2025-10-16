# ✅ Oppsett-sjekkliste: Database Webhook

## 📋 Pre-setup (Gjør først)

- [ ] Har tilgang til **Kontrollportal Supabase Dashboard**
- [ ] Har tilgang til **Firebase_BSVFire Supabase Dashboard**
- [ ] Har Supabase CLI installert: `npm install -g supabase`
- [ ] Er logget inn på Supabase CLI: `npx supabase login`

---

## 🔧 Steg 1: Hent Firebase credentials

- [ ] Gå til **Firebase_BSVFire Supabase Dashboard**
- [ ] Settings > API
- [ ] Kopier **service_role** key (den lange)
- [ ] Lagre den et trygt sted (trenger den i neste steg)

---

## 🚀 Steg 2: Deploy Edge Function

```bash
cd /Users/eriksebastianskille/Documents/Kontrollportal/kontrollportalen
```

- [ ] Kjør: `npx supabase link --project-ref [din-project-ref]`
  - Finn project-ref: Kontrollportal Dashboard > Settings > General > Reference ID
- [ ] Kjør: `npx supabase functions deploy sync-to-firebase`
- [ ] Verifiser: Se "Deployed successfully" melding
- [ ] Kopier Edge Function URL: `https://[project-ref].supabase.co/functions/v1/sync-to-firebase`

---

## 🔑 Steg 3: Sett miljøvariabler

- [ ] Gå til **Kontrollportal Supabase Dashboard**
- [ ] Edge Functions > sync-to-firebase > Settings
- [ ] Klikk **"Add new secret"**
- [ ] Legg til:
  - [ ] `FIREBASE_SUPABASE_URL` = `https://snyzduzqyjsllzvwuahh.supabase.co`
  - [ ] `FIREBASE_SUPABASE_SERVICE_KEY` = [service_role key fra steg 1]
- [ ] Klikk **"Save"**

---

## 🔗 Steg 4: Opprett Database Webhook

- [ ] Gå til **Kontrollportal Supabase Dashboard**
- [ ] Database > Webhooks
- [ ] Klikk **"Enable Webhooks"** (hvis ikke allerede aktivert)
- [ ] Klikk **"Create a new hook"**
- [ ] Fyll ut:
  - [ ] Name: `firebase-sync-anlegg`
  - [ ] Table: `anlegg`
  - [ ] Events: ✓ INSERT, ✓ UPDATE (ikke DELETE)
  - [ ] Type: `Supabase Edge Functions`
  - [ ] Edge Function: `sync-to-firebase`
- [ ] Klikk **"Create webhook"**

---

## 🧪 Steg 5: Test oppsettet

### Test 1: Webhook logger

- [ ] Database > Webhooks > firebase-sync-anlegg
- [ ] Klikk **"Send test event"**
- [ ] Sjekk at status er **200 OK** i Logs

### Test 2: Edge Function logger

```bash
npx supabase functions logs sync-to-firebase --tail
```

- [ ] Se at funksjonen kjører uten feil

### Test 3: Komplett flyt

- [ ] Opprett testanlegg i Kontrollportal med `unik_kode: "TEST123"`
- [ ] Opprett samme anlegg i Firebase_BSVFire med `unik_kode: "TEST123"`
- [ ] Oppdater noe i Kontrollportal-anlegget
- [ ] Sjekk at `kontrollportal_url` oppdateres i Firebase_BSVFire (< 1 sekund)

---

## ✅ Verifisering

Når alt fungerer:

- [ ] Webhook trigges automatisk ved INSERT/UPDATE
- [ ] Edge Function kjører uten feil
- [ ] Firebase_BSVFire oppdateres umiddelbart
- [ ] Logs viser success (200 OK)

---

## 🎯 Ferdig!

Gratulerer! 🎉 Synkroniseringen er nå satt opp og kjører automatisk.

**Neste gang et anlegg opprettes eller oppdateres i Kontrollportal:**
→ Firebase_BSVFire oppdateres automatisk innen 1 sekund!

---

## 📞 Trenger du hjelp?

**Sjekk logs:**
```bash
# Edge Function logs
npx supabase functions logs sync-to-firebase

# Webhook logs
# Dashboard > Database > Webhooks > firebase-sync-anlegg > Logs
```

**Kjør matching-rapport:**
```bash
npm run sync:report
```

**Les dokumentasjon:**
- `WEBHOOK_SETUP_GUIDE.md` - Detaljert guide
- `AUTO_SYNC.md` - Alle synkroniseringsmetoder
- `QUICK_START.md` - Kom i gang raskt
