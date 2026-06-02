do $$ begin
  if to_regclass('public.profiles') is not null and to_regclass('public.perfiles') is null then
    alter table public.profiles rename to perfiles;
  end if;

  if to_regclass('public.departments') is not null and to_regclass('public.departamentos') is null then
    alter table public.departments rename to departamentos;
  end if;

  if to_regclass('public.municipalities') is not null and to_regclass('public.municipios') is null then
    alter table public.municipalities rename to municipios;
  end if;

  if to_regclass('public.communes') is not null and to_regclass('public.comunas') is null then
    alter table public.communes rename to comunas;
  end if;

  if to_regclass('public.neighborhoods') is not null and to_regclass('public.barrios') is null then
    alter table public.neighborhoods rename to barrios;
  end if;

  if to_regclass('public.voting_centers') is not null and to_regclass('public.puestos_votacion') is null then
    alter table public.voting_centers rename to puestos_votacion;
  end if;

  if to_regclass('public.voting_tables') is not null and to_regclass('public.mesas_votacion') is null then
    alter table public.voting_tables rename to mesas_votacion;
  end if;

  if to_regclass('public.people') is not null and to_regclass('public.personas') is null then
    alter table public.people rename to personas;
  end if;

  if to_regclass('public.leaders') is not null and to_regclass('public.lideres') is null then
    alter table public.leaders rename to lideres;
  end if;

  if to_regclass('public.leader_assignments') is not null and to_regclass('public.asignaciones_lideres') is null then
    alter table public.leader_assignments rename to asignaciones_lideres;
  end if;

  if to_regclass('public.person_tags') is not null and to_regclass('public.etiquetas_persona') is null then
    alter table public.person_tags rename to etiquetas_persona;
  end if;

  if to_regclass('public.person_documents') is not null and to_regclass('public.documentos_persona') is null then
    alter table public.person_documents rename to documentos_persona;
  end if;

  if to_regclass('public.important_dates') is not null and to_regclass('public.fechas_importantes') is null then
    alter table public.important_dates rename to fechas_importantes;
  end if;

  if to_regclass('public.public_submissions') is not null and to_regclass('public.registros_publicos') is null then
    alter table public.public_submissions rename to registros_publicos;
  end if;

  if to_regclass('public.user_territory_access') is not null and to_regclass('public.accesos_territoriales_usuario') is null then
    alter table public.user_territory_access rename to accesos_territoriales_usuario;
  end if;
end $$;

create or replace function public.current_app_role()
returns app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.perfiles where id = auth.uid()), 'secretaria'::app_role);
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
    from public.accesos_territoriales_usuario uta
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
    from public.asignaciones_lideres la
    join public.accesos_territoriales_usuario uta on uta.user_id = auth.uid()
    where la.leader_id = p_leader_id
      and (
        (la.neighborhood_id is not null and uta.neighborhood_id = la.neighborhood_id)
        or (la.commune_id is not null and uta.commune_id = la.commune_id)
        or (la.municipality_id is not null and uta.municipality_id = la.municipality_id)
      )
  );
$$;
