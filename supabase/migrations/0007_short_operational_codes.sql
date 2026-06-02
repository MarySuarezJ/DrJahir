create or replace function public.set_codigo_prefijado()
returns trigger
language plpgsql
as $$
declare
  prefix text := TG_ARGV[0];
  sequence_name text := TG_ARGV[1];
  next_number bigint;
begin
  if new.codigo is null or btrim(new.codigo) = '' then
    execute 'select nextval($1::regclass)' into next_number using sequence_name;
    new.codigo := prefix || lpad(next_number::text, 3, '0');
  end if;

  return new;
end;
$$;

create sequence if not exists public.perfiles_codigo_seq;
alter table public.perfiles add column if not exists codigo text;
update public.perfiles
set codigo = 'US_' || lpad(nextval('public.perfiles_codigo_seq')::text, 3, '0')
where codigo is null;
create unique index if not exists perfiles_codigo_idx on public.perfiles(codigo);
drop trigger if exists perfiles_codigo_before_insert on public.perfiles;
create trigger perfiles_codigo_before_insert
before insert on public.perfiles
for each row execute function public.set_codigo_prefijado('US_', 'public.perfiles_codigo_seq');

create sequence if not exists public.personas_codigo_seq;
alter table public.personas add column if not exists codigo text;
update public.personas
set codigo = 'PE_' || lpad(nextval('public.personas_codigo_seq')::text, 3, '0')
where codigo is null;
create unique index if not exists personas_codigo_idx on public.personas(codigo);
drop trigger if exists personas_codigo_before_insert on public.personas;
create trigger personas_codigo_before_insert
before insert on public.personas
for each row execute function public.set_codigo_prefijado('PE_', 'public.personas_codigo_seq');

create sequence if not exists public.lideres_codigo_seq;
alter table public.lideres add column if not exists codigo text;
update public.lideres
set codigo = 'LI_' || lpad(nextval('public.lideres_codigo_seq')::text, 3, '0')
where codigo is null;
create unique index if not exists lideres_codigo_idx on public.lideres(codigo);
drop trigger if exists lideres_codigo_before_insert on public.lideres;
create trigger lideres_codigo_before_insert
before insert on public.lideres
for each row execute function public.set_codigo_prefijado('LI_', 'public.lideres_codigo_seq');

create sequence if not exists public.registros_publicos_codigo_seq;
alter table public.registros_publicos add column if not exists codigo text;
update public.registros_publicos
set codigo = 'RP_' || lpad(nextval('public.registros_publicos_codigo_seq')::text, 3, '0')
where codigo is null;
create unique index if not exists registros_publicos_codigo_idx on public.registros_publicos(codigo);
drop trigger if exists registros_publicos_codigo_before_insert on public.registros_publicos;
create trigger registros_publicos_codigo_before_insert
before insert on public.registros_publicos
for each row execute function public.set_codigo_prefijado('RP_', 'public.registros_publicos_codigo_seq');

create sequence if not exists public.fechas_importantes_codigo_seq;
alter table public.fechas_importantes add column if not exists codigo text;
update public.fechas_importantes
set codigo = 'FI_' || lpad(nextval('public.fechas_importantes_codigo_seq')::text, 3, '0')
where codigo is null;
create unique index if not exists fechas_importantes_codigo_idx on public.fechas_importantes(codigo);
drop trigger if exists fechas_importantes_codigo_before_insert on public.fechas_importantes;
create trigger fechas_importantes_codigo_before_insert
before insert on public.fechas_importantes
for each row execute function public.set_codigo_prefijado('FI_', 'public.fechas_importantes_codigo_seq');

alter table public.departamentos add column if not exists codigo text;
with numbered as (
  select id, row_number() over (order by name) as rn
  from public.departamentos
  where codigo is null
)
update public.departamentos d
set codigo = coalesce(d.code, 'DEP_' || lpad(numbered.rn::text, 3, '0'))
from numbered
where d.id = numbered.id;
create unique index if not exists departamentos_codigo_idx on public.departamentos(codigo);

alter table public.municipios add column if not exists codigo text;
with numbered as (
  select id, row_number() over (order by name) as rn
  from public.municipios
  where codigo is null
)
update public.municipios m
set codigo = coalesce(m.code, 'MUN_' || lpad(numbered.rn::text, 3, '0'))
from numbered
where m.id = numbered.id;
create unique index if not exists municipios_codigo_idx on public.municipios(codigo);

create sequence if not exists public.comunas_codigo_seq;
alter table public.comunas add column if not exists codigo text;
update public.comunas
set codigo = coalesce(code, 'CO_' || lpad(nextval('public.comunas_codigo_seq')::text, 3, '0'))
where codigo is null;
create unique index if not exists comunas_codigo_idx on public.comunas(codigo);
drop trigger if exists comunas_codigo_before_insert on public.comunas;
create trigger comunas_codigo_before_insert
before insert on public.comunas
for each row execute function public.set_codigo_prefijado('CO_', 'public.comunas_codigo_seq');

create sequence if not exists public.barrios_codigo_seq;
alter table public.barrios add column if not exists codigo text;
update public.barrios
set codigo = coalesce(code, 'BA_' || lpad(nextval('public.barrios_codigo_seq')::text, 3, '0'))
where codigo is null;
create unique index if not exists barrios_codigo_idx on public.barrios(codigo);
drop trigger if exists barrios_codigo_before_insert on public.barrios;
create trigger barrios_codigo_before_insert
before insert on public.barrios
for each row execute function public.set_codigo_prefijado('BA_', 'public.barrios_codigo_seq');

create sequence if not exists public.puestos_votacion_codigo_seq;
alter table public.puestos_votacion add column if not exists codigo text;
update public.puestos_votacion
set codigo = coalesce(code, 'PV_' || lpad(nextval('public.puestos_votacion_codigo_seq')::text, 3, '0'))
where codigo is null;
create unique index if not exists puestos_votacion_codigo_idx on public.puestos_votacion(codigo);
drop trigger if exists puestos_votacion_codigo_before_insert on public.puestos_votacion;
create trigger puestos_votacion_codigo_before_insert
before insert on public.puestos_votacion
for each row execute function public.set_codigo_prefijado('PV_', 'public.puestos_votacion_codigo_seq');

create sequence if not exists public.mesas_votacion_codigo_seq;
alter table public.mesas_votacion add column if not exists codigo text;
update public.mesas_votacion
set codigo = 'ME_' || lpad(nextval('public.mesas_votacion_codigo_seq')::text, 3, '0')
where codigo is null;
create unique index if not exists mesas_votacion_codigo_idx on public.mesas_votacion(codigo);
drop trigger if exists mesas_votacion_codigo_before_insert on public.mesas_votacion;
create trigger mesas_votacion_codigo_before_insert
before insert on public.mesas_votacion
for each row execute function public.set_codigo_prefijado('ME_', 'public.mesas_votacion_codigo_seq');

create sequence if not exists public.documentos_persona_codigo_seq;
alter table public.documentos_persona add column if not exists codigo text;
update public.documentos_persona
set codigo = 'DO_' || lpad(nextval('public.documentos_persona_codigo_seq')::text, 3, '0')
where codigo is null;
create unique index if not exists documentos_persona_codigo_idx on public.documentos_persona(codigo);
drop trigger if exists documentos_persona_codigo_before_insert on public.documentos_persona;
create trigger documentos_persona_codigo_before_insert
before insert on public.documentos_persona
for each row execute function public.set_codigo_prefijado('DO_', 'public.documentos_persona_codigo_seq');
