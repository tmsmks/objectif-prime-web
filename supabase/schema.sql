-- Objectif Prime — Schéma Supabase (web)
-- À exécuter dans Supabase SQL Editor une seule fois après création du projet.

-- =========================================================
-- PROFILES : 1 ligne par utilisateur (lié à auth.users)
-- =========================================================
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text unique not null,
  display_name    text,
  avatar_url      text,
  birth_date      date,
  gender          text check (gender in ('male','female','other')),
  height_cm       numeric(5,1),
  start_weight_kg numeric(5,2),
  target_weight_kg numeric(5,2),
  target_date     date,
  daily_step_goal int default 8000,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- =========================================================
-- WEIGHT_LOGS : pesées journalières
-- =========================================================
create table if not exists public.weight_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  weight_kg  numeric(5,2) not null,
  logged_at  date not null default current_date,
  note       text,
  created_at timestamptz default now(),
  unique (user_id, logged_at)
);

-- =========================================================
-- FOOD_LOGS : aliments consommés (calories IN)
-- =========================================================
create table if not exists public.food_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  logged_at     date not null default current_date,
  meal          text check (meal in ('breakfast','lunch','dinner','snack')),
  name          text not null,
  brand         text,
  barcode       text,
  serving_g     numeric(7,2),
  kcal          numeric(7,2) not null,
  protein_g     numeric(6,2),
  carbs_g       numeric(6,2),
  fat_g         numeric(6,2),
  created_at    timestamptz default now()
);

create index if not exists food_logs_user_day_idx on public.food_logs (user_id, logged_at);

-- =========================================================
-- ACTIVITY_LOGS : sport renseigné manuellement (calories OUT)
-- =========================================================
create table if not exists public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  logged_at   date not null default current_date,
  activity    text not null,
  duration_min int,
  kcal_burned numeric(7,2),
  note        text,
  created_at  timestamptz default now()
);

create index if not exists activity_logs_user_day_idx on public.activity_logs (user_id, logged_at);

-- =========================================================
-- HEALTH_SNAPSHOTS : pas journaliers (saisie manuelle web)
-- =========================================================
create table if not exists public.health_snapshots (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  logged_at      date not null default current_date,
  steps          int default 0,
  active_kcal    numeric(7,2) default 0,
  resting_kcal   numeric(7,2) default 0,
  distance_m     numeric(9,2) default 0,
  updated_at     timestamptz default now(),
  primary key (user_id, logged_at)
);

-- =========================================================
-- GROUPS : groupes privés entre amis
-- =========================================================
create table if not exists public.groups (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  invite_code  text unique not null default upper(substr(md5(random()::text), 1, 6)),
  created_by   uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz default now()
);

create table if not exists public.group_members (
  group_id  uuid not null references public.groups(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);

-- =========================================================
-- RLS — Row Level Security
-- =========================================================
alter table public.profiles         enable row level security;
alter table public.weight_logs      enable row level security;
alter table public.food_logs        enable row level security;
alter table public.activity_logs    enable row level security;
alter table public.health_snapshots enable row level security;
alter table public.groups           enable row level security;
alter table public.group_members    enable row level security;

-- Helpers SECURITY DEFINER : évite la récursion infinie dans les policies
create or replace function public.is_group_member(gid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

create or replace function public.shares_group_with(other_user uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.group_members gm1
    join public.group_members gm2 on gm1.group_id = gm2.group_id
    where gm1.user_id = auth.uid()
      and gm2.user_id = other_user
  );
$$;

-- Profile : lisible par moi + membres de mes groupes ; modifiable par moi
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id or public.shares_group_with(id));
drop policy if exists "profiles_self_modify" on public.profiles;
create policy "profiles_self_modify" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "weight_self_or_group" on public.weight_logs;
create policy "weight_self_or_group" on public.weight_logs
  for select using (auth.uid() = user_id or public.shares_group_with(user_id));
drop policy if exists "weight_self_write" on public.weight_logs;
create policy "weight_self_write" on public.weight_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "food_self_or_group" on public.food_logs;
create policy "food_self_or_group" on public.food_logs
  for select using (auth.uid() = user_id or public.shares_group_with(user_id));
drop policy if exists "food_self_write" on public.food_logs;
create policy "food_self_write" on public.food_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "activity_self_or_group" on public.activity_logs;
create policy "activity_self_or_group" on public.activity_logs
  for select using (auth.uid() = user_id or public.shares_group_with(user_id));
drop policy if exists "activity_self_write" on public.activity_logs;
create policy "activity_self_write" on public.activity_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "health_self_or_group" on public.health_snapshots;
create policy "health_self_or_group" on public.health_snapshots
  for select using (auth.uid() = user_id or public.shares_group_with(user_id));
drop policy if exists "health_self_write" on public.health_snapshots;
create policy "health_self_write" on public.health_snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "groups_member_select" on public.groups;
create policy "groups_member_select" on public.groups
  for select using (public.is_group_member(id));
drop policy if exists "groups_creator_insert" on public.groups;
create policy "groups_creator_insert" on public.groups
  for insert with check (auth.uid() = created_by);

-- Permettre de retrouver un groupe par son invite_code lors d'une jointure
drop policy if exists "groups_lookup_by_code" on public.groups;
create policy "groups_lookup_by_code" on public.groups
  for select using (true);

drop policy if exists "group_members_self_select" on public.group_members;
create policy "group_members_self_select" on public.group_members
  for select using (user_id = auth.uid() or public.is_group_member(group_id));
drop policy if exists "group_members_join" on public.group_members;
create policy "group_members_join" on public.group_members
  for insert with check (user_id = auth.uid());
drop policy if exists "group_members_leave" on public.group_members;
create policy "group_members_leave" on public.group_members
  for delete using (user_id = auth.uid());

-- =========================================================
-- TRIGGER : créer une row profiles à chaque signup
-- =========================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- GRANTS — donne au rôle `authenticated` (utilisé par @supabase/ssr)
-- le droit d'agir sur les tables. RLS filtre ensuite les lignes.
-- Sans ces GRANTs, Postgres renvoie « permission denied for table … ».
-- =========================================================
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.weight_logs,
  public.food_logs,
  public.activity_logs,
  public.health_snapshots,
  public.groups,
  public.group_members
to authenticated;

grant select on
  public.groups
to anon;

grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.shares_group_with(uuid) to authenticated;
