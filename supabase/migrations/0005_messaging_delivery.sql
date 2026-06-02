do $$ begin
  create type public.canal_mensaje as enum ('whatsapp', 'correo', 'sms');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.estado_envio_mensaje as enum ('pendiente', 'enviado', 'fallido', 'parcial', 'simulado');
exception
  when duplicate_object then null;
end $$;

alter table public.personas
  add column if not exists fecha_nacimiento date;

create table if not exists public.envios_mensajes (
  id uuid primary key default gen_random_uuid(),
  canal public.canal_mensaje not null,
  audiencia text not null,
  asunto text,
  cuerpo text not null,
  estado public.estado_envio_mensaje not null default 'pendiente',
  proveedor text,
  modo_simulacion boolean not null default false,
  total_destinatarios integer not null default 0,
  total_enviados integer not null default 0,
  total_fallidos integer not null default 0,
  enviado_por uuid references public.perfiles(id) on delete set null,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.destinatarios_mensaje (
  id uuid primary key default gen_random_uuid(),
  envio_id uuid not null references public.envios_mensajes(id) on delete cascade,
  persona_id uuid references public.personas(id) on delete set null,
  nombre text not null,
  email text,
  telefono text,
  whatsapp text,
  estado public.estado_envio_mensaje not null default 'pendiente',
  proveedor text,
  proveedor_message_id text,
  error text,
  enviado_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists envios_mensajes_created_at_idx on public.envios_mensajes(created_at desc);
create index if not exists envios_mensajes_canal_idx on public.envios_mensajes(canal);
create index if not exists destinatarios_mensaje_envio_idx on public.destinatarios_mensaje(envio_id);
create index if not exists destinatarios_mensaje_persona_idx on public.destinatarios_mensaje(persona_id);
create index if not exists personas_fecha_nacimiento_idx on public.personas(fecha_nacimiento);

drop trigger if exists set_envios_mensajes_updated_at on public.envios_mensajes;
create trigger set_envios_mensajes_updated_at
before update on public.envios_mensajes
for each row execute function public.set_updated_at();

alter table public.envios_mensajes enable row level security;
alter table public.destinatarios_mensaje enable row level security;

drop policy if exists envios_mensajes_select_operativo on public.envios_mensajes;
create policy envios_mensajes_select_operativo on public.envios_mensajes
for select to authenticated
using (public.current_app_role() in ('admin_principal', 'doctor', 'secretaria'));

drop policy if exists envios_mensajes_write_alertas on public.envios_mensajes;
create policy envios_mensajes_write_alertas on public.envios_mensajes
for all to authenticated
using (
  exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and (p.role = 'admin_principal' or p.can_manage_alerts = true)
  )
)
with check (
  exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and (p.role = 'admin_principal' or p.can_manage_alerts = true)
  )
);

drop policy if exists destinatarios_mensaje_select_operativo on public.destinatarios_mensaje;
create policy destinatarios_mensaje_select_operativo on public.destinatarios_mensaje
for select to authenticated
using (
  exists (
    select 1
    from public.envios_mensajes em
    where em.id = destinatarios_mensaje.envio_id
      and public.current_app_role() in ('admin_principal', 'doctor', 'secretaria')
  )
);

drop policy if exists destinatarios_mensaje_write_alertas on public.destinatarios_mensaje;
create policy destinatarios_mensaje_write_alertas on public.destinatarios_mensaje
for all to authenticated
using (
  exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and (p.role = 'admin_principal' or p.can_manage_alerts = true)
  )
)
with check (
  exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and (p.role = 'admin_principal' or p.can_manage_alerts = true)
  )
);
