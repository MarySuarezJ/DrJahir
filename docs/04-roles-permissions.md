# Roles y Permisos

## Roles del sistema

### Administrador Principal

- Acceso total.
- Ver, crear, editar y eliminar en todos los módulos.
- Gestionar usuarios, permisos, territorios, campañas y auditoría.
- Crear accesos administrativos y configurar alertas de días importantes.

### Secretaria

- Registrar y editar personas.
- Administrar documentación.
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

| Módulo | Administrador | Secretaria | Abogado | Coordinador |
| --- | --- | --- | --- | --- |
| Login y perfil | Sí | Sí | Sí | Sí |
| Dashboard completo | Sí | Parcial | Parcial | Parcial territorial |
| Personas | Total | Crear/editar | Lectura autorizada | Lectura territorial |
| Líderes | Total | No | No | Lectura territorial |
| Territorios | Total | No | No | Solo asignados |
| Documentos | Total | Sí | Lectura autorizada | Parcial |
| Automatización | Total | No | No | No |
| Mensajería futura | Total | No | No | No |
| Administración | Total | No | No | No |
| Auditoría | Total | No | Solo lectura legal | No |

## Regla de visibilidad

- Los campos sensibles se entregan por nivel de permiso.
- El coordinador territorial nunca ve datos fuera de su zona asignada.
- La secretaria opera el CRM operativo, pero no la administración global.
- El abogado accede únicamente a la información necesaria para revisión jurídica.
