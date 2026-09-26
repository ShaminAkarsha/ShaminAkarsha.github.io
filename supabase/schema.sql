-- Run this once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- It creates the content table and locks writing to the admin account(s).

-- One row per section of the site: profile, about, projects, research, achievements.
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Users allowed to edit the site. Everyone else can only read.
create table if not exists public.site_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.site_content enable row level security;
alter table public.site_admins enable row level security;

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.site_admins where user_id = auth.uid());
$$;

drop policy if exists "Anyone can read content" on public.site_content;
create policy "Anyone can read content" on public.site_content
  for select using (true);

drop policy if exists "Admins can insert content" on public.site_content;
create policy "Admins can insert content" on public.site_content
  for insert to authenticated with check (public.is_site_admin());

drop policy if exists "Admins can update content" on public.site_content;
create policy "Admins can update content" on public.site_content
  for update to authenticated using (public.is_site_admin()) with check (public.is_site_admin());

drop policy if exists "Admins can delete content" on public.site_content;
create policy "Admins can delete content" on public.site_content
  for delete to authenticated using (public.is_site_admin());

drop policy if exists "Admins can see themselves" on public.site_admins;
create policy "Admins can see themselves" on public.site_admins
  for select to authenticated using (user_id = auth.uid());

-- After creating your user (Authentication > Users > Add user), make it an admin.
-- Replace the email below with the one you used, then run this line on its own.
-- insert into public.site_admins (user_id) select id from auth.users where email = 'you@example.com';
