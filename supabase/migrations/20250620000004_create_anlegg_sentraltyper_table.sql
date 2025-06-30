-- Opprett koblingstabell mellom anlegg og sentraltyper
CREATE TABLE "public"."anlegg_sentraltyper" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "anlegg_id" uuid NOT NULL,
    "sentraltype_id" uuid NOT NULL,
    "opprettet" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT "anlegg_sentraltyper_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "anlegg_sentraltyper_anlegg_id_fkey" FOREIGN KEY (anlegg_id) REFERENCES anlegg(id) ON DELETE CASCADE,
    CONSTRAINT "anlegg_sentraltyper_sentraltype_id_fkey" FOREIGN KEY (sentraltype_id) REFERENCES sentraltyper(id) ON DELETE CASCADE,
    CONSTRAINT "anlegg_sentraltyper_unique" UNIQUE (anlegg_id, sentraltype_id)
);

-- Sett opp tilgangsrettigheter
ALTER TABLE "public"."anlegg_sentraltyper" ENABLE ROW LEVEL SECURITY;

-- Policies for anlegg_sentraltyper
CREATE POLICY "Authenticated users can read anlegg_sentraltyper"
ON "public"."anlegg_sentraltyper"
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert anlegg_sentraltyper"
ON "public"."anlegg_sentraltyper"
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update anlegg_sentraltyper"
ON "public"."anlegg_sentraltyper"
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete anlegg_sentraltyper"
ON "public"."anlegg_sentraltyper"
FOR DELETE
TO authenticated
USING (true);

-- Legg til indekser for bedre ytelse
CREATE INDEX "anlegg_sentraltyper_anlegg_id_idx" ON "public"."anlegg_sentraltyper" (anlegg_id);
CREATE INDEX "anlegg_sentraltyper_sentraltype_id_idx" ON "public"."anlegg_sentraltyper" (sentraltype_id); 