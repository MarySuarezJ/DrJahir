create sequence if not exists public.envios_mensajes_codigo_seq;
alter table public.envios_mensajes add column if not exists codigo text;
update public.envios_mensajes
set codigo = 'EN_' || lpad(nextval('public.envios_mensajes_codigo_seq')::text, 3, '0')
where codigo is null;
create unique index if not exists envios_mensajes_codigo_idx on public.envios_mensajes(codigo);
drop trigger if exists envios_mensajes_codigo_before_insert on public.envios_mensajes;
create trigger envios_mensajes_codigo_before_insert
before insert on public.envios_mensajes
for each row execute function public.set_codigo_prefijado('EN_', 'public.envios_mensajes_codigo_seq');

create sequence if not exists public.destinatarios_mensaje_codigo_seq;
alter table public.destinatarios_mensaje add column if not exists codigo text;
update public.destinatarios_mensaje
set codigo = 'DM_' || lpad(nextval('public.destinatarios_mensaje_codigo_seq')::text, 3, '0')
where codigo is null;
create unique index if not exists destinatarios_mensaje_codigo_idx on public.destinatarios_mensaje(codigo);
drop trigger if exists destinatarios_mensaje_codigo_before_insert on public.destinatarios_mensaje;
create trigger destinatarios_mensaje_codigo_before_insert
before insert on public.destinatarios_mensaje
for each row execute function public.set_codigo_prefijado('DM_', 'public.destinatarios_mensaje_codigo_seq');

create or replace view public.operacion_departamentos as
select
  d.codigo as codigo_departamento,
  d.name as departamento,
  d.code as divipola
from public.departamentos d;

create or replace view public.operacion_municipios as
select
  m.codigo as codigo_municipio,
  m.name as municipio,
  m.code as divipola_municipio,
  d.codigo as codigo_departamento,
  d.name as departamento,
  m.support_score as puntaje_apoyo,
  case
    when m.code is null or btrim(m.code) = '' then 'pendiente_codigo_divipola'
    else 'completo'
  end as estado_datos
from public.municipios m
left join public.departamentos d on d.id = m.department_id;

create or replace view public.operacion_comunas_barrios as
select
  m.codigo as codigo_municipio,
  m.name as municipio,
  c.codigo as codigo_comuna,
  c.name as comuna_zona,
  c.code as codigo_comuna_original,
  b.codigo as codigo_barrio,
  b.name as barrio_vereda,
  b.code as codigo_barrio_original
from public.comunas c
left join public.municipios m on m.id = c.municipality_id
left join public.barrios b on b.commune_id = c.id;

create or replace view public.operacion_puestos_mesas as
select
  pv.codigo as codigo_puesto,
  pv.name as puesto_votacion,
  pv.code as codigo_puesto_original,
  m.codigo as codigo_municipio,
  m.name as municipio,
  c.codigo as codigo_comuna,
  c.name as comuna_zona,
  b.codigo as codigo_barrio,
  b.name as barrio_vereda,
  mt.codigo as codigo_mesa,
  mt.table_number as mesa,
  pv.latitude as latitud,
  pv.longitude as longitud
from public.puestos_votacion pv
left join public.municipios m on m.id = pv.municipality_id
left join public.comunas c on c.id = pv.commune_id
left join public.barrios b on b.id = pv.neighborhood_id
left join public.mesas_votacion mt on mt.voting_center_id = pv.id;

create or replace view public.operacion_personas as
select
  p.codigo as codigo_persona,
  p.document_number as cedula,
  concat_ws(' ', p.first_name, p.last_name) as nombre,
  p.fecha_nacimiento,
  p.phone as telefono,
  p.whatsapp,
  p.email as correo,
  p.support_label as tipo,
  p.support_score as puntaje_apoyo,
  p.profession as profesion,
  p.company as empresa,
  p.job_title as cargo,
  p.employment_status as estado_laboral,
  d.codigo as codigo_departamento,
  d.name as departamento,
  m.codigo as codigo_municipio,
  m.name as municipio,
  p.comuna as comuna_zona,
  p.barrio as barrio_vereda,
  p.address as direccion,
  vc.codigo as codigo_puesto,
  vc.name as puesto_votacion,
  vt.codigo as codigo_mesa,
  vt.table_number as mesa,
  l.codigo as codigo_lider,
  concat_ws(' ', lp.first_name, lp.last_name) as lider,
  p.resume_path as hoja_vida,
  p.visibility_scope as visibilidad,
  p.notes as notas,
  p.created_at as creado_en
from public.personas p
left join public.departamentos d on d.id = p.department_id
left join public.municipios m on m.id = p.municipality_id
left join public.puestos_votacion vc on vc.id = p.voting_center_id
left join public.mesas_votacion vt on vt.id = p.voting_table_id
left join public.lideres l on l.id = p.leader_id
left join public.personas lp on lp.id = l.person_id;

create or replace view public.operacion_personas_pendientes as
select
  p.codigo as codigo_persona,
  p.document_number as cedula,
  concat_ws(' ', p.first_name, p.last_name) as nombre,
  case when m.name is null or m.name = 'Por asignar' then 'pendiente' else 'ok' end as municipio,
  case when p.barrio is null or btrim(p.barrio) = '' then 'pendiente' else 'ok' end as barrio_vereda,
  case when p.fecha_nacimiento is null then 'pendiente' else 'ok' end as fecha_nacimiento,
  case when p.voting_center_id is null then 'pendiente' else 'ok' end as puesto_votacion,
  case when p.voting_table_id is null then 'pendiente' else 'ok' end as mesa,
  case when p.phone is null and p.whatsapp is null then 'pendiente' else 'ok' end as contacto,
  p.created_at as creado_en
from public.personas p
left join public.municipios m on m.id = p.municipality_id
where m.name is null
   or m.name = 'Por asignar'
   or p.barrio is null
   or btrim(p.barrio) = ''
   or p.fecha_nacimiento is null
   or p.voting_center_id is null
   or p.voting_table_id is null
   or (p.phone is null and p.whatsapp is null);

create or replace view public.operacion_lideres as
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
group by l.codigo, p.codigo, p.document_number, p.first_name, p.last_name, l.title, l.leader_level, l.influence_score, l.active;

create or replace view public.operacion_usuarios as
select
  p.codigo as codigo_usuario,
  p.username as usuario,
  p.full_name as nombre,
  p.email as correo,
  p.role as rol,
  p.status as estado,
  p.territory as territorio,
  p.can_manage_alerts as puede_gestionar_alertas,
  p.created_at as creado_en
from public.perfiles p;

create or replace view public.operacion_registros_publicos as
select
  r.codigo as codigo_registro,
  r.document_number as cedula,
  r.full_name as nombre,
  r.birth_date as fecha_nacimiento,
  r.phone as telefono,
  r.whatsapp,
  r.email as correo,
  r.submission_type as tipo,
  r.department as departamento,
  r.municipality as municipio,
  r.commune as comuna_zona,
  r.neighborhood as barrio_vereda,
  r.voting_place as puesto_votacion,
  r.voting_table as mesa,
  r.profession as profesion,
  r.company as empresa,
  r.job_title as cargo,
  r.employment_status as estado_laboral,
  r.leader_name as lider_refiere,
  r.resume_path as hoja_vida,
  r.status as estado,
  r.created_at as creado_en
from public.registros_publicos r;

create or replace view public.operacion_envios_mensajes as
select
  e.codigo as codigo_envio,
  e.canal,
  e.audiencia,
  e.asunto,
  e.cuerpo,
  e.estado,
  e.proveedor,
  e.modo_simulacion,
  e.total_destinatarios,
  e.total_enviados,
  e.total_fallidos,
  p.codigo as codigo_usuario_envia,
  p.full_name as usuario_envia,
  e.error,
  e.created_at as creado_en,
  e.updated_at as actualizado_en
from public.envios_mensajes e
left join public.perfiles p on p.id = e.enviado_por;

create or replace view public.operacion_destinatarios_mensaje as
select
  d.codigo as codigo_destinatario,
  e.codigo as codigo_envio,
  p.codigo as codigo_persona,
  d.nombre,
  d.email as correo,
  d.telefono,
  d.whatsapp,
  d.estado,
  d.proveedor,
  d.proveedor_message_id,
  d.error,
  d.enviado_at as enviado_en,
  d.created_at as creado_en
from public.destinatarios_mensaje d
left join public.envios_mensajes e on e.id = d.envio_id
left join public.personas p on p.id = d.persona_id;

grant select on
  public.operacion_departamentos,
  public.operacion_municipios,
  public.operacion_comunas_barrios,
  public.operacion_puestos_mesas,
  public.operacion_personas,
  public.operacion_personas_pendientes,
  public.operacion_lideres,
  public.operacion_usuarios,
  public.operacion_registros_publicos,
  public.operacion_envios_mensajes,
  public.operacion_destinatarios_mensaje
to authenticated;
