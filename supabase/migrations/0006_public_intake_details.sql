alter table public.registros_publicos
  add column if not exists document_number text,
  add column if not exists birth_date date,
  add column if not exists whatsapp text,
  add column if not exists department text default 'Caldas',
  add column if not exists municipality text,
  add column if not exists commune text,
  add column if not exists neighborhood text,
  add column if not exists address text,
  add column if not exists profession text,
  add column if not exists company text,
  add column if not exists job_title text,
  add column if not exists employment_status text,
  add column if not exists voting_place text,
  add column if not exists voting_table text,
  add column if not exists leader_name text,
  add column if not exists resume_path text,
  add column if not exists status text not null default 'pendiente',
  add column if not exists payload jsonb not null default '{}'::jsonb;

create index if not exists registros_publicos_document_number_idx
  on public.registros_publicos(document_number);

create index if not exists registros_publicos_status_idx
  on public.registros_publicos(status);

create index if not exists registros_publicos_birth_date_idx
  on public.registros_publicos(birth_date);
