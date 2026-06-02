# Arquitectura General

## Objetivo

Construir un CRM político inteligente, local en esta primera etapa, con capacidad de evolucionar a producción real sin reescribir la base del sistema.

## Principios de diseño

- Modularidad por dominio.
- Separación clara entre presentación, lógica de negocio y acceso a datos.
- Supabase como backend administrado y escalable.
- UI premium basada en componentes reutilizables.
- Preparación para auditoría, trazabilidad y permisos por rol.

## Capas del sistema

### 1. Presentación

Next.js con App Router, componentes visuales, layout responsivo y páginas por módulo.

### 2. Capa de experiencia

Componentes reutilizables, estado de sesión, navegación protegida por rol y componentes animados con Framer Motion.

### 3. Dominio

Entidades políticas y territoriales: personas, líderes, territorios, campañas, documentos, automatizaciones y formularios.

### 4. Persistencia

PostgreSQL en Supabase con almacenamiento de archivos en buckets y políticas RLS por rol.

## Estructura técnica propuesta

```text
src/
  app/
    (auth)/login
    (dashboard)/dashboard
    (dashboard)/people
    (dashboard)/territory
    (dashboard)/map
    (dashboard)/automation
    (dashboard)/documents
    (dashboard)/messages
    (dashboard)/admin
    registro
  components/
    auth/
    brand/
    charts/
    forms/
    layout/
    map/
    motion/
    people/
    admin/
    ui/
  lib/
    data/
    supabase/
    types/
    permissions.ts
    utils.ts
supabase/
  migrations/
docs/
```

## Flujo de ejecución

1. El usuario entra al login premium.
2. Accede con credenciales Supabase o con acceso temporal local mientras se revisa la interfaz.
3. El sistema carga una vista personalizada según permisos.
4. El dashboard consolida métricas, gráficos y mapa territorial.
5. Los módulos operativos gestionan personas, líderes, documentos, automatizaciones y formularios.
6. Todo queda preparado para auditoría e integración futura con mensajería masiva.

## Preparación para escalamiento

- Autenticación real con Supabase Auth.
- RLS por tablas críticas.
- Separación entre datos públicos y sensibles.
- Storage para hojas de vida, fotos y documentos.
- Evolución posterior a colas, webhooks y mensajería externa.
