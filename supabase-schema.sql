-- M365 DLP Rehberi — Supabase Schema
-- dlp_ prefix: mevcut tenants tablosuyla çakışmaz

create table public.dlp_tenants (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  email       text default '',
  license     text default 'e3' check (license in ('e3', 'e5', 'bp')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table public.dlp_task_checks (
  id          uuid default gen_random_uuid() primary key,
  tenant_id   uuid references public.dlp_tenants(id) on delete cascade not null,
  task_id     text not null,
  checked     boolean default false,
  checked_at  timestamptz,
  unique(tenant_id, task_id)
);

create table public.dlp_task_notes (
  id          uuid default gen_random_uuid() primary key,
  tenant_id   uuid references public.dlp_tenants(id) on delete cascade not null,
  task_id     text not null,
  note        text not null default '',
  updated_at  timestamptz default now(),
  unique(tenant_id, task_id)
);

alter table public.dlp_tenants enable row level security;
alter table public.dlp_task_checks enable row level security;
alter table public.dlp_task_notes enable row level security;

create policy "Users own dlp tenants" on public.dlp_tenants
  for all using (auth.uid() = user_id);

create policy "Users own dlp task checks" on public.dlp_task_checks
  for all using (
    exists (select 1 from public.dlp_tenants where id = tenant_id and user_id = auth.uid())
  );

create policy "Users own dlp task notes" on public.dlp_task_notes
  for all using (
    exists (select 1 from public.dlp_tenants where id = tenant_id and user_id = auth.uid())
  );

create index dlp_tenants_user_id_idx on public.dlp_tenants(user_id);
create index dlp_task_checks_tenant_id_idx on public.dlp_task_checks(tenant_id);
create index dlp_task_notes_tenant_id_idx on public.dlp_task_notes(tenant_id);
