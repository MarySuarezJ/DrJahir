# Roles y Permisos

## Roles del sistema

### Administrador Principal

- Acceso total.
- Ver, crear, editar y eliminar en todos los módulos.
- Gestionar usuarios, permisos, territorios, campañas y auditoría.
- Crear accesos administrativos y configurar alertas de días importantes.

### Doctor Jahir

- Vista ejecutiva de dashboard, mapa, territorio, personas y analítica.
- Consulta líderes, personas a cargo y resultados territoriales.
- No administra usuarios ni permisos.

### Secretaria

- Registrar y editar personas.
- Administrar documentación.
- Crear alertas, mensajes operativos y fechas importantes autorizadas.
- Consultar información parcial del CRM.

### Abogado

- Acceso solo a hojas de vida y datos autorizados.
- Lectura limitada a campos legales o validados.
- Sin acceso a automatización ni control territorial.

### Coordinador Territorial

- Ver únicamente líderes, barrios y comunas asignadas.
- Consultar métricas de su territorio.
- Sin acceso total a datos sensibles globales.

## Matriz de permisos resumida

| Módulo | Administrador | Doctor Jahir | Secretaria | Abogado | Coordinador |
| --- | --- | --- | --- | --- | --- |
| Login y perfil | Sí | Sí | Sí | Sí | Sí |
| Dashboard completo | Sí | Ejecutivo | Parcial | Parcial | Parcial territorial |
| Personas | Total | Lectura ejecutiva | Crear/editar | Lectura autorizada | Lectura territorial |
| Líderes | Total | Lectura ejecutiva | Lectura operativa | No | Lectura territorial |
| Territorios | Total | Lectura ejecutiva | Lectura operativa | No | Solo asignados |
| Documentos | Total | Lectura | Sí | Lectura autorizada | Parcial |
| Automatización | Total | No | Crear/editar alertas | No | No |
| Mensajería | Total | No | Preparar mensajes | No | No |
| Administración | Total | No | No | No | No |
| Auditoría | Total | No | No | Solo lectura legal | No |

## Regla de visibilidad

- Los campos sensibles se entregan por nivel de permiso.
- El coordinador territorial nunca ve datos fuera de su zona asignada.
- La secretaria opera el CRM operativo, pero no la administración global.
- El Doctor Jahir tiene vista ejecutiva sin crear usuarios ni cambiar permisos.
- El abogado accede únicamente a la información necesaria para revisión jurídica.
