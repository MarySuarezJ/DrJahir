# Mensajería: correo, WhatsApp y SMS

El módulo de Mensajería usa `/api/messages` para enviar y registrar trazabilidad en Supabase.

## Estado actual

- La pantalla `/dashboard/messages` carga historial desde `envios_mensajes`.
- El botón `Enviar ahora` crea un envío, resuelve destinatarios desde `personas`, envía por proveedor y guarda cada resultado en `destinatarios_mensaje`.
- La pantalla `/dashboard/automation` usa el mismo endpoint para ejecutar plantillas.
- Si `MESSAGING_DRY_RUN=true`, no se contacta ningún proveedor externo: se registra como `simulado`.

## Proveedores configurados

### Correo

Proveedor: Resend.

Variables necesarias:

```env
RESEND_API_KEY=
EMAIL_FROM="Equipo Dr. Jahir <notificaciones@tudominio.com>"
```

### SMS

Proveedor: Twilio Programmable Messaging.

Variables necesarias:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_SMS_FROM=
```

También se puede usar:

```env
TWILIO_MESSAGING_SERVICE_SID=
```

### WhatsApp

Proveedor: Twilio WhatsApp.

Variables necesarias:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
```

También se puede usar:

```env
TWILIO_WHATSAPP_MESSAGING_SERVICE_SID=
```

## Seguridad antes de producción

Para probar sin enviar mensajes reales:

```env
MESSAGING_DRY_RUN=true
MESSAGING_MAX_RECIPIENTS=25
```

Para enviar de verdad:

```env
MESSAGING_DRY_RUN=false
MESSAGING_MAX_RECIPIENTS=25
```

Sube el límite gradualmente cuando ya estén aprobados los remitentes y plantillas.

## Audiencias disponibles

El endpoint resuelve estas audiencias desde `personas`:

- `Todos los registrados`
- `Cumpleaños de hoy`
- `Líderes Manizales`
- `Líderes Caldas`
- `Voluntarios Caldas`
- `Simpatizantes Manizales`
- `Coordinadores territoriales`

Para cumpleaños se requiere `personas.fecha_nacimiento`. La plantilla Excel ya incluye `fecha_nacimiento`.

## Cumpleaños automático diario

El endpoint `/api/cron/birthdays` procesa todos los días la audiencia `Cumpleaños de hoy`.

Funcionamiento:

- Lee personas desde `personas.fecha_nacimiento`.
- Busca una fecha importante activa con `date_type = 'birthday'` en `fechas_importantes`.
- Usa el `channel` y `message_template` de esa fecha importante.
- Si no existe plantilla activa, usa este mensaje por defecto: `Hola {nombre}, desde el equipo del Dr. Jahir te deseamos un feliz cumpleaños.`
- Registra el envío en `envios_mensajes` y cada destinatario en `destinatarios_mensaje`.
- Evita duplicados usando la audiencia del día, por ejemplo `Cumpleaños de hoy 2026-06-03`.

Variables necesarias:

```env
CRON_SECRET=pon_un_valor_largo_y_privado
MESSAGING_DRY_RUN=true
MESSAGING_MAX_RECIPIENTS=25
```

Prueba manual:

```bash
curl -H "Authorization: Bearer TU_CRON_SECRET" https://tu-dominio.com/api/cron/birthdays
```

Para producción:

1. Crear en Administración una fecha importante para cumpleaños.
2. Dejarla activa y escoger canal: WhatsApp, Correo o SMS.
3. Escribir el mensaje usando variables como `{nombre}`, `{municipio}` o `{profesion}`.
4. Probar con `MESSAGING_DRY_RUN=true`.
5. Revisar `envios_mensajes` y `destinatarios_mensaje`.
6. Configurar Resend/Twilio.
7. Cambiar `MESSAGING_DRY_RUN=false`.
8. Programar Cloudflare para llamar `/api/cron/birthdays` todos los días.

## Variables de mensaje

Se reemplazan automáticamente:

- `{nombre}`
- `{nombre_completo}`
- `{apellido}`
- `{municipio}`
- `{profesion}`
- `{telefono}`

## Flujo de prueba recomendado

1. Ejecutar la migración `0005_messaging_delivery.sql`.
2. Configurar Supabase y dejar `MESSAGING_DRY_RUN=true`.
3. Cargar una o dos personas con correo, WhatsApp y teléfono.
4. Enviar un mensaje desde `/dashboard/messages`.
5. Revisar `envios_mensajes` y `destinatarios_mensaje`.
6. Configurar Resend/Twilio.
7. Cambiar `MESSAGING_DRY_RUN=false`.
8. Probar primero con `MESSAGING_MAX_RECIPIENTS=1` o `2`.

## Nota importante sobre WhatsApp

WhatsApp exige remitente autorizado y, para conversaciones iniciadas por la organización, normalmente plantillas aprobadas por el proveedor. Los mensajes libres pueden funcionar solo bajo condiciones permitidas por la ventana de conversación del proveedor.
