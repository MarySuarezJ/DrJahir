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
