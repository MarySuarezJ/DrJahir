# Puesta en producción

Esta guía deja el orden recomendado para pasar el entorno operativo a producción con Supabase, GitHub y Cloudflare.

## 1. Variables

Crea `.env.local` en desarrollo y configura las mismas variables en Cloudflare:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
MESSAGING_DRY_RUN=true
MESSAGING_MAX_RECIPIENTS=25
RESEND_API_KEY=
EMAIL_FROM="Equipo Dr. Jahir <notificaciones@tudominio.com>"
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_SMS_FROM=
TWILIO_MESSAGING_SERVICE_SID=
TWILIO_WHATSAPP_FROM=
TWILIO_WHATSAPP_MESSAGING_SERVICE_SID=
```

La `SUPABASE_SERVICE_ROLE_KEY` solo se usa en rutas de servidor como `src/app/api/admin/users/route.ts`. No debe exponerse en el navegador.
Deja `MESSAGING_DRY_RUN=true` mientras pruebas; cambia a `false` solo cuando Resend/Twilio estén verificados.

## 2. Base de datos Supabase

1. Crea un proyecto en Supabase.
2. Instala o abre Supabase CLI.
3. Vincula el proyecto:

```bash
supabase login
supabase link --project-ref TU_PROJECT_REF
```

4. Aplica migraciones y datos iniciales:

```bash
supabase db push --include-seed
```

Si trabajas en local:

```bash
supabase start
supabase db reset
```

## 3. Primer administrador real

El primer usuario se crea manualmente porque todavía no existe un admin que pueda crear otros usuarios:

1. En Supabase Dashboard ve a `Authentication > Users`.
2. Crea el usuario inicial, por ejemplo `admin@drjahir.com`.
3. En SQL Editor ejecuta:

```sql
insert into public.perfiles (
  id,
  email,
  username,
  full_name,
  role,
  status,
  territory,
  can_manage_alerts
)
select
  id,
  email,
  'admin',
  'Administración General',
  'admin_principal',
  'active',
  'Todo el territorio',
  true
from auth.users
where email = 'admin@drjahir.com'
on conflict (id) do update
set email = excluded.email,
    username = excluded.username,
    full_name = excluded.full_name,
    role = excluded.role,
    status = excluded.status,
    territory = excluded.territory,
    can_manage_alerts = excluded.can_manage_alerts;
```

Luego los demás usuarios se pueden crear desde el módulo `Administración` o desde la ruta `POST /api/admin/users` cuando el login real de Supabase esté activo.

## 4. Información necesaria

Carga primero:

- Departamentos, municipios, comunas, barrios y puestos de votación.
- Personas, líderes y asignaciones territoriales.
- Documentos en buckets de Supabase Storage: `documents`, `photos`, `resumes`.
- Fechas importantes y alertas en `fechas_importantes`.
- Historial de mensajería en `envios_mensajes` y `destinatarios_mensaje`.
- Accesos territoriales por usuario en `accesos_territoriales_usuario`.

La carga territorial, de personas y de fechas importantes también se puede hacer desde el módulo `Administración` con la plantilla `/templates/carga-masiva-dr-jahir.xlsx`. La guía detallada está en `docs/07-carga-masiva-excel.md`.

Para archivos grandes usa Supabase Storage y guarda en la base solo `storage_bucket` y `storage_path`.

## 5. GitHub

Desde la carpeta del proyecto:

```bash
git init
git branch -M main
git add .
git commit -m "Preparar CRM Dr Jahir para administracion y produccion"
git remote add origin https://github.com/MarySuarezJ/DrJahir.git
git push -u origin main
```

Si el remoto ya tiene historial:

```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## 6. Cloudflare

Para Next.js con rutas de servidor, Cloudflare recomienda Workers con OpenNext.

1. Instala herramientas:

```bash
npm install @opennextjs/cloudflare
npm install -D wrangler
```

2. Agrega scripts cuando el adaptador esté instalado:

```json
{
  "scripts": {
    "cf:build": "opennextjs-cloudflare build",
    "cf:preview": "opennextjs-cloudflare preview",
    "cf:deploy": "opennextjs-cloudflare deploy"
  }
}
```

3. En Cloudflare configura las variables de entorno.
4. Ejecuta:

```bash
npm run cf:build
npm run cf:deploy
```

Referencias oficiales:

- Supabase CLI: https://supabase.com/docs/guides/local-development/cli/getting-started
- Supabase Auth Admin API: https://supabase.com/docs/reference/javascript/auth-admin-createuser
- Cloudflare Next.js: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
