-- Per-user favorites. Each account can only read and change its own saved titles.
create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  title_id uuid not null references public.titles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, title_id)
);

alter table public.user_favorites enable row level security;

create policy "Users can read their own favorites"
  on public.user_favorites for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own favorites"
  on public.user_favorites for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own favorites"
  on public.user_favorites for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, delete on public.user_favorites to authenticated;
