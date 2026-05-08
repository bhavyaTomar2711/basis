-- Basis schema — brain.md §8.1 + §8.2.
-- Run this against a fresh Supabase project. Idempotent within a project
-- (drops are commented out for safety).

-- =====================================================================
-- Extensions
-- =====================================================================
create extension if not exists "uuid-ossp";

-- =====================================================================
-- audits — every audit run, persisted server-side via /api/audit.
-- =====================================================================
create table if not exists public.audits (
  id                          uuid primary key default uuid_generate_v4(),
  slug                        text not null unique,
  created_at                  timestamptz not null default now(),
  input                       jsonb not null,
  result                      jsonb not null,
  ai_summary                  text,
  total_monthly_savings_usd   numeric not null default 0,
  total_annual_savings_usd    numeric not null default 0,
  user_agent                  text,
  ip_hash                     text
);

-- Sort/filter for benchmarks + the public share view.
create index if not exists audits_total_monthly_savings_idx
  on public.audits (total_monthly_savings_usd desc);

create index if not exists audits_slug_idx on public.audits (slug);

-- =====================================================================
-- leads — captured email + optional metadata, one per audit.
-- =====================================================================
create table if not exists public.leads (
  id                       uuid primary key default uuid_generate_v4(),
  audit_id                 uuid not null references public.audits(id) on delete cascade,
  email                    text not null,
  company                  text,
  role                     text,
  team_size                int,
  created_at               timestamptz not null default now(),
  email_sent_at            timestamptz,
  consultation_requested   boolean not null default false,
  unique (audit_id)
);

create index if not exists leads_email_idx on public.leads (email);

-- =====================================================================
-- RLS — brain.md §8.2.
-- Default behavior with RLS enabled and no SELECT/INSERT policy:
--   anon and authenticated roles are denied; service_role bypasses RLS.
-- We keep both tables fully locked down to anon for now. The /audit/[id]
-- and (later) /a/[slug] reads happen server-side using the service-role
-- key, so no public policy is needed yet. When public anon SELECT is
-- required for a read-only view, add a policy explicitly.
-- =====================================================================
alter table public.audits enable row level security;
alter table public.leads  enable row level security;
