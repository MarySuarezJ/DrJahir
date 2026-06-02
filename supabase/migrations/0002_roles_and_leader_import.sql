alter type app_role add value if not exists 'doctor';

alter table public.profiles
  add column if not exists username text,
  add column if not exists territory text,
  add column if not exists can_manage_alerts boolean not null default false,
  add column if not exists dashboard_preferences jsonb not null default '{}'::jsonb;

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;

drop policy if exists people_select_role on public.people;
create policy people_select_role on public.people
  for select
  to authenticated
  using (
    public.is_admin()
    or public.current_app_role()::text in ('doctor', 'secretaria')
    or (public.current_app_role() = 'abogado' and visibility_scope in ('public', 'legal'))
    or (public.current_app_role() = 'coordinador_territorial' and public.has_territory_access(municipality_id, commune_id, neighborhood_id))
  );

drop policy if exists leaders_select_role on public.leaders;
create policy leaders_select_role on public.leaders
  for select
  to authenticated
  using (
    public.is_admin()
    or public.current_app_role()::text in ('doctor', 'secretaria')
    or (public.current_app_role() = 'coordinador_territorial' and public.leader_has_territory_access(id))
  );

drop policy if exists leader_assignments_select_role on public.leader_assignments;
create policy leader_assignments_select_role on public.leader_assignments
  for select
  to authenticated
  using (
    public.is_admin()
    or public.current_app_role()::text in ('doctor', 'secretaria')
    or public.leader_has_territory_access(leader_id)
  );

drop policy if exists automation_templates_select_admin on public.automation_templates;
create policy automation_templates_select_admin on public.automation_templates
  for select
  to authenticated
  using (public.is_admin() or public.current_app_role() = 'secretaria');

drop policy if exists automation_templates_write_admin on public.automation_templates;
create policy automation_templates_write_admin on public.automation_templates
  for all
  to authenticated
  using (public.is_admin() or public.current_app_role() = 'secretaria')
  with check (public.is_admin() or public.current_app_role() = 'secretaria');

drop policy if exists automation_rules_select_admin on public.automation_rules;
create policy automation_rules_select_admin on public.automation_rules
  for select
  to authenticated
  using (public.is_admin() or public.current_app_role() = 'secretaria');

drop policy if exists automation_rules_write_admin on public.automation_rules;
create policy automation_rules_write_admin on public.automation_rules
  for all
  to authenticated
  using (public.is_admin() or public.current_app_role() = 'secretaria')
  with check (public.is_admin() or public.current_app_role() = 'secretaria');

drop policy if exists important_dates_select_admin on public.important_dates;
create policy important_dates_select_admin on public.important_dates
  for select
  to authenticated
  using (public.is_admin() or public.current_app_role() = 'secretaria');

drop policy if exists important_dates_write_admin on public.important_dates;
create policy important_dates_write_admin on public.important_dates
  for all
  to authenticated
  using (public.is_admin() or public.current_app_role() = 'secretaria')
  with check (public.is_admin() or public.current_app_role() = 'secretaria');

drop policy if exists message_batches_select_admin on public.message_batches;
create policy message_batches_select_admin on public.message_batches
  for select
  to authenticated
  using (public.is_admin() or public.current_app_role() = 'secretaria');

drop policy if exists message_batches_write_admin on public.message_batches;
create policy message_batches_write_admin on public.message_batches
  for all
  to authenticated
  using (public.is_admin() or public.current_app_role() = 'secretaria')
  with check (public.is_admin() or public.current_app_role() = 'secretaria');
