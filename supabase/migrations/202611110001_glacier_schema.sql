-- Glacier initial database schema. Run in Supabase SQL Editor.
-- Assign the one administrator manually in Dashboard by inserting their auth.users UUID.

create extension if not exists pgcrypto;
create table if not exists public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade,created_at timestamptz not null default now());
create or replace function public.is_glacier_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.admin_users where user_id=(select auth.uid()));
$$;
revoke all on function public.is_glacier_admin() from public;
grant execute on function public.is_glacier_admin() to authenticated;

create table if not exists public.titles(
 id uuid primary key default gen_random_uuid(),title text not null,kind text not null check(kind in('movie','series')),
 release_year integer check(release_year between 1888 and 2200),genre text not null default '',description text not null default '',
 poster_url text,featured boolean not null default false,sort_order integer not null default 0,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now()
);
create table if not exists public.site_pages(slug text primary key,seo_title text not null default '',seo_description text not null default '',updated_at timestamptz not null default now());
create table if not exists public.site_sections(id uuid primary key default gen_random_uuid(),page_slug text not null references public.site_pages(slug) on delete cascade,section_key text not null,title text not null default '',description text not null default '',sort_order integer not null default 0,unique(page_slug,section_key));
create table if not exists public.site_settings(id boolean primary key default true check(id),palette text not null default 'glacier' check(palette in('glacier','aurora','ember')),updated_at timestamptz not null default now());
insert into public.site_settings(id) values(true) on conflict(id) do nothing;
insert into public.site_pages(slug,seo_title,seo_description) values
 ('home','Glacier — Movies, Series & Discovery','Discover remarkable movies and series with Glacier.'),
 ('movies','Movies — Glacier','Browse and search the Glacier movie collection.'),
 ('series','Series — Glacier','Browse and search the Glacier series collection.'),
 ('login','Sign in — Glacier','Sign in to your Glacier account.')
on conflict(slug) do nothing;

alter table public.admin_users enable row level security;
alter table public.titles enable row level security;alter table public.site_pages enable row level security;
alter table public.site_sections enable row level security;alter table public.site_settings enable row level security;
-- No client policies on admin_users: assign the sole admin through Supabase Dashboard.
create policy "Public can read catalogue" on public.titles for select to anon,authenticated using(true);
create policy "Only admin can manage catalogue" on public.titles for all to authenticated using(public.is_glacier_admin()) with check(public.is_glacier_admin());
create policy "Public can read page SEO" on public.site_pages for select to anon,authenticated using(true);
create policy "Only admin can manage page SEO" on public.site_pages for all to authenticated using(public.is_glacier_admin()) with check(public.is_glacier_admin());
create policy "Public can read section content" on public.site_sections for select to anon,authenticated using(true);
create policy "Only admin can manage section content" on public.site_sections for all to authenticated using(public.is_glacier_admin()) with check(public.is_glacier_admin());
create policy "Public can read site palette" on public.site_settings for select to anon,authenticated using(true);
create policy "Only admin can update site palette" on public.site_settings for update to authenticated using(public.is_glacier_admin()) with check(public.is_glacier_admin());
grant select on public.titles,public.site_pages,public.site_sections,public.site_settings to anon,authenticated;
grant insert,update,delete on public.titles,public.site_pages,public.site_sections to authenticated;
grant update on public.site_settings to authenticated;
