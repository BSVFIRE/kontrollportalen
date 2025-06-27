create table "public"."anlegg_ikke_linket" (
    "id" uuid not null default gen_random_uuid(),
    "navn" text not null,
    "adresse" text,
    "opprettet" timestamp with time zone not null default timezone('utc'::text, now()),
    constraint "anlegg_ikke_linket_pkey" primary key ("id")
);

-- Sett opp tilgangsrettigheter
alter table "public"."anlegg_ikke_linket" enable row level security;

create policy "Authenticated users can read anlegg_ikke_linket"
on "public"."anlegg_ikke_linket"
for select
to authenticated
using (true);

create policy "Authenticated users can insert anlegg_ikke_linket"
on "public"."anlegg_ikke_linket"
for insert
to authenticated
with check (true);

create policy "Authenticated users can delete anlegg_ikke_linket"
on "public"."anlegg_ikke_linket"
for delete
to authenticated
using (true); 