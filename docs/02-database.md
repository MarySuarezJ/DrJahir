# Modelo de Base de Datos

## Estrategia

Se propone un diseño PostgreSQL normalizado y compacto con entidades geográficas, personas, líderes, documentos, fechas importantes, formularios y usuarios.

Hay dos capas:

- **Tablas técnicas**: guardan relaciones internas y seguridad de Supabase. Pueden tener columnas UUID como `id`, `department_id` o `person_id`.
- **Vistas operativas**: son las que debe usar el equipo para revisar y cargar operación diaria. Usan códigos simples, cédulas y nombres en español, sin exponer los UUID técnicos.

En Supabase Table Editor, para consulta operativa usa:

- `operacion_personas`
- `operacion_personas_pendientes`
- `operacion_lideres`
- `operacion_municipios`
- `operacion_comunas_barrios`
- `operacion_puestos_mesas`
- `operacion_usuarios`
- `operacion_envios_mensajes`
- `operacion_destinatarios_mensaje`

Los códigos visibles son, por ejemplo, `PE_001` para personas, `LI_001` para líderes, `US_001` para usuarios, `EN_001` para envíos y códigos DIVIPOLA para municipios.

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
- envios_mensajes
- destinatarios_mensaje

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
Código visible: `codigo`.

### personas

Entidad central del CRM.

Campos: `id`, `document_number`, `first_name`, `last_name`, `phone`, `whatsapp`, `email`, `fecha_nacimiento`, `address`, `profession`, `company`, `job_title`, `employment_status`, `voting_place`, `voting_table`, `leader_id`, `photo_path`, `resume_path`, `notes`, `visibility_scope`, `created_at`, `updated_at`.
La relación `leader_id` permite saber qué líder mueve o acompaña a cada persona.
Código visible: `codigo`. Para cargar o actualizar personas se usa `document_number`/`cedula`, no el UUID.

### lideres

Núcleo jerárquico político.

Campos: `id`, `person_id`, `parent_leader_id`, `leader_level`, `territorial_scope`, `influence_score`, `active`.
El título del líder puede guardar el sector visible, por ejemplo `Líder Bajo Tablazo`.
Código visible: `codigo`.

### documentos_persona

Gestión documental con Supabase Storage.

Campos: `id`, `person_id`, `document_type`, `storage_bucket`, `storage_path`, `mime_type`, `size_bytes`, `visibility_scope`, `created_at`.

### fechas_importantes

Fechas y alertas administrables para cumpleaños, días profesionales, días cívicos o campañas.

Campos: `id`, `title`, `date_type`, `date_month`, `date_day`, `exact_date`, `channel`, `audience_scope`, `message_template`, `active`, `created_by`, `approved_by`.

### envios_mensajes

Historial de envíos por WhatsApp, correo y SMS.

Campos: `id`, `canal`, `audiencia`, `asunto`, `cuerpo`, `estado`, `proveedor`, `modo_simulacion`, `total_destinatarios`, `total_enviados`, `total_fallidos`, `enviado_por`, `error`, `created_at`, `updated_at`.
Código visible: `codigo`.

### destinatarios_mensaje

Resultado individual de cada destinatario dentro de un envío.

Campos: `id`, `envio_id`, `persona_id`, `nombre`, `email`, `telefono`, `whatsapp`, `estado`, `proveedor`, `proveedor_message_id`, `error`, `enviado_at`, `created_at`.
Código visible: `codigo`.

## Carga sin IDs técnicos

La carga desde Administración acepta Excel y JSON. El sistema resuelve las relaciones así:

- Personas por `cedula`.
- Líder responsable por `lider_cedula`.
- Municipio por nombre/código DIVIPOLA.
- Puesto de votación por nombre dentro del municipio.
- Mesa por número dentro del puesto.

Si una persona llega sin municipio, se guarda como `Por asignar` y aparece en `operacion_personas_pendientes`.

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
    PERSONAS ||--o{ DESTINATARIOS_MENSAJE : receives
    ENVIOS_MENSAJES ||--o{ DESTINATARIOS_MENSAJE : contains
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
