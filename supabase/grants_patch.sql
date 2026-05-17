-- PATCH à exécuter UNE FOIS dans Supabase SQL Editor
-- si tu as déjà passé schema.sql avant d'y ajouter les GRANTs.
-- Résout l'erreur « permission denied for table profiles » au moment de l'onboarding.

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

grant select on public.groups to anon;

grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.shares_group_with(uuid) to authenticated;

-- Si ton compte a été créé avant d'exécuter le trigger handle_new_user,
-- il se peut qu'il manque une ligne dans public.profiles. On la crée
-- (idempotent : ne fait rien si la ligne existe déjà).
insert into public.profiles (id, username)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'username', 'user_' || substr(u.id::text, 1, 8))
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
