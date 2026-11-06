create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'reader' check (role in ('reader', 'editor', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_reference_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create or replace function public.can_edit_references()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role in ('editor', 'admin')
  );
$$;

revoke all on function public.is_reference_admin() from public;
revoke all on function public.can_edit_references() from public;
grant execute on function public.is_reference_admin() to authenticated;
grant execute on function public.can_edit_references() to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_reference_admin()));

create policy "Admins can update profiles"
  on public.profiles for update to authenticated
  using ((select public.is_reference_admin()))
  with check ((select public.is_reference_admin()));

grant select, update on public.profiles to authenticated;

create or replace function public.create_reference_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_reference_profile
  after insert on auth.users
  for each row execute function public.create_reference_profile();

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

create table public.reference_entries (
  id bigint generated always as identity primary key,
  technology_id text not null check (technology_id in ('2g', '3g', '4g', '5g-nsa', '5g-sa')),
  kind text not null check (kind in ('node', 'interface')),
  entry_id text not null check (length(entry_id) between 1 and 80),
  description text not null default '' check (length(description) <= 2000),
  expansion text not null default '' check (length(expansion) <= 2000),
  details text not null default '' check (length(details) <= 12000),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  unique (technology_id, kind, entry_id)
);

alter table public.reference_entries enable row level security;

create policy "Reference overrides are publicly readable"
  on public.reference_entries for select to anon, authenticated
  using (true);

create policy "Editors can create reference overrides"
  on public.reference_entries for insert to authenticated
  with check ((select public.can_edit_references()));

create policy "Editors can update reference overrides"
  on public.reference_entries for update to authenticated
  using ((select public.can_edit_references()))
  with check ((select public.can_edit_references()));

create policy "Editors can delete reference overrides"
  on public.reference_entries for delete to authenticated
  using ((select public.can_edit_references()));

grant select on public.reference_entries to anon, authenticated;
grant insert, update, delete on public.reference_entries to authenticated;
grant usage, select on sequence public.reference_entries_id_seq to authenticated;

create or replace function public.set_reference_entry_metadata()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  new.updated_by = (select auth.uid());
  return new;
end;
$$;

create trigger set_reference_entry_metadata
  before insert or update on public.reference_entries
  for each row execute function public.set_reference_entry_metadata();

create table public.reference_entry_audit (
  id bigint generated always as identity primary key,
  reference_entry_id bigint references public.reference_entries (id) on delete set null,
  technology_id text not null,
  kind text not null,
  entry_id text not null,
  operation text not null check (operation in ('insert', 'update', 'delete')),
  old_data jsonb,
  new_data jsonb,
  changed_at timestamptz not null default now(),
  changed_by uuid references auth.users (id) on delete set null
);

alter table public.reference_entry_audit enable row level security;

create policy "Admins can view reference change history"
  on public.reference_entry_audit for select to authenticated
  using ((select public.is_reference_admin()));

grant select on public.reference_entry_audit to authenticated;

create or replace function public.audit_reference_entry_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.reference_entry_audit (
      reference_entry_id, technology_id, kind, entry_id,
      operation, new_data, changed_by
    ) values (
      new.id, new.technology_id, new.kind, new.entry_id,
      'insert', to_jsonb(new), (select auth.uid())
    );
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.reference_entry_audit (
      reference_entry_id, technology_id, kind, entry_id,
      operation, old_data, new_data, changed_by
    ) values (
      new.id, new.technology_id, new.kind, new.entry_id,
      'update', to_jsonb(old), to_jsonb(new), (select auth.uid())
    );
    return new;
  else
    insert into public.reference_entry_audit (
      technology_id, kind, entry_id, operation, old_data, changed_by
    ) values (
      old.technology_id, old.kind, old.entry_id,
      'delete', to_jsonb(old), (select auth.uid())
    );
    return old;
  end if;
end;
$$;

create trigger audit_reference_entry_change
  after insert or update or delete on public.reference_entries
  for each row execute function public.audit_reference_entry_change();