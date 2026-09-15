-- Private jap-only guests (Kirtida). Run this once in the Supabase SQL Editor.
-- Tracker users (Ak, Manna) keep seeing each other. jap_only rows stay hidden.

alter table profiles
  add column if not exists role text not null default 'tracker';

alter table profiles
  drop constraint if exists profiles_role_check;

alter table profiles
  add constraint profiles_role_check check (role in ('tracker', 'jap_only'));

create or replace function public.jwt_app_role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'tracker');
$$;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
as $$
begin
  if public.jwt_app_role() = 'jap_only' then
    new.role := 'jap_only';
  elsif tg_op = 'INSERT' and new.role is null then
    new.role := 'tracker';
  end if;

  if tg_op = 'UPDATE' and auth.uid() is not null then
    new.role := old.role;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_role on profiles;
create trigger protect_profile_role
before insert or update on profiles
for each row execute function public.protect_profile_role();

drop policy if exists "Profiles readable by authenticated users" on profiles;
drop policy if exists "Tracker profiles are shared" on profiles;

create policy "Tracker profiles are shared"
on profiles for select
using (
  id = auth.uid()
  or (
    public.jwt_app_role() = 'tracker'
    and coalesce(role, 'tracker') = 'tracker'
  )
);

drop policy if exists "Entries readable by authenticated users" on jap_entries;
drop policy if exists "Tracker entries are shared" on jap_entries;

create policy "Tracker entries are shared"
on jap_entries for select
using (
  user_id = auth.uid()
  or (
    public.jwt_app_role() = 'tracker'
    and exists (
      select 1
      from profiles p
      where p.id = jap_entries.user_id
        and coalesce(p.role, 'tracker') = 'tracker'
    )
  )
);
