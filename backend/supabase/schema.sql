-- Rotten Cherry Co. — admin gallery upload
-- Run this once in the Supabase Dashboard: SQL Editor > New query > paste > Run.

-- ============ TABLE ============
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text not null,
  alt_text text not null,
  title text not null,
  seo_description text,
  category text not null check (category in ('studio', 'editorial', 'stage', 'events', 'location', 'horses')),
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

drop policy if exists "Public can read photos" on public.photos;
create policy "Public can read photos"
  on public.photos for select
  to anon, authenticated
  using (true);

drop policy if exists "Authenticated can insert photos" on public.photos;
create policy "Authenticated can insert photos"
  on public.photos for insert
  to authenticated
  with check (true);

-- ============ STORAGE BUCKET ============
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "Public read access to photos bucket" on storage.objects;
create policy "Public read access to photos bucket"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'photos');

drop policy if exists "Authenticated can upload to photos bucket" on storage.objects;
create policy "Authenticated can upload to photos bucket"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');
