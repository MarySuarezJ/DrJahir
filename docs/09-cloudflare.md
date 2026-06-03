# Cloudflare: despliegue y cron de cumpleaños

## Despliegue automático desde GitHub

Sí se puede conectar Cloudflare con GitHub para que cada `git push` a `main` despliegue la aplicación.

Flujo recomendado:

1. En Cloudflare abrir **Workers & Pages**.
2. Crear proyecto conectado a GitHub.
3. Seleccionar el repositorio `MarySuarezJ/DrJahir`.
4. Usar la rama de producción `main`.
5. Configurar las variables de entorno de Supabase, mensajería y cron.
6. Cada vez que se haga `git push origin main`, Cloudflare construye y publica de nuevo.

Para Next.js con rutas API y SSR, Cloudflare recomienda Workers con el adaptador OpenNext. En un proyecto existente, Wrangler puede detectar Next.js y generar configuración:

```bash
npx wrangler deploy
```

Antes de producción conviene probar con:

```bash
npm run typecheck
npm run lint
npm run build
```

## Variables necesarias

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
MESSAGING_DRY_RUN=true
MESSAGING_MAX_RECIPIENTS=25
```

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
