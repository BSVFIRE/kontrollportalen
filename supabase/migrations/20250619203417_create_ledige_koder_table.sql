create table "public"."ledige_koder" (
    "id" uuid not null default gen_random_uuid(),
    "unik_kode" text not null,
    "qr_url" text not null,
    "opprettet" timestamp with time zone not null default timezone('utc'::text, now()),
    constraint "ledige_koder_pkey" primary key ("id"),
    constraint "ledige_koder_unik_kode_key" unique ("unik_kode")
);

-- Sett opp tilgangsrettigheter
alter table "public"."ledige_koder" enable row level security;

create policy "Authenticated users can read ledige_koder"
on "public"."ledige_koder"
for select
to authenticated
using (true);

create policy "Authenticated users can insert ledige_koder"
on "public"."ledige_koder"
for insert
to authenticated
with check (true);

create policy "Authenticated users can delete ledige_koder"
on "public"."ledige_koder"
for delete
to authenticated
using (true);
