# Cloudflare: despliegue y cron de cumpleaños

## Despliegue manual por comandos

Este es el flujo recomendado actual para este proyecto. No depende del build automático de GitHub.

Primera vez en una máquina:

```bash
npm install
npm install --save-dev @opennextjs/cloudflare@1.19.11 wrangler@4.96.0 --registry=https://registry.npmmirror.com --strict-ssl=false
npx wrangler login
```

Cada vez que quieras publicar cambios:

```bash
npm run build:cloudflare
npm run deploy:cloudflare
```

El deploy usa `--keep-vars` para conservar variables creadas desde el panel de Cloudflare.

Si alguna vez las variables públicas se pierden, vuelve a desplegar pasando las variables:

```bash
npx wrangler deploy --keep-vars --var NEXT_PUBLIC_SUPABASE_URL:https://zzcrofqaxlidzzmbowpm.supabase.co --var NEXT_PUBLIC_SUPABASE_ANON_KEY:anon_key_de_supabase --var MESSAGING_DRY_RUN:true --var MESSAGING_MAX_RECIPIENTS:30
```

Los secretos se cargan aparte:

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name drjahir
npx wrangler secret put CRON_SECRET --name drjahir
```

URL publicada:

```txt
https://drjahir.msuarez59785.workers.dev
```

## Despliegue automático desde GitHub

Sí se puede conectar Cloudflare con GitHub para que cada `git push` a `main` despliegue la aplicación.

Flujo recomendado:

1. En Cloudflare abrir **Workers & Pages**.
2. Crear proyecto conectado a GitHub.
3. Seleccionar el repositorio `MarySuarezJ/DrJahir`.
4. Usar la rama de producción `main`.
5. Configurar las variables de entorno de Supabase, mensajería y cron.
6. Cada vez que se haga `git push origin main`, Cloudflare construye y publica de nuevo.

Para Next.js con rutas API y SSR, Cloudflare debe construir con OpenNext.

En **Build configuration** deja:

```txt
Build command:
npx @opennextjs/cloudflare@1.19.11 build

Deploy command:
npx @opennextjs/cloudflare@1.19.11 deploy
```

No uses esta combinación para producción:

```txt
npm run build
npx wrangler deploy
```

Esa combinación puede compilar Next.js pero fallar al publicar el Worker porque Wrangler intenta migrar el proyecto automáticamente en un entorno no interactivo.

El archivo `open-next.config.ts` queda declarado sin imports para que el build de Cloudflare pueda compilarlo aunque el adaptador se ejecute por `npx`.

Antes de producción conviene probar con:

```bash
npm run typecheck
npm run lint
npm run build
```

## Variables necesarias

En Cloudflare no uses variables `VITE_...`. Este proyecto es Next.js, por eso las variables deben llamarse `NEXT_PUBLIC_...`.

```env
NEXT_PUBLIC_SUPABASE_URL=https://zzcrofqaxlidzzmbowpm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
MESSAGING_DRY_RUN=true
MESSAGING_MAX_RECIPIENTS=25
```

Importante:

- `NEXT_PUBLIC_SUPABASE_URL` debe empezar por `https://` y terminar en `.supabase.co`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` es el JWT largo que empieza por `eyJ...` y tiene rol `anon`.
- `SUPABASE_SERVICE_ROLE_KEY` es el JWT largo que empieza por `eyJ...` y tiene rol `service_role`; debe guardarse como secreto.
- La key que empieza por `sb_publishable_...` no es la URL. No la uses en `NEXT_PUBLIC_SUPABASE_URL`.
- `CRON_SECRET` lo inventas tú: un texto largo privado, por ejemplo una frase aleatoria con números.

Mientras estás probando, deja:

```env
MESSAGING_DRY_RUN=true
```

Así los mensajes se registran como simulados y no se envían de verdad.

Correo:

```env
RESEND_API_KEY=
EMAIL_FROM=
```

SMS y WhatsApp:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_SMS_FROM=
TWILIO_WHATSAPP_FROM=
```

## Cron de cumpleaños

La aplicación expone:

```txt
/api/cron/birthdays
```

Ese endpoint:

- busca personas con cumpleaños hoy,
- toma la plantilla activa de `fechas_importantes` con tipo `birthday`,
- envía por WhatsApp, correo o SMS según la plantilla,
- registra trazabilidad en `envios_mensajes` y `destinatarios_mensaje`,
- evita duplicar el envío del mismo día.

Prueba:

```bash
curl -H "Authorization: Bearer TU_CRON_SECRET" https://tu-dominio.com/api/cron/birthdays
```

## Worker cron externo

Cloudflare Cron Triggers corren en UTC. Para ejecutar a las 8:00 a. m. Colombia, programa `0 13 * * *`.

Worker mínimo:

```js
export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(
      fetch(`${env.APP_URL}/api/cron/birthdays`, {
        headers: {
          Authorization: `Bearer ${env.CRON_SECRET}`
        }
      })
    );
  }
};
```

Variables del Worker:

```env
APP_URL=https://tu-dominio.com
CRON_SECRET=el_mismo_valor_configurado_en_la_app
```
