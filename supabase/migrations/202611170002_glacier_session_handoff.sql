alter table public.auth_email_handoffs
  add column if not exists session_access_token text,
  add column if not exists session_refresh_token text,
  add column if not exists published_at timestamptz;

create index if not exists auth_email_handoffs_published_at_idx
  on public.auth_email_handoffs (published_at)
  where session_refresh_token is not null;
