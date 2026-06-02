# Modelo de Base de Datos

## Estrategia

Se propone un diseño PostgreSQL normalizado y compacto con entidades geográficas, personas, líderes, documentos, fechas importantes, formularios y usuarios.

## Entidades principales

### Geografía

- departamentos
- municipios
- comunas
- barrios
- puestos_votacion
- mesas_votacion

### Núcleo CRM

- personas
- lideres
- asignaciones_lideres
- etiquetas_persona
- documentos_persona

### Alertas y operación

- fechas_importantes

### Captación pública

- registros_publicos

### Seguridad y trazabilidad

- perfiles
- accesos_territoriales_usuario

## Relaciones clave

- Un departamento tiene muchos municipios.
- Un municipio tiene muchas comunas.
- Una comuna tiene muchos barrios.
- Una persona puede tener un líder asociado.
- Un líder pertenece a una persona y puede tener un líder padre.
- Una persona puede tener múltiples documentos.
- Un usuario del sistema tiene un rol y puede tener acceso territorial asignado.

## Entidades sugeridas

### perfiles

Perfil de aplicación vinculado a `auth.users`.

Campos: `id`, `full_name`, `role`, `status`, `avatar_url`, `created_at`, `updated_at`.
Campos operativos adicionales: `email`, `username`, `territory`, `can_manage_alerts`, `dashboard_preferences`.

### personas

Entidad central del CRM.

Campos: `id`, `document_number`, `first_name`, `last_name`, `phone`, `whatsapp`, `email`, `address`, `profession`, `company`, `job_title`, `employment_status`, `voting_place`, `voting_table`, `leader_id`, `photo_path`, `resume_path`, `notes`, `visibility_scope`, `created_at`, `updated_at`.
La relación `leader_id` permite saber qué líder mueve o acompaña a cada persona.

### lideres

Núcleo jerárquico político.

Campos: `id`, `person_id`, `parent_leader_id`, `leader_level`, `territorial_scope`, `influence_score`, `active`.
El título del líder puede guardar el sector visible, por ejemplo `Líder Bajo Tablazo`.

### documentos_persona

Gestión documental con Supabase Storage.

Campos: `id`, `person_id`, `document_type`, `storage_bucket`, `storage_path`, `mime_type`, `size_bytes`, `visibility_scope`, `created_at`.

### fechas_importantes

Fechas y alertas administrables para cumpleaños, días profesionales, días cívicos o campañas.

Campos: `id`, `title`, `date_type`, `date_month`, `date_day`, `exact_date`, `channel`, `audience_scope`, `message_template`, `active`, `created_by`, `approved_by`.

## Mermaid ER

```mermaid
erDiagram
    DEPARTAMENTOS ||--o{ MUNICIPIOS : contains
    MUNICIPIOS ||--o{ COMUNAS : contains
    COMUNAS ||--o{ BARRIOS : contains
    MUNICIPIOS ||--o{ PUESTOS_VOTACION : hosts
    PUESTOS_VOTACION ||--o{ MESAS_VOTACION : groups
    LIDERES ||--o{ PERSONAS : guides
    PERSONAS ||--o{ DOCUMENTOS_PERSONA : owns
    PERFILES ||--o{ ACCESOS_TERRITORIALES_USUARIO : receives
    PERSONAS ||--o| LIDERES : can_be_a_leader
    LIDERES ||--o{ LIDERES : parent_of
```

## Seguridad y permisos

- RLS activado en todas las tablas sensibles.
- Escritura restringida por rol.
- Lectura parcial para secretaría y abogados.
- Lectura territorial limitada para coordinadores.
- Los cambios sensibles pueden auditarse en una etapa posterior si se requiere.
