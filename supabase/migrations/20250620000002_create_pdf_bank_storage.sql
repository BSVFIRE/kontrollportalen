-- Opprett Storage bucket for PDF-bank
-- Dette må kjøres manuelt i Supabase Dashboard eller via CLI

-- For å opprette bucket via SQL (hvis tilgjengelig):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('pdf-bank', 'pdf-bank', true);

-- Sett opp RLS policies for storage bucket
-- Dette må gjøres manuelt i Supabase Dashboard

-- Eksempel på policies som må settes opp:
-- 1. Authenticated users can read pdf-bank bucket
-- 2. Authenticated users can upload to pdf-bank bucket
-- 3. Authenticated users can delete from pdf-bank bucket

-- Merk: Storage bucket opprettes vanligvis via Supabase Dashboard eller CLI
-- SQL-migrationen over er kun for dokumentasjon 