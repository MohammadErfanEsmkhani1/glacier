-- Per-user recently watched history. Title detail pages will upsert rows here.
create table if not exists public.user_recently_watched (
  user_id uuid not null references auth.users(id) on delete cascade,
  title_id uuid not null references public.titles(id) on delete cascade,
  watched_at timestamptz not null default now(),
  primary key (user_id, title_id)
);

alter table public.user_recently_watched enable row level security;

create policy "Users can read their own recently watched titles"
  on public.user_recently_watched for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own recently watched titles"
  on public.user_recently_watched for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own recently watched titles"
  on public.user_recently_watched for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.user_recently_watched to authenticated;
