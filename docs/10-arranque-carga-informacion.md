# Arranque para subir información

## 1. Corregir variables en Cloudflare

En **Workers & Pages > drjahir > Settings > Variables and Secrets**, deja estas variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zzcrofqaxlidzzmbowpm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=service_role_key_de_supabase
CRON_SECRET=texto_largo_privado
MESSAGING_DRY_RUN=true
MESSAGING_MAX_RECIPIENTS=25
```

La URL de Supabase no es `sb_publishable_...`.

## 2. Reintentar despliegue

En Cloudflare:

1. Abre **Workers & Pages**.
2. Entra a `drjahir`.
3. Entra a **Settings**.
4. Busca **Build configuration**.
5. Cambia los comandos:

```txt
Build command:
npm install --no-save --no-package-lock @opennextjs/cloudflare@1.19.11 && npx @opennextjs/cloudflare@1.19.11 build

Deploy command:
npx @opennextjs/cloudflare@1.19.11 deploy
```

6. Abre el último despliegue fallido.
7. Presiona **Retry deployment**.

Si vuelve a fallar, abre el log y copia las primeras líneas rojas.

## 3. Entrar al sistema

Cuando Cloudflare dé una URL activa, entra a la aplicación.

Si todavía estás revisando local:

```txt
http://localhost:3000
```

## 4. Cargar información por Excel

1. Entra a **Administración**.
2. Busca **Excel para territorio y personas**.
3. Descarga la plantilla.
4. Llena primero la hoja **Territorio**.
5. Luego llena la hoja **Personas**.
6. Sube el archivo desde el mismo panel.

Las fechas importantes no van en Excel. Se crean desde **Administración > Alertas > Días importantes**.

## 5. Validar que cargó

Después de subir:

- **Personas** debe mostrar el directorio.
- **Territorio** debe mostrar líderes y personas a cargo.
- **Mapa** debe actualizar municipios con datos cargados.
- **Documentos** debe permitir ver hojas de vida asociadas a personas.

## 6. Mensajes de cumpleaños

Para probar sin enviar mensajes reales:

```env
MESSAGING_DRY_RUN=true
```

Luego:

1. Crea una fecha importante de cumpleaños.
2. Escribe el mensaje con `{nombre}`.
3. Prueba el endpoint `/api/cron/birthdays`.
4. Revisa `envios_mensajes`.

Solo cambia a `MESSAGING_DRY_RUN=false` cuando Resend o Twilio ya estén configurados.
