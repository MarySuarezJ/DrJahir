import fs from "node:fs";
import path from "node:path";
import writeExcelFile from "write-excel-file/node";

const outputDir = path.join(process.cwd(), "public", "templates");
const outputFile = path.join(outputDir, "carga-masiva-dr-jahir.xlsx");

function headerCell(value) {
  return {
    value,
    fontWeight: "bold",
    backgroundColor: "#EAD4A2",
    textColor: "#273241"
  };
}

function toSheetData(rows) {
  return rows.map((row, index) => (index === 0 ? row.map(headerCell) : row));
}

function columns(widths) {
  return widths.map((width) => ({ width }));
}

fs.mkdirSync(outputDir, { recursive: true });

await writeExcelFile(
  [
    {
      sheet: "Instrucciones",
      stickyRowsCount: 1,
      columns: columns([72]),
      data: toSheetData([
        ["Plantilla de carga masiva - Dr. Jahir"],
        ["Llena las hojas Territorio, Personas y Fechas importantes. Puedes dejar hojas vacias si no las necesitas."],
        ["No cambies los nombres de las hojas ni los encabezados."],
        ["Campos obligatorios en Territorio: municipio."],
        ["Campos obligatorios en Personas: nombres, apellidos, cedula, municipio. Para cumpleanos usa fecha_nacimiento."],
        ["Campos obligatorios en Fechas importantes: titulo, mensaje, y fecha exacta o mes/dia."],
        ["Para audiencia_json usa JSON valido, por ejemplo: {\"profession\":[\"docente\"]}."],
        ["Al subir el archivo desde Administracion, el sistema actualiza registros existentes por cedula, municipio o titulo."]
      ])
    },
    {
      sheet: "Territorio",
      stickyRowsCount: 1,
      columns: columns([18, 20, 18, 18, 18, 20, 18, 24, 24, 28, 18, 10, 12, 12]),
      data: toSheetData([
        [
          "departamento",
          "codigo_departamento",
          "municipio",
          "codigo_municipio",
          "puntaje_municipio",
          "comuna_zona",
          "codigo_comuna",
          "barrio_vereda",
          "codigo_barrio_vereda",
          "puesto_votacion",
          "codigo_puesto",
          "mesa",
          "latitud",
          "longitud"
        ],
        ["Caldas", "17", "Manizales", "17001", 81, "Comuna 1", "MZ-01", "Chipre", "CH-001", "I.E. Chipre", "PV-001", "8", 5.0702, -75.5218],
        ["Caldas", "17", "Riosucio", "17614", 66, "Zona rural", "RS-R", "Vereda El Palmar", "RS-V001", "Escuela Rural El Palmar", "PV-101", "1", "", ""]
      ])
    },
    {
      sheet: "Personas",
      stickyRowsCount: 1,
      columns: columns([18, 18, 16, 16, 20, 16, 16, 28, 16, 24, 16, 18, 20, 24, 22, 22, 22, 18, 28, 10, 16, 18, 16, 28, 16, 34]),
      data: toSheetData([
        [
          "nombres",
          "apellidos",
          "cedula",
          "tipo_registro",
          "sector_lider",
          "telefono",
          "whatsapp",
          "correo",
          "fecha_nacimiento",
          "direccion",
          "departamento",
          "municipio",
          "comuna_zona",
          "barrio_vereda",
          "profesion",
          "empresa",
          "cargo",
          "estado_laboral",
          "puesto_votacion",
          "mesa",
          "lider_cedula",
          "etiqueta_apoyo",
          "puntaje_apoyo",
          "etiquetas",
          "visibilidad",
          "notas"
        ],
        [
          "Mariana",
          "Suarez",
          "1053978521",
          "Lider",
          "Bajo Tablazo",
          "3105550001",
          "3105550001",
          "mariana.suarez@drjahir.com",
          "1992-09-21",
          "Bajo Tablazo",
          "Caldas",
          "Manizales",
          "Zona rural",
          "Bajo Tablazo",
          "Lider comunitaria",
          "Comunidad Bajo Tablazo",
          "Lider del sector",
          "independiente",
          "Puesto Bajo Tablazo",
          "1",
          "",
          "Lider",
          96,
          "bajo tablazo, movilizacion",
          "operational",
          "Fila de ejemplo para crear una lider."
        ],
        [
          "Laura",
          "Gomez",
          "1002458891",
          "Persona",
          "",
          "3105551201",
          "3105551201",
          "laura.gomez@drjahir.com",
          "1990-04-12",
          "Cra. 24 #19-31",
          "Caldas",
          "Manizales",
          "Zona rural",
          "Bajo Tablazo",
          "Psicologa",
          "Clinica del Norte",
          "Coordinadora",
          "empleado",
          "I.E. Chipre",
          "8",
          "1053978521",
          "Simpatizante",
          84,
          "salud, mujeres, territorio",
          "operational",
          "Ejemplo: reemplazar por datos reales."
        ],
        [
          "Carlos Alberto",
          "Quintero",
          "1006688123",
          "Persona",
          "",
          "3105553366",
          "3105553366",
          "",
          "1987-12-03",
          "Vereda El Cable",
          "Caldas",
          "Riosucio",
          "Zona rural",
          "Vereda El Palmar",
          "Lider comunitario",
          "JAC El Cable",
          "Presidente",
          "empleado",
          "Escuela Rural El Palmar",
          "1",
          "1053978521",
          "Simpatizante",
          90,
          "comunidad, rural",
          "operational",
          ""
        ]
      ])
    },
    {
      sheet: "Fechas importantes",
      stickyRowsCount: 1,
      columns: columns([28, 18, 10, 10, 16, 14, 38, 56, 12]),
      data: toSheetData([
        ["titulo", "tipo_fecha", "mes", "dia", "fecha_exacta", "canal", "audiencia_json", "mensaje", "activo"],
        [
          "Dia del maestro",
          "profession_day",
          5,
          15,
          "",
          "email",
          "{\"profession\":[\"docente\",\"profesor\",\"maestro\"]}",
          "Gracias por educar y construir territorio. Feliz dia del maestro, {nombre}.",
          "si"
        ],
        [
          "Jornada especial Manizales",
          "campaign_day",
          "",
          "",
          "2026-08-10",
          "whatsapp",
          "{\"municipality\":[\"Manizales\"]}",
          "Hola {nombre}, te esperamos en la jornada especial de Manizales.",
          "si"
        ]
      ])
    }
  ],
  {
    fontFamily: "Calibri",
    fontSize: 11
  }
).toFile(outputFile);

console.log(outputFile);
