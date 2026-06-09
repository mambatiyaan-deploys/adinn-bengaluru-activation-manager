create extension if not exists pgcrypto;

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'Other',
  city text not null default 'Bengaluru',
  status text not null default 'Active',
  direction text,
  name text not null,
  area text,
  address text,
  pincode text,
  google_link text,
  latitude numeric,
  longitude numeric,
  gps_location text,
  contact_name text,
  phone text,
  email text,
  rate text,
  footfall numeric,
  units numeric,
  occupied numeric,
  occupancy text,
  gst_applicable text,
  activity_suitability text,
  notes text,
  source_sheet text,
  source_row integer,
  extra jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.locations add column if not exists city text not null default 'Bengaluru';
alter table public.locations add column if not exists status text not null default 'Active';
alter table public.locations add column if not exists activity_suitability text;

create index if not exists idx_locations_category on public.locations(category);
create index if not exists idx_locations_area on public.locations(area);
create index if not exists idx_locations_direction on public.locations(direction);
create index if not exists idx_locations_status on public.locations(status);
create index if not exists idx_locations_city on public.locations(city);
create index if not exists idx_locations_updated_at on public.locations(updated_at desc);
create index if not exists idx_locations_latitude on public.locations(latitude);
create index if not exists idx_locations_longitude on public.locations(longitude);
create index if not exists idx_locations_search on public.locations using gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(area, '') || ' ' || coalesce(address, '') || ' ' || coalesce(notes, '')));

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_locations_updated_at on public.locations;
create trigger trg_locations_updated_at
before update on public.locations
for each row execute function public.set_updated_at();

alter table public.locations enable row level security;

drop policy if exists "Service role can manage locations" on public.locations;
create policy "Service role can manage locations"
on public.locations
for all
using (true)
with check (true);

-- V4 compatibility columns for projects created from older schemas.
alter table public.locations add column if not exists google_link text;
alter table public.locations add column if not exists latitude numeric;
alter table public.locations add column if not exists longitude numeric;
alter table public.locations add column if not exists gps_location text;
alter table public.locations add column if not exists rate text;
alter table public.locations add column if not exists footfall numeric;
alter table public.locations add column if not exists units numeric;
alter table public.locations add column if not exists occupied numeric;
alter table public.locations add column if not exists occupancy text;
alter table public.locations add column if not exists gst_applicable text;
alter table public.locations add column if not exists activity_suitability text;
notify pgrst, 'reload schema';
