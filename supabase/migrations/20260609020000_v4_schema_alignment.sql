-- V4 schema alignment for databases that were first created from earlier project versions.
-- Earlier versions used names like footfall_text, rate_text and google_map_link.
-- The current app uses clean CRUD columns like footfall, rate and google_link.

alter table public.locations add column if not exists category text default 'Other';
alter table public.locations add column if not exists city text not null default 'Bengaluru';
alter table public.locations add column if not exists status text not null default 'Active';
alter table public.locations add column if not exists direction text;
alter table public.locations add column if not exists name text;
alter table public.locations add column if not exists area text;
alter table public.locations add column if not exists address text;
alter table public.locations add column if not exists pincode text;
alter table public.locations add column if not exists google_link text;
alter table public.locations add column if not exists contact_name text;
alter table public.locations add column if not exists phone text;
alter table public.locations add column if not exists email text;
alter table public.locations add column if not exists rate text;
alter table public.locations add column if not exists footfall numeric;
alter table public.locations add column if not exists units numeric;
alter table public.locations add column if not exists occupied numeric;
alter table public.locations add column if not exists occupancy text;
alter table public.locations add column if not exists gst_applicable text;
alter table public.locations add column if not exists activity_suitability text;
alter table public.locations add column if not exists notes text;
alter table public.locations add column if not exists source_sheet text;
alter table public.locations add column if not exists source_row integer;
alter table public.locations add column if not exists extra jsonb default '{}'::jsonb;
alter table public.locations add column if not exists created_at timestamptz not null default now();
alter table public.locations add column if not exists updated_at timestamptz not null default now();

-- Copy useful data from legacy columns if those columns exist.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'locations' and column_name = 'google_map_link') then
    update public.locations set google_link = coalesce(google_link, google_map_link) where google_link is null;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'locations' and column_name = 'rate_text') then
    update public.locations set rate = coalesce(rate, rate_text) where rate is null;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'locations' and column_name = 'occupancy_text') then
    update public.locations set occupancy = coalesce(occupancy, occupancy_text) where occupancy is null;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'locations' and column_name = 'gst_text') then
    update public.locations set gst_applicable = coalesce(gst_applicable, gst_text) where gst_applicable is null;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'locations' and column_name = 'footfall_text') then
    update public.locations
      set footfall = nullif(regexp_replace(footfall_text, '[^0-9.]', '', 'g'), '')::numeric
      where footfall is null and footfall_text is not null and regexp_replace(footfall_text, '[^0-9.]', '', 'g') <> '';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'locations' and column_name = 'units_text') then
    update public.locations
      set units = nullif(regexp_replace(units_text, '[^0-9.]', '', 'g'), '')::numeric
      where units is null and units_text is not null and regexp_replace(units_text, '[^0-9.]', '', 'g') <> '';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'locations' and column_name = 'occupied_text') then
    update public.locations
      set occupied = nullif(regexp_replace(occupied_text, '[^0-9.]', '', 'g'), '')::numeric
      where occupied is null and occupied_text is not null and regexp_replace(occupied_text, '[^0-9.]', '', 'g') <> '';
  end if;
end $$;

alter table public.locations alter column category set default 'Other';
update public.locations set category = 'Other' where category is null or category = '';
update public.locations set city = 'Bengaluru' where city is null or city = '';
update public.locations set status = 'Active' where status is null or status = '';
update public.locations set extra = '{}'::jsonb where extra is null;
update public.locations set name = coalesce(nullif(name, ''), nullif(area, ''), 'Unnamed Location') where name is null or name = '';

create index if not exists idx_locations_category on public.locations(category);
create index if not exists idx_locations_area on public.locations(area);
create index if not exists idx_locations_direction on public.locations(direction);
create index if not exists idx_locations_status on public.locations(status);
create index if not exists idx_locations_city on public.locations(city);
create index if not exists idx_locations_updated_at on public.locations(updated_at desc);
create index if not exists idx_locations_search_v4 on public.locations using gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(area, '') || ' ' || coalesce(address, '') || ' ' || coalesce(notes, '')));

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_locations_updated_at on public.locations;
drop trigger if exists set_locations_updated_at on public.locations;
create trigger trg_locations_updated_at
before update on public.locations
for each row execute function public.set_updated_at();

-- Backend uses the Supabase service role key, so keeping RLS enabled is safe with this policy.
alter table public.locations enable row level security;
drop policy if exists "Service role can manage locations" on public.locations;
create policy "Service role can manage locations"
on public.locations
for all
using (true)
with check (true);

-- Ask PostgREST/Supabase API to refresh schema cache immediately.
notify pgrst, 'reload schema';
