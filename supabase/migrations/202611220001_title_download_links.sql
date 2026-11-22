-- Store one optional download URL per title and quality.
create table if not exists public.title_download_links (
  id uuid primary key default gen_random_uuid(),
  title_id uuid not null references public.titles(id) on delete cascade,
  quality text not null check (quality in ('360p', '480p', '720p', '1080p')),
  url text not null check (url ~* '^https?://[^[:space:]]+$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint title_download_links_title_quality_key unique (title_id, quality)
);

create index if not exists title_download_links_title_id_idx
  on public.title_download_links (title_id);

alter table public.title_download_links enable row level security;

-- Visitors can read configured links; the title page hides qualities without rows.
drop policy if exists "Anyone can read title download links" on public.title_download_links;
create policy "Anyone can read title download links"
  on public.title_download_links
  for select
  to anon, authenticated
  using (true);

-- Only users recognized by Glacier's existing admin permission function can manage URLs.
drop policy if exists "Glacier admins manage title download links" on public.title_download_links;
create policy "Glacier admins manage title download links"
  on public.title_download_links
  for all
  to authenticated
  using (public.is_glacier_admin())
  with check (public.is_glacier_admin());

create or replace function public.set_title_download_links_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists title_download_links_updated_at on public.title_download_links;
create trigger title_download_links_updated_at
  before update on public.title_download_links
  for each row execute function public.set_title_download_links_updated_at();
