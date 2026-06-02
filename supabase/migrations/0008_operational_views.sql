create or replace view public.vista_municipios_operacion as
select
  m.codigo as codigo_municipio,
  m.name as municipio,
  m.code as divipola,
  d.codigo as codigo_departamento,
  d.name as departamento,
  m.support_score as puntaje_apoyo
from public.municipios m
left join public.departamentos d on d.id = m.department_id
order by m.name;

create or replace view public.vista_personas_operacion as
select
  p.codigo as codigo_persona,
  p.document_number as cedula,
  concat_ws(' ', p.first_name, p.last_name) as nombre,
  p.support_label as tipo,
  p.fecha_nacimiento,
  p.phone as telefono,
  p.whatsapp,
  p.email as correo,
  p.profession as profesion,
  p.company as empresa,
  p.job_title as cargo,
  p.employment_status as estado_laboral,
  d.name as departamento,
  m.codigo as codigo_municipio,
  m.name as municipio,
  p.comuna,
  p.barrio,
  vc.codigo as codigo_puesto,
  vc.name as puesto_votacion,
  vt.codigo as codigo_mesa,
  vt.table_number as mesa,
  l.codigo as codigo_lider,
  concat_ws(' ', lp.first_name, lp.last_name) as lider,
  p.resume_path as hoja_vida,
  p.visibility_scope as visibilidad,
  p.created_at
from public.personas p
left join public.departamentos d on d.id = p.department_id
left join public.municipios m on m.id = p.municipality_id
left join public.puestos_votacion vc on vc.id = p.voting_center_id
left join public.mesas_votacion vt on vt.id = p.voting_table_id
left join public.lideres l on l.id = p.leader_id
left join public.personas lp on lp.id = l.person_id
order by p.created_at desc;

create or replace view public.vista_lideres_operacion as
select
  l.codigo as codigo_lider,
  p.codigo as codigo_persona,
  p.document_number as cedula,
  concat_ws(' ', p.first_name, p.last_name) as lider,
  l.title as sector,
  l.leader_level as nivel,
  l.influence_score as puntaje_influencia,
  l.active as activo,
  count(asignado.id) as personas_a_cargo
from public.lideres l
join public.personas p on p.id = l.person_id
left join public.personas asignado on asignado.leader_id = l.id
group by l.codigo, p.codigo, p.document_number, p.first_name, p.last_name, l.title, l.leader_level, l.influence_score, l.active
order by lider;

create or replace view public.vista_usuarios_operacion as
select
  codigo as codigo_usuario,
  username as usuario,
  full_name as nombre,
  email as correo,
  role as rol,
  status as estado,
  territory as territorio,
  can_manage_alerts as puede_gestionar_alertas,
  created_at
from public.perfiles
order by created_at desc;

create or replace view public.vista_registros_publicos_operacion as
select
  codigo as codigo_registro,
  document_number as cedula,
  full_name as nombre,
  birth_date as fecha_nacimiento,
  phone as telefono,
  whatsapp,
  email as correo,
  submission_type as tipo,
  municipality as municipio,
  commune as comuna_zona,
  neighborhood as barrio_vereda,
  voting_place as puesto_votacion,
  voting_table as mesa,
  profession as profesion,
  company as empresa,
  job_title as cargo,
  employment_status as estado_laboral,
  leader_name as lider_refiere,
  resume_path as hoja_vida,
  status as estado,
  created_at
from public.registros_publicos
order by created_at desc;

create or replace view public.vista_votacion_operacion as
select
  pv.codigo as codigo_puesto,
  pv.name as puesto_votacion,
  m.codigo as codigo_municipio,
  m.name as municipio,
  c.codigo as codigo_comuna,
  c.name as comuna_zona,
  b.codigo as codigo_barrio,
  b.name as barrio_vereda,
  pv.latitude as latitud,
  pv.longitude as longitud,
  mt.codigo as codigo_mesa,
  mt.table_number as mesa
from public.puestos_votacion pv
left join public.municipios m on m.id = pv.municipality_id
left join public.comunas c on c.id = pv.commune_id
left join public.barrios b on b.id = pv.neighborhood_id
left join public.mesas_votacion mt on mt.voting_center_id = pv.id
order by m.name, pv.name, mt.table_number;
