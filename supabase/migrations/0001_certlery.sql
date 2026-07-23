create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  username text unique,
  headline text not null default '',
  biography text not null default '',
  location text not null default '',
  website text not null default '',
  gallery_visibility text not null default 'public'
    check (gallery_visibility in ('public', 'private', 'unlisted')),
  theme text not null default 'system'
    check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  visibility text not null default 'private'
    check (visibility in ('public', 'private', 'unlisted')),
  is_featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  issuing_organization text not null,
  certificate_type text not null default 'Certificate',
  issue_date date not null,
  expiration_date date,
  credential_id text,
  verification_url text,
  verification_status text not null default 'unavailable'
    check (verification_status in ('link_available', 'manually_confirmed', 'unavailable', 'expired')),
  category text not null default 'Professional',
  collection text,
  skills text[] not null default '{}',
  description text not null default '',
  private_notes text not null default '',
  file_key text,
  file_name text,
  file_type text not null default 'image'
    check (file_type in ('image', 'pdf')),
  orientation text not null default 'landscape'
    check (orientation in ('portrait', 'landscape', 'square')),
  rotation integer not null default 0,
  visibility text not null default 'private'
    check (visibility in ('public', 'private', 'unlisted')),
  allow_download boolean not null default true,
  show_credential_id boolean not null default true,
  is_featured boolean not null default false,
  is_draft boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  certificate_id uuid not null references public.certificates(id) on delete cascade,
  reminder_date date not null,
  reminder_type text not null default '30_days',
  is_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists certificates_owner_created_idx
  on public.certificates (user_id, created_at desc);
create index if not exists certificates_visibility_idx
  on public.certificates (visibility, is_featured);
create index if not exists reminders_owner_date_idx
  on public.reminders (user_id, reminder_date);

alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.certificates enable row level security;
alter table public.reminders enable row level security;

create policy "Profiles are publicly readable when visible"
  on public.profiles for select
  using (gallery_visibility = 'public' or auth.uid() = id);
create policy "Users manage their profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Collections follow owner visibility"
  on public.collections for select
  using (visibility = 'public' or auth.uid() = user_id);
create policy "Users manage their collections"
  on public.collections for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Certificates follow owner visibility"
  on public.certificates for select
  using (visibility = 'public' or auth.uid() = user_id);
create policy "Users insert their certificates"
  on public.certificates for insert
  with check (auth.uid() = user_id);
create policy "Users update their certificates"
  on public.certificates for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users delete their certificates"
  on public.certificates for delete
  using (auth.uid() = user_id);

create policy "Users manage their reminders"
  on public.reminders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificates',
  'certificates',
  false,
  10485760,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users upload certificate files to their folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
create policy "Users read their certificate files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
create policy "Users update their certificate files"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
create policy "Users delete their certificate files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'certificates'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
