alter table public.locations add column if not exists city text not null default 'Bengaluru';
alter table public.locations add column if not exists status text not null default 'Active';
alter table public.locations add column if not exists activity_suitability text;

create index if not exists idx_locations_status on public.locations(status);
create index if not exists idx_locations_city on public.locations(city);
create index if not exists idx_locations_updated_at on public.locations(updated_at desc);
