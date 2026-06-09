-- Adds GPS support to V5 Enhanced. Safe to run repeatedly.
alter table public.locations add column if not exists latitude numeric;
alter table public.locations add column if not exists longitude numeric;
alter table public.locations add column if not exists gps_location text;
create index if not exists idx_locations_latitude on public.locations(latitude);
create index if not exists idx_locations_longitude on public.locations(longitude);
notify pgrst, 'reload schema';
