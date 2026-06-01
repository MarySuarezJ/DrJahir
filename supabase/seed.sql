insert into public.departments (name, code)
values ('Caldas', '17')
on conflict (name) do update set code = excluded.code;

insert into public.municipalities (department_id, name, code, support_score)
select d.id, item.name, item.code, item.support_score
from public.departments d
cross join (
  values
    ('Manizales', '17001', 81.00),
    ('Villamaría', '17873', 76.00),
    ('Chinchiná', '17174', 69.00),
    ('La Dorada', '17380', 63.00),
    ('Riosucio', '17614', 66.00),
    ('Neira', '17486', 74.00),
    ('Palestina', '17524', 72.00),
    ('Supía', '17777', 70.00)
) as item(name, code, support_score)
where d.name = 'Caldas'
on conflict (department_id, name) do update
set code = excluded.code,
    support_score = excluded.support_score;

insert into public.automation_templates (name, channel, trigger_type, subject, body, variables_schema, active)
select 'Feliz cumpleaños', 'whatsapp', 'birthday', null,
       'Hola {nombre}, desde el equipo del Dr. Jahir te deseamos un feliz cumpleaños.',
       '{"nombre": "Nombre de la persona"}'::jsonb,
       true
where not exists (select 1 from public.automation_templates where name = 'Feliz cumpleaños');

insert into public.automation_templates (name, channel, trigger_type, subject, body, variables_schema, active)
select 'Día profesional', 'email', 'profession_day', 'Reconocimiento especial',
       'Hola {nombre}, hoy reconocemos tu labor profesional y tu aporte al territorio.',
       '{"nombre": "Nombre de la persona", "profesion": "Profesión"}'::jsonb,
       true
where not exists (select 1 from public.automation_templates where name = 'Día profesional');

insert into public.important_dates (title, date_type, date_month, date_day, channel, audience_scope, message_template, active)
select 'Día del maestro', 'profession_day', 5, 15, 'email',
       '{"profession": ["docente", "profesor", "maestro"]}'::jsonb,
       'Gracias por educar y construir territorio. Feliz día del maestro, {nombre}.',
       true
where not exists (select 1 from public.important_dates where title = 'Día del maestro');

insert into public.important_dates (title, date_type, date_month, date_day, channel, audience_scope, message_template, active)
select 'Día del profesional de la salud', 'profession_day', 12, 3, 'whatsapp',
       '{"sector": ["salud"]}'::jsonb,
       'Reconocemos tu vocación y servicio. Gracias por cuidar a nuestra gente.',
       true
where not exists (select 1 from public.important_dates where title = 'Día del profesional de la salud');
