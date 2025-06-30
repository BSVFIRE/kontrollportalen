-- Opprett tabeller for PDF-bank

-- Leverandører
CREATE TABLE "public"."leverandorer" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "navn" text NOT NULL,
    "opprettet" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT "leverandorer_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "leverandorer_navn_key" UNIQUE ("navn")
);

-- Sentraltyper
CREATE TABLE "public"."sentraltyper" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "leverandor_id" uuid NOT NULL,
    "navn" text NOT NULL,
    "opprettet" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT "sentraltyper_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sentraltyper_leverandor_id_fkey" FOREIGN KEY (leverandor_id) REFERENCES leverandorer(id) ON DELETE CASCADE
);

-- PDF-dokumenter
CREATE TABLE "public"."pdf_dokumenter" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "sentraltype_id" uuid NOT NULL,
    "anleggs_type" text NOT NULL,
    "tittel" text NOT NULL,
    "filnavn" text NOT NULL,
    "storage_path" text NOT NULL,
    "fil_storrelse" integer,
    "opprettet" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT "pdf_dokumenter_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "pdf_dokumenter_sentraltype_id_fkey" FOREIGN KEY (sentraltype_id) REFERENCES sentraltyper(id) ON DELETE CASCADE
);

-- Sett opp tilgangsrettigheter
ALTER TABLE "public"."leverandorer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."sentraltyper" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."pdf_dokumenter" ENABLE ROW LEVEL SECURITY;

-- Policies for leverandorer
CREATE POLICY "Authenticated users can read leverandorer"
ON "public"."leverandorer"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert leverandorer"
ON "public"."leverandorer"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update leverandorer"
ON "public"."leverandorer"
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete leverandorer"
ON "public"."leverandorer"
FOR DELETE
TO authenticated
USING (true);

-- Policies for sentraltyper
CREATE POLICY "Authenticated users can read sentraltyper"
ON "public"."sentraltyper"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert sentraltyper"
ON "public"."sentraltyper"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update sentraltyper"
ON "public"."sentraltyper"
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete sentraltyper"
ON "public"."sentraltyper"
FOR DELETE
TO authenticated
USING (true);

-- Policies for pdf_dokumenter
CREATE POLICY "Authenticated users can read pdf_dokumenter"
ON "public"."pdf_dokumenter"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert pdf_dokumenter"
ON "public"."pdf_dokumenter"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update pdf_dokumenter"
ON "public"."pdf_dokumenter"
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete pdf_dokumenter"
ON "public"."pdf_dokumenter"
FOR DELETE
TO authenticated
USING (true);

-- Legg til noen eksempel-leverandører
INSERT INTO "public"."leverandorer" (navn) VALUES 
('Siemens'),
('Honeywell'),
('Notifier'),
('Esser'),
('Autronica');

-- Legg til noen eksempel-sentraltyper
INSERT INTO "public"."sentraltyper" (leverandor_id, navn) VALUES 
((SELECT id FROM leverandorer WHERE navn = 'Siemens'), 'FS20'),
((SELECT id FROM leverandorer WHERE navn = 'Siemens'), 'FS250'),
((SELECT id FROM leverandorer WHERE navn = 'Honeywell'), 'XLS'),
((SELECT id FROM leverandorer WHERE navn = 'Notifier'), 'NFS2-3030'),
((SELECT id FROM leverandorer WHERE navn = 'Esser'), 'IQ8'); 