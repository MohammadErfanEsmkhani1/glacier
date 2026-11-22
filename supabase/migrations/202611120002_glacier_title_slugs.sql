-- Add clean, human-readable title URLs.
-- Run this once in Supabase SQL Editor after the existing Glacier migrations.

create extension if not exists unaccent;

alter table public.titles
  add column if not exists slug text;

with normalized as (
  select
    id,
    coalesce(
      nullif(
        trim(both '-' from regexp_replace(lower(unaccent(coalesce(title, ''))), '[^a-z0-9]+', '-', 'g')),
        ''
      ),
      'title'
    ) as base_slug,
    coalesce(release_year::text, 'unknown') as year_part
  from public.titles
),
with_counts as (
  select
    *,
    count(*) over (partition by base_slug) as title_count,
    count(*) over (partition by base_slug, year_part) as title_year_count,
    row_number() over (partition by base_slug, year_part order by id) as title_year_position
  from normalized
),
candidates as (
  select
    id,
    case
      when title_count = 1 then base_slug
      when title_year_count = 1 then base_slug || '-' || year_part
      else base_slug || '-' || year_part || '-' || title_year_position::text
    end as candidate_slug
  from with_counts
),
ranked as (
  select
    id,
    candidate_slug,
    count(*) over (partition by candidate_slug) as collision_count
  from candidates
)
update public.titles as titles
set slug = case
  when ranked.collision_count = 1 then ranked.candidate_slug
  else ranked.candidate_slug || '-' || substring(titles.id::text, 1, 8)
end
from ranked
where ranked.id = titles.id;

create unique index if not exists titles_slug_unique_idx
  on public.titles (slug);

alter table public.titles
  alter column slug set not null;
