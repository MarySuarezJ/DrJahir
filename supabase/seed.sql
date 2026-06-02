-- Carga base territorial y fechas importantes iniciales.
-- Municipios de Caldas validados contra DIVIPOLA DANE MGN 2024.
-- support_score es un valor interno editable, no un dato oficial.

insert into public.departments (name, code)
values ('Caldas', '17')
on conflict (name) do update set code = excluded.code;

insert into public.municipalities (department_id, name, code, support_score)
select d.id, item.name, item.code, item.support_score
from public.departments d
cross join (
  values
    ('Aguadas', '17013', 68.00),
    ('Anserma', '17042', 67.00),
    ('Aranzazu', '17050', 0.00),
    ('Belalcázar', '17088', 0.00),
    ('Chinchiná', '17174', 69.00),
    ('Filadelfia', '17272', 0.00),
    ('La Dorada', '17380', 63.00),
    ('La Merced', '17388', 0.00),
    ('Manizales', '17001', 81.00),
    ('Manzanares', '17433', 73.00),
    ('Marmato', '17442', 0.00),
    ('Marquetalia', '17444', 0.00),
    ('Marulanda', '17446', 0.00),
    ('Neira', '17486', 74.00),
    ('Norcasia', '17495', 0.00),
    ('Pácora', '17513', 0.00),
    ('Palestina', '17524', 72.00),
    ('Pensilvania', '17541', 65.00),
    ('Riosucio', '17614', 66.00),
    ('Risaralda', '17616', 0.00),
    ('Salamina', '17653', 71.00),
    ('Samaná', '17662', 0.00),
    ('San José', '17665', 0.00),
    ('Supía', '17777', 70.00),
    ('Victoria', '17867', 0.00),
    ('Villamaría', '17873', 76.00),
    ('Viterbo', '17877', 0.00)
) as item(name, code, support_score)
where d.name = 'Caldas'
on conflict (department_id, name) do update
set code = excluded.code,
    support_score = excluded.support_score;

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
