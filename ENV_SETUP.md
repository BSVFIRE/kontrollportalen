# Miljøvariabler for Kontrollportal

Opprett en `.env.local` fil i rot-mappen med følgende innhold:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Supabase Service Role (for API routes)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Firebase Synkronisering
FIREBASE_SYNC_API_KEY=your-secret-api-key-here
```

## Hvor finner du verdiene?

### Supabase URL og Anon Key
1. Gå til Supabase Dashboard
2. Settings > API
3. Kopier **Project URL** og **anon public** key

### Service Role Key
1. Gå til Supabase Dashboard
2. Settings > API
3. Kopier **service_role** key (IKKE anon key!)
4. ⚠️ **VIKTIG:** Denne gir full tilgang - hold den hemmelig!

### Firebase Sync API Key
Generer en tilfeldig streng:
```bash
openssl rand -base64 32
```

Eller bruk: https://generate-random.org/api-key-generator

**Samme API key må også legges inn i Firebase_BSVFire `.env.local`**
