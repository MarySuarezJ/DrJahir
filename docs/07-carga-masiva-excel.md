# Carga Masiva Desde Excel

## Objetivo

El administrador principal puede descargar una plantilla de Excel, llenarla y subirla desde el módulo **Administración**. El sistema valida el archivo y carga la información en Supabase sin pedir UUID ni IDs técnicos.

Plantilla: `/templates/carga-masiva-dr-jahir.xlsx`

## Hojas del archivo

### Territorio

Sirve para cargar o actualizar:

- departamentos
- municipios
- comunas, zonas o corregimientos
- barrios o veredas
- puestos de votación
- mesas

Campo obligatorio: `municipio`.

Columnas principales:

- `departamento`
- `codigo_departamento`
- `municipio`
- `codigo_municipio`
- `puntaje_municipio`
- `comuna_zona`
- `codigo_comuna`
- `barrio_vereda`
- `codigo_barrio_vereda`
- `puesto_votacion`
- `codigo_puesto`
- `mesa`
- `latitud`
- `longitud`

### Personas

Sirve para cargar o actualizar personas del CRM.

Campos obligatorios:

- `nombres`
- `cedula`

La cédula es la llave de actualización. Si vuelves a subir una persona con la misma cédula, el sistema actualiza el registro en vez de duplicarlo. Si falta `apellidos`, el sistema marca `Por completar`. Si falta `municipio`, el sistema carga `Por asignar` para que puedas filtrar y corregir después.

Columnas principales:

- `nombres`
- `apellidos`
- `cedula`
- `tipo_registro`
- `sector_lider`
- `telefono`
- `whatsapp`
- `correo`
- `fecha_nacimiento`
- `direccion`
- `departamento`
- `municipio`
- `comuna_zona`
- `barrio_vereda`
- `profesion`
- `empresa`
- `cargo`
- `estado_laboral`
- `puesto_votacion`
- `mesa`
- `lider_cedula`
- `etiqueta_apoyo`
- `puntaje_apoyo`
- `etiquetas`
- `visibilidad`
- `notas`

Valores aceptados:

- `tipo_registro`: `Lider` o `Persona`
- `sector_lider`: sector que lidera esa persona, por ejemplo `Bajo Tablazo`
- `lider_cedula`: cédula del líder responsable. Para una persona a cargo de Mariana Suárez, aquí va la cédula de Mariana.
- `estado_laboral`: `empleado`, `desempleado`, `independiente`, `estudiante`, `pensionado`
- `etiqueta_apoyo`: `Lider`, `Voluntario`, `Simpatizante`, `Votante`
- `visibilidad`: `public`, `operational`, `legal`, `restricted`

Ejemplo de jerarquía:

- Fila líder: `Mariana | Suarez | 1053978521 | Lider | Bajo Tablazo | ...`
- Fila persona a cargo: `Laura | Gomez | 1002458891 | Persona | | ... | lider_cedula = 1053978521`

### Fechas importantes

Las fechas importantes ya no se cargan por Excel. Se crean y editan desde **Administración > Alertas > Días importantes**, porque hacen parte de las automatizaciones y mensajes.

## Flujo de uso

1. Entrar como `Administrador Principal`.
2. Ir a **Administración**.
3. Descargar la plantilla de carga masiva.
4. Llenar una o varias hojas.
5. Subir el archivo `.xlsx`.
6. Revisar el resumen y las alertas de validación.
7. Confirmar **Cargar a Supabase**.

## Requisitos de producción

En Cloudflare deben existir estas variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

La clave `SUPABASE_SERVICE_ROLE_KEY` debe quedar como secreto privado, nunca expuesta en el navegador.

## Comportamiento de carga

- Municipios, comunas, barrios y mesas se cargan de forma idempotente.
- Las personas se actualizan por `cedula`.
- Las fechas importantes se administran desde el panel, no desde la plantilla.
- Los registros sin municipio quedan en `Por asignar`.
- Las vistas `operacion_*` muestran datos con códigos simples y sin UUID.
- Si hay errores de validación, el sistema no escribe en Supabase hasta corregirlos.
