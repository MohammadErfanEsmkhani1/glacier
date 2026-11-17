-- Short-lived handoff storage for email confirmation links opened on another device.
-- Only the Edge Function service role can access this table.
create table if not exists public.auth_email_handoffs (
  handoff_id uuid primary key,
  token_hash text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists auth_email_handoffs_expires_at_idx
  on public.auth_email_handoffs (expires_at);

alter table public.auth_email_handoffs enable row level security;
revoke all on public.auth_email_handoffs from anon, authenticated;
grant all on public.auth_email_handoffs to service_role;

-- Remove expired handoffs opportunistically; the Edge Function also checks expiry.
