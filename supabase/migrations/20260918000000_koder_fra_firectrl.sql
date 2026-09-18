-- Koder fødes nå i FireCtrl og kobles til anlegg der. Portalen mottar kode → anlegg via
-- /api/koder/koble. Et anlegg kan ha flere koder (én etikett per sentral).
--
-- anlegg.unik_kode beholdes som «første kode» for bakoverkompatibilitet.

create table if not exists koder (
  kode                text primary key check (kode ~ '^[A-Z0-9]{8}$'),
  anlegg_id           uuid not null references anlegg(id) on delete cascade,
  firectrl_anlegg_id  uuid,                   -- id i FireCtrl, brukes til å finne igjen samme anlegg
  merkelapp           text,
  opprettet           timestamptz not null default now(),
  oppdatert           timestamptz not null default now()
);

create index if not exists idx_koder_anlegg on koder(anlegg_id);
create index if not exists idx_koder_firectrl on koder(firectrl_anlegg_id);

alter table koder enable row level security;

-- Alle (også uinnloggede som skanner) kan lese kode → anlegg. Skriving kun via service role (API-ruten).
create policy "Alle kan lese koder" on koder for select to anon, authenticated using (true);

-- Eksisterende anlegg får sin unik_kode som første kode
insert into koder (kode, anlegg_id, merkelapp)
select upper(unik_kode), id, 'Sentral 1'
from anlegg
where unik_kode is not null and upper(unik_kode) ~ '^[A-Z0-9]{8}$'
on conflict (kode) do nothing;

-- Slår opp anlegg for en kode: ny koder-tabell først, deretter gammel anlegg.unik_kode.
-- Brukes av alle sidene i portalen (anlegg, logg, registrer-hendelse, velg-type).
create or replace function public.anlegg_for_kode(p_kode text)
returns setof anlegg
language sql stable security definer set search_path = public as $$
  select a.* from koder k join anlegg a on a.id = k.anlegg_id where k.kode = upper(p_kode)
  union all
  select a.* from anlegg a
  where a.unik_kode = upper(p_kode)
    and not exists (select 1 from koder k where k.kode = upper(p_kode))
  limit 1;
$$;

grant execute on function public.anlegg_for_kode(text) to anon, authenticated;
