create table if not exists public.auth_email_handoffs (
  handoff_id uuid primary key,
  secret_hash text not null,
  token_hash text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists auth_email_handoffs_expires_at_idx
  on public.auth_email_handoffs (expires_at);
alter table public.auth_email_handoffs enable row level security;
revoke all on public.auth_email_handoffs from anon, authenticated;
grant all on public.auth_email_handoffs to service_role;

-- Limit unauthenticated challenge creation to five attempts per IP per ten-minute window.
create table if not exists public.auth_email_handoff_rate_limits (
  ip_hash text primary key,
  window_started_at timestamptz not null,
  attempts integer not null default 0
);
alter table public.auth_email_handoff_rate_limits enable row level security;
revoke all on public.auth_email_handoff_rate_limits from anon, authenticated;
grant all on public.auth_email_handoff_rate_limits to service_role;

create or replace function public.consume_auth_email_handoff_rate_limit(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.auth_email_handoff_rate_limits%rowtype;
begin
  insert into public.auth_email_handoff_rate_limits (ip_hash, window_started_at, attempts)
  values (p_ip_hash, now(), 1)
  on conflict (ip_hash) do nothing;

  select * into current_row
  from public.auth_email_handoff_rate_limits
  where ip_hash = p_ip_hash
  for update;

  if current_row.window_started_at < now() - interval '10 minutes' then
    update public.auth_email_handoff_rate_limits
      set window_started_at = now(), attempts = 1
      where ip_hash = p_ip_hash;
    return true;
  end if;

  if current_row.attempts >= 5 then
    return false;
  end if;

  update public.auth_email_handoff_rate_limits
    set attempts = attempts + 1
    where ip_hash = p_ip_hash;
  return true;
end;
$$;

revoke all on function public.consume_auth_email_handoff_rate_limit(text) from public, anon, authenticated;
grant execute on function public.consume_auth_email_handoff_rate_limit(text) to service_role;
