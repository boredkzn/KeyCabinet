-- KeyCabinet · ДЗ5 · начальная схема (PostgreSQL / Supabase)
-- Выполнить в Supabase Dashboard → SQL Editor → New query → Run

-- ---------------------------------------------------------------------------
-- 1. Таблицы
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'receptionist'
    check (role in ('receptionist', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.office_keys (
  id text primary key,
  room text not null,
  label text not null,
  floor integer not null check (floor >= 0),
  status text not null default 'available'
    check (status in ('available', 'issued', 'overdue')),
  holder text,
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint office_keys_holder_consistency check (
    (status = 'available' and holder is null and issued_at is null)
    or (status in ('issued', 'overdue') and holder is not null)
  )
);

create table if not exists public.checkouts (
  id uuid primary key default gen_random_uuid(),
  key_id text not null references public.office_keys (id) on delete cascade,
  holder_name text not null,
  issued_at timestamptz not null default now(),
  returned_at timestamptz,
  issued_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists checkouts_key_id_idx on public.checkouts (key_id);
create index if not exists office_keys_status_idx on public.office_keys (status);

-- ---------------------------------------------------------------------------
-- 2. Триггер: профиль при регистрации
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. updated_at
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists office_keys_set_updated_at on public.office_keys;
create trigger office_keys_set_updated_at
  before update on public.office_keys
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. Seed (демо-ключи)
-- ---------------------------------------------------------------------------

insert into public.office_keys (id, room, label, floor, status, holder, issued_at)
values
  ('k-101', '101', 'Переговорная Север', 1, 'available', null, null),
  ('k-205', '205', 'Серверная', 2, 'issued', 'Иванов А.П.', '2026-10-13T09:15:00Z'),
  ('k-310', '310', 'Архив', 3, 'overdue', 'Петрова М.С.', '2026-10-10T14:00:00Z'),
  ('k-112', '112', 'Склад канцелярии', 1, 'available', null, null),
  ('k-220', '220', 'Кабинет HR', 2, 'issued', 'Сидоров К.В.', '2026-10-13T11:40:00Z')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.office_keys enable row level security;
alter table public.checkouts enable row level security;

-- profiles: читать/править только свой профиль
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- office_keys: авторизованные — полный CRUD для ресепшена
drop policy if exists "keys_select_authenticated" on public.office_keys;
create policy "keys_select_authenticated"
  on public.office_keys for select
  to authenticated
  using (true);

drop policy if exists "keys_insert_authenticated" on public.office_keys;
create policy "keys_insert_authenticated"
  on public.office_keys for insert
  to authenticated
  with check (true);

drop policy if exists "keys_update_authenticated" on public.office_keys;
create policy "keys_update_authenticated"
  on public.office_keys for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "keys_delete_authenticated" on public.office_keys;
create policy "keys_delete_authenticated"
  on public.office_keys for delete
  to authenticated
  using (true);

-- checkouts: авторизованные читают все, создают/обновляют свои операции
drop policy if exists "checkouts_select_authenticated" on public.checkouts;
create policy "checkouts_select_authenticated"
  on public.checkouts for select
  to authenticated
  using (true);

drop policy if exists "checkouts_insert_authenticated" on public.checkouts;
create policy "checkouts_insert_authenticated"
  on public.checkouts for insert
  to authenticated
  with check (true);

drop policy if exists "checkouts_update_authenticated" on public.checkouts;
create policy "checkouts_update_authenticated"
  on public.checkouts for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- 6. Auth (заметки для Dashboard)
-- ---------------------------------------------------------------------------
-- Authentication → Providers → Email: включить Email.
-- Для учебного проекта можно отключить «Confirm email» (Auth → Providers → Email),
-- чтобы вход email/password работал сразу после Sign up.
-- Site URL / Redirect URLs: http://localhost:5173 (и URL Vercel при деплое).
-- CORS настраивать не нужно — Supabase разрешает браузерные запросы с anon key.
