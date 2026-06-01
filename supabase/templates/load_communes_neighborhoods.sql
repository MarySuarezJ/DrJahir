-- Plantilla para cargar comunas, barrios/veredas y puestos de votación.
-- Puedes ejecutar este archivo varias veces: las consultas evitan duplicados.

-- 1) Cargar comunas o zonas dentro de un municipio.
-- Cambia 'Manizales' y los nombres por tu listado real.
with municipality as (
  select id
  from public.municipalities
  where name = 'Manizales'
)
insert into public.communes (municipality_id, name, code)
select municipality.id, item.name, item.code
from municipality
cross join (
  values
    ('Comuna o zona 1', 'MZ-01'),
    ('Comuna o zona 2', 'MZ-02')
) as item(name, code)
on conflict (municipality_id, name) do update
set code = excluded.code;

-- 2) Cargar barrios o veredas dentro de una comuna/zona.
-- Cambia los nombres por tu listado real.
with commune as (
  select c.id
  from public.communes c
  join public.municipalities m on m.id = c.municipality_id
  where m.name = 'Manizales'
    and c.name = 'Comuna o zona 1'
)
insert into public.neighborhoods (commune_id, name, code)
select commune.id, item.name, item.code
from commune
cross join (
  values
    ('Barrio o vereda 1', 'B-001'),
    ('Barrio o vereda 2', 'B-002')
) as item(name, code)
on conflict (commune_id, name) do update
set code = excluded.code;

-- 3) Cargar puestos de votación, si ya tienes el listado.
with territory as (
  select
    m.id as municipality_id,
    c.id as commune_id,
    n.id as neighborhood_id
  from public.municipalities m
  left join public.communes c on c.municipality_id = m.id and c.name = 'Comuna o zona 1'
  left join public.neighborhoods n on n.commune_id = c.id and n.name = 'Barrio o vereda 1'
  where m.name = 'Manizales'
)
insert into public.voting_centers (municipality_id, commune_id, neighborhood_id, name, code, latitude, longitude)
select territory.municipality_id, territory.commune_id, territory.neighborhood_id, item.name, item.code, item.latitude, item.longitude
from territory
cross join (
  values
    ('Puesto de votación 1', 'PV-001', null::numeric, null::numeric),
    ('Puesto de votación 2', 'PV-002', null::numeric, null::numeric)
) as item(name, code, latitude, longitude)
where not exists (
  select 1
  from public.voting_centers vc
  where vc.municipality_id = territory.municipality_id
    and vc.name = item.name
);
