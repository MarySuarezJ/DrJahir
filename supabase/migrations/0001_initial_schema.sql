create extension if not exists pgcrypto;

do $$ begin
  create type app_role as enum ('admin_principal', 'secretaria', 'abogado', 'coordinador_territorial');
exception when duplicate_object then null; end $$;

do $$ begin
  create type person_kind as enum ('leader', 'voter', 'supporter', 'volunteer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type employment_status as enum ('empleado', 'desempleado', 'independiente', 'estudiante', 'pensionado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type visibility_scope as enum ('public', 'operational', 'legal', 'restricted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type automation_channel as enum ('whatsapp', 'email', 'sms');
exception when duplicate_object then null; end $$;

do $$ begin
  create type automation_trigger_type as enum ('birthday', 'profession_day', 'territorial_push', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type important_date_type as enum ('birthday', 'profession_day', 'civic_day', 'campaign_day', 'custom');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_channel as enum ('whatsapp', 'email', 'sms');
exception when duplicate_object then null; end $$;

do $$ begin
  create type territory_level as enum ('department', 'municipality', 'commune', 'neighborhood');
exception when duplicate_object then null; end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  role app_role not null default 'secretaria',
  status text not null default 'active',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.municipalities (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null,
  code text,
  support_score numeric(5,2) not null default 0,
  geometry jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (department_id, name)
);

create table if not exists public.communes (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  name text not null,
  code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (municipality_id, name)
);

create table if not exists public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  commune_id uuid not null references public.communes(id) on delete cascade,
  name text not null,
  code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (commune_id, name)
);

create table if not exists public.voting_centers (
  id uuid primary key default gen_random_uuid(),
  municipality_id uuid not null references public.municipalities(id) on delete cascade,
  commune_id uuid references public.communes(id) on delete set null,
  neighborhood_id uuid references public.neighborhoods(id) on delete set null,
  name text not null,
  code text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.voting_tables (
  id uuid primary key default gen_random_uuid(),
  voting_center_id uuid not null references public.voting_centers(id) on delete cascade,
  table_number text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (voting_center_id, table_number)
);

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  kind person_kind not null default 'voter',
  leader_id uuid,
  first_name text not null,
  last_name text not null,
  document_number text not null unique,
  phone text,
  whatsapp text,
  email text,
  address text,
  barrio text,
  comuna text,
  municipality_id uuid references public.municipalities(id) on delete set null,
  commune_id uuid references public.communes(id) on delete set null,
  neighborhood_id uuid references public.neighborhoods(id) on delete set null,
  department_id uuid references public.departments(id) on delete set null,
  profession text,
  company text,
  job_title text,
  employment_status employment_status not null default 'desempleado',
  voting_center_id uuid references public.voting_centers(id) on delete set null,
  voting_table_id uuid references public.voting_tables(id) on delete set null,
  photo_path text,
  resume_path text,
  notes text,
  support_label text not null default 'Simpatizante',
  support_score numeric(5,2) not null default 0,
  visibility_scope visibility_scope not null default 'operational',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.people
  drop constraint if exists people_leader_fk;

create table if not exists public.leaders (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null unique references public.people(id) on delete cascade,
  parent_leader_id uuid references public.leaders(id) on delete set null,
  title text not null default 'Líder',
  leader_level smallint not null default 1,
  influence_score numeric(5,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.people
  add constraint people_leader_fk foreign key (leader_id) references public.leaders(id) on delete set null;

create table if not exists public.leader_assignments (
  id uuid primary key default gen_random_uuid(),
  leader_id uuid not null references public.leaders(id) on delete cascade,
  territory_level territory_level not null,
  municipality_id uuid references public.municipalities(id) on delete cascade,
  commune_id uuid references public.communes(id) on delete cascade,
  neighborhood_id uuid references public.neighborhoods(id) on delete cascade,
  priority_weight numeric(5,2) not null default 1,
  created_at timestamptz not null default now(),
  unique (leader_id, territory_level, municipality_id, commune_id, neighborhood_id),
  check (
    (territory_level = 'department' and municipality_id is null and commune_id is null and neighborhood_id is null) or
    (territory_level = 'municipality' and municipality_id is not null and commune_id is null and neighborhood_id is null) or
    (territory_level = 'commune' and municipality_id is null and commune_id is not null and neighborhood_id is null) or
    (territory_level = 'neighborhood' and municipality_id is null and commune_id is null and neighborhood_id is not null)
  )
);

create table if not exists public.person_tags (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  tag text not null,
  created_at timestamptz not null default now(),
  unique (person_id, tag)
);

create table if not exists public.person_documents (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references public.people(id) on delete cascade,
  document_type text not null,
  storage_bucket text not null default 'documents',
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  visibility_scope visibility_scope not null default 'restricted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'draft',
  start_date date,
  end_date date,
  budget numeric(12,2) not null default 0,
  owner_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_segments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  name text not null,
  criteria jsonb not null default '{}'::jsonb,
  target_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.automation_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel automation_channel not null,
  trigger_type automation_trigger_type not null,
  subject text,
  body text not null,
  variables_schema jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.automation_templates(id) on delete cascade,
  schedule_expression text not null,
  audience_scope jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.important_dates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date_type important_date_type not null default 'custom',
  date_month smallint check (date_month between 1 and 12),
  date_day smallint check (date_day between 1 and 31),
  exact_date date,
  channel automation_channel not null default 'whatsapp',
  audience_scope jsonb not null default '{}'::jsonb,
  message_template text not null,
  active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  approved_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    exact_date is not null
    or (date_month is not null and date_day is not null)
  )
);

create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  role app_role not null default 'secretaria',
  status text not null default 'pending',
  invited_by uuid references public.profiles(id) on delete set null,
  accepted_user_id uuid references public.profiles(id) on delete set null,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.automation_templates(id) on delete cascade,
  triggered_at timestamptz not null default now(),
  status text not null default 'queued',
  executed_by uuid references public.profiles(id) on delete set null,
  target_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.message_batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel message_channel not null,
  status text not null default 'draft',
  scheduled_for timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  template_id uuid references public.automation_templates(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.message_recipients (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.message_batches(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  status text not null default 'pending',
  delivered_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique (batch_id, person_id)
);

create table if not exists public.public_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  submission_type person_kind not null default 'supporter',
  territory_name text,
  message text,
  source_page text not null default '/registro',
  created_at timestamptz not null default now()
);

create table if not exists public.public_submission_events (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.public_submissions(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_territory_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  municipality_id uuid references public.municipalities(id) on delete cascade,
  commune_id uuid references public.communes(id) on delete cascade,
  neighborhood_id uuid references public.neighborhoods(id) on delete cascade,
  granted_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (
    municipality_id is not null or commune_id is not null or neighborhood_id is not null
  )
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles(id) on delete set null,
  entity_table text not null,
  entity_id uuid,
  action text not null,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists municipalities_department_idx on public.municipalities(department_id);
create index if not exists communes_municipality_idx on public.communes(municipality_id);
create index if not exists neighborhoods_commune_idx on public.neighborhoods(commune_id);
create index if not exists people_municipality_idx on public.people(municipality_id);
create index if not exists people_commune_idx on public.people(commune_id);
create index if not exists people_neighborhood_idx on public.people(neighborhood_id);
create index if not exists leaders_parent_idx on public.leaders(parent_leader_id);
create index if not exists person_documents_person_idx on public.person_documents(person_id);
create index if not exists important_dates_active_idx on public.important_dates(active, date_month, date_day);
create index if not exists admin_invitations_email_idx on public.admin_invitations(email);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

drop trigger if exists set_departments_updated_at on public.departments;
create trigger set_departments_updated_at before update on public.departments for each row execute function public.set_updated_at();

drop trigger if exists set_municipalities_updated_at on public.municipalities;
create trigger set_municipalities_updated_at before update on public.municipalities for each row execute function public.set_updated_at();

drop trigger if exists set_communes_updated_at on public.communes;
create trigger set_communes_updated_at before update on public.communes for each row execute function public.set_updated_at();

drop trigger if exists set_neighborhoods_updated_at on public.neighborhoods;
create trigger set_neighborhoods_updated_at before update on public.neighborhoods for each row execute function public.set_updated_at();

drop trigger if exists set_voting_centers_updated_at on public.voting_centers;
create trigger set_voting_centers_updated_at before update on public.voting_centers for each row execute function public.set_updated_at();

drop trigger if exists set_voting_tables_updated_at on public.voting_tables;
create trigger set_voting_tables_updated_at before update on public.voting_tables for each row execute function public.set_updated_at();

drop trigger if exists set_people_updated_at on public.people;
create trigger set_people_updated_at before update on public.people for each row execute function public.set_updated_at();

drop trigger if exists set_leaders_updated_at on public.leaders;
create trigger set_leaders_updated_at before update on public.leaders for each row execute function public.set_updated_at();

drop trigger if exists set_person_documents_updated_at on public.person_documents;
create trigger set_person_documents_updated_at before update on public.person_documents for each row execute function public.set_updated_at();

drop trigger if exists set_campaigns_updated_at on public.campaigns;
create trigger set_campaigns_updated_at before update on public.campaigns for each row execute function public.set_updated_at();

drop trigger if exists set_automation_templates_updated_at on public.automation_templates;
create trigger set_automation_templates_updated_at before update on public.automation_templates for each row execute function public.set_updated_at();

drop trigger if exists set_automation_rules_updated_at on public.automation_rules;
create trigger set_automation_rules_updated_at before update on public.automation_rules for each row execute function public.set_updated_at();

drop trigger if exists set_important_dates_updated_at on public.important_dates;
create trigger set_important_dates_updated_at before update on public.important_dates for each row execute function public.set_updated_at();

drop trigger if exists set_admin_invitations_updated_at on public.admin_invitations;
create trigger set_admin_invitations_updated_at before update on public.admin_invitations for each row execute function public.set_updated_at();

drop trigger if exists set_message_batches_updated_at on public.message_batches;
create trigger set_message_batches_updated_at before update on public.message_batches for each row execute function public.set_updated_at();

create or replace function public.current_app_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'secretaria'::app_role);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() = 'admin_principal';
$$;

create or replace function public.has_territory_access(p_municipality uuid, p_commune uuid, p_neighborhood uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_territory_access uta
    where uta.user_id = auth.uid()
      and (
        (p_neighborhood is not null and uta.neighborhood_id = p_neighborhood)
        or (p_commune is not null and uta.commune_id = p_commune)
        or (p_municipality is not null and uta.municipality_id = p_municipality)
      )
  );
$$;

create or replace function public.leader_has_territory_access(p_leader_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.leader_assignments la
    join public.user_territory_access uta on uta.user_id = auth.uid()
    where la.leader_id = p_leader_id
      and (
        (la.neighborhood_id is not null and uta.neighborhood_id = la.neighborhood_id)
        or (la.commune_id is not null and uta.commune_id = la.commune_id)
        or (la.municipality_id is not null and uta.municipality_id = la.municipality_id)
      )
  );
$$;

alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.municipalities enable row level security;
alter table public.communes enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.voting_centers enable row level security;
alter table public.voting_tables enable row level security;
alter table public.people enable row level security;
alter table public.leaders enable row level security;
alter table public.leader_assignments enable row level security;
alter table public.person_tags enable row level security;
alter table public.person_documents enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_segments enable row level security;
alter table public.automation_templates enable row level security;
alter table public.automation_rules enable row level security;
alter table public.important_dates enable row level security;
alter table public.admin_invitations enable row level security;
alter table public.automation_runs enable row level security;
alter table public.message_batches enable row level security;
alter table public.message_recipients enable row level security;
alter table public.public_submissions enable row level security;
alter table public.public_submission_events enable row level security;
alter table public.user_territory_access enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists geography_select_authenticated on public.departments;
create policy geography_select_authenticated on public.departments for select to authenticated using (true);
drop policy if exists geography_insert_admin on public.departments;
create policy geography_insert_admin on public.departments for insert to authenticated with check (public.is_admin());
drop policy if exists geography_update_admin on public.departments;
create policy geography_update_admin on public.departments for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists geography_delete_admin on public.departments;
create policy geography_delete_admin on public.departments for delete to authenticated using (public.is_admin());

drop policy if exists municipalities_select_authenticated on public.municipalities;
create policy municipalities_select_authenticated on public.municipalities for select to authenticated using (true);
drop policy if exists municipalities_write_admin on public.municipalities;
create policy municipalities_write_admin on public.municipalities for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists communes_select_authenticated on public.communes;
create policy communes_select_authenticated on public.communes for select to authenticated using (true);
drop policy if exists communes_write_admin on public.communes;
create policy communes_write_admin on public.communes for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists neighborhoods_select_authenticated on public.neighborhoods;
create policy neighborhoods_select_authenticated on public.neighborhoods for select to authenticated using (true);
drop policy if exists neighborhoods_write_admin on public.neighborhoods;
create policy neighborhoods_write_admin on public.neighborhoods for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists voting_centers_select_authenticated on public.voting_centers;
create policy voting_centers_select_authenticated on public.voting_centers for select to authenticated using (true);
drop policy if exists voting_centers_write_admin on public.voting_centers;
create policy voting_centers_write_admin on public.voting_centers for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists voting_tables_select_authenticated on public.voting_tables;
create policy voting_tables_select_authenticated on public.voting_tables for select to authenticated using (true);
drop policy if exists voting_tables_write_admin on public.voting_tables;
create policy voting_tables_write_admin on public.voting_tables for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists people_select_role on public.people;
create policy people_select_role on public.people
  for select
  to authenticated
  using (
    public.is_admin()
    or public.current_app_role() = 'secretaria'
    or (public.current_app_role() = 'abogado' and visibility_scope in ('public', 'legal'))
    or (public.current_app_role() = 'coordinador_territorial' and public.has_territory_access(municipality_id, commune_id, neighborhood_id))
  );

drop policy if exists people_write_admin_secretaria on public.people;
create policy people_write_admin_secretaria on public.people
  for insert
  to authenticated
  with check (public.is_admin() or public.current_app_role() = 'secretaria');

drop policy if exists people_update_admin_secretaria on public.people;
create policy people_update_admin_secretaria on public.people
  for update
  to authenticated
  using (public.is_admin() or public.current_app_role() = 'secretaria')
  with check (public.is_admin() or public.current_app_role() = 'secretaria');

drop policy if exists people_delete_admin on public.people;
create policy people_delete_admin on public.people
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists leaders_select_role on public.leaders;
create policy leaders_select_role on public.leaders
  for select
  to authenticated
  using (
    public.is_admin()
    or public.current_app_role() = 'secretaria'
    or (public.current_app_role() = 'coordinador_territorial' and public.leader_has_territory_access(id))
  );

drop policy if exists leaders_write_admin on public.leaders;
create policy leaders_write_admin on public.leaders
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists leader_assignments_select_role on public.leader_assignments;
create policy leader_assignments_select_role on public.leader_assignments
  for select
  to authenticated
  using (public.is_admin() or public.current_app_role() = 'secretaria' or public.leader_has_territory_access(leader_id));

drop policy if exists leader_assignments_write_admin on public.leader_assignments;
create policy leader_assignments_write_admin on public.leader_assignments
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists person_tags_select_role on public.person_tags;
create policy person_tags_select_role on public.person_tags for select to authenticated using (public.is_admin() or public.current_app_role() = 'secretaria');
drop policy if exists person_tags_write_admin_secretaria on public.person_tags;
create policy person_tags_write_admin_secretaria on public.person_tags for all to authenticated using (public.is_admin() or public.current_app_role() = 'secretaria') with check (public.is_admin() or public.current_app_role() = 'secretaria');

drop policy if exists person_documents_select_role on public.person_documents;
create policy person_documents_select_role on public.person_documents
  for select
  to authenticated
  using (
    public.is_admin()
    or public.current_app_role() = 'secretaria'
    or (public.current_app_role() = 'abogado' and visibility_scope in ('public', 'legal'))
  );

drop policy if exists person_documents_write_admin_secretaria on public.person_documents;
create policy person_documents_write_admin_secretaria on public.person_documents
  for all
  to authenticated
  using (public.is_admin() or public.current_app_role() = 'secretaria')
  with check (public.is_admin() or public.current_app_role() = 'secretaria');

drop policy if exists campaigns_select_admin on public.campaigns;
create policy campaigns_select_admin on public.campaigns for select to authenticated using (public.is_admin());
drop policy if exists campaigns_write_admin on public.campaigns;
create policy campaigns_write_admin on public.campaigns for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists campaign_segments_select_admin on public.campaign_segments;
create policy campaign_segments_select_admin on public.campaign_segments for select to authenticated using (public.is_admin());
drop policy if exists campaign_segments_write_admin on public.campaign_segments;
create policy campaign_segments_write_admin on public.campaign_segments for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists automation_templates_select_admin on public.automation_templates;
create policy automation_templates_select_admin on public.automation_templates for select to authenticated using (public.is_admin());
drop policy if exists automation_templates_write_admin on public.automation_templates;
create policy automation_templates_write_admin on public.automation_templates for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists automation_rules_select_admin on public.automation_rules;
create policy automation_rules_select_admin on public.automation_rules for select to authenticated using (public.is_admin());
drop policy if exists automation_rules_write_admin on public.automation_rules;
create policy automation_rules_write_admin on public.automation_rules for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists important_dates_select_admin on public.important_dates;
create policy important_dates_select_admin on public.important_dates for select to authenticated using (public.is_admin());
drop policy if exists important_dates_write_admin on public.important_dates;
create policy important_dates_write_admin on public.important_dates for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists admin_invitations_select_admin on public.admin_invitations;
create policy admin_invitations_select_admin on public.admin_invitations for select to authenticated using (public.is_admin());
drop policy if exists admin_invitations_write_admin on public.admin_invitations;
create policy admin_invitations_write_admin on public.admin_invitations for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists automation_runs_select_admin on public.automation_runs;
create policy automation_runs_select_admin on public.automation_runs for select to authenticated using (public.is_admin());
drop policy if exists automation_runs_write_admin on public.automation_runs;
create policy automation_runs_write_admin on public.automation_runs for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists message_batches_select_admin on public.message_batches;
create policy message_batches_select_admin on public.message_batches for select to authenticated using (public.is_admin());
drop policy if exists message_batches_write_admin on public.message_batches;
create policy message_batches_write_admin on public.message_batches for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists message_recipients_select_admin on public.message_recipients;
create policy message_recipients_select_admin on public.message_recipients for select to authenticated using (public.is_admin());
drop policy if exists message_recipients_write_admin on public.message_recipients;
create policy message_recipients_write_admin on public.message_recipients for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists public_submissions_insert_public on public.public_submissions;
create policy public_submissions_insert_public on public.public_submissions for insert to anon with check (true);

drop policy if exists public_submissions_select_admin on public.public_submissions;
create policy public_submissions_select_admin on public.public_submissions for select to authenticated using (public.is_admin() or public.current_app_role() = 'secretaria');

drop policy if exists public_submission_events_select_admin on public.public_submission_events;
create policy public_submission_events_select_admin on public.public_submission_events for select to authenticated using (public.is_admin() or public.current_app_role() = 'secretaria');
drop policy if exists public_submission_events_write_admin on public.public_submission_events;
create policy public_submission_events_write_admin on public.public_submission_events for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists user_territory_access_select_admin on public.user_territory_access;
create policy user_territory_access_select_admin on public.user_territory_access for select to authenticated using (public.is_admin());
drop policy if exists user_territory_access_write_admin on public.user_territory_access;
create policy user_territory_access_write_admin on public.user_territory_access for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists audit_logs_select_admin on public.audit_logs;
create policy audit_logs_select_admin on public.audit_logs for select to authenticated using (public.is_admin());
drop policy if exists audit_logs_write_admin on public.audit_logs;
create policy audit_logs_write_admin on public.audit_logs for all to authenticated using (public.is_admin()) with check (public.is_admin());
