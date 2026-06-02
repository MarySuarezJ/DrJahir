export const importTemplatePath = "/templates/carga-masiva-dr-jahir.xlsx";
export const pendingMunicipalityName = "Por asignar";

export const importSheetNames = {
  territory: "Territorio",
  people: "Personas",
  importantDates: "Fechas importantes"
} as const;

export type ImportRow = Record<string, unknown>;

export type ImportIssue = {
  sheet: string;
  rowNumber: number;
  message: string;
};

export type ParsedTerritoryRow = {
  rowNumber: number;
  department: string;
  departmentCode: string;
  municipality: string;
  municipalityCode: string;
  municipalitySupportScore: number | null;
  commune: string;
  communeCode: string;
  neighborhood: string;
  neighborhoodCode: string;
  votingCenter: string;
  votingCenterCode: string;
  votingTable: string;
  latitude: number | null;
  longitude: number | null;
};

export type ParsedPersonRow = {
  rowNumber: number;
  firstName: string;
  lastName: string;
  documentNumber: string;
  phone: string;
  whatsapp: string;
  email: string;
  birthDate: string;
  address: string;
  department: string;
  municipality: string;
  commune: string;
  neighborhood: string;
  profession: string;
  company: string;
  jobTitle: string;
  employmentStatus: "empleado" | "desempleado" | "independiente" | "estudiante" | "pensionado";
  votingCenter: string;
  votingTable: string;
  leaderDocumentNumber: string;
  leaderSector: string;
  supportLabel: string;
  supportScore: number;
  tags: string[];
  visibilityScope: "public" | "operational" | "legal" | "restricted";
  notes: string;
};

export type ParsedImportantDateRow = {
  rowNumber: number;
  title: string;
  dateType: "birthday" | "profession_day" | "civic_day" | "campaign_day" | "custom";
  dateMonth: number | null;
  dateDay: number | null;
  exactDate: string;
  channel: "whatsapp" | "email" | "sms";
  audienceScope: Record<string, unknown>;
  messageTemplate: string;
  active: boolean;
};

export type ParsedImport = {
  territoryRows: ParsedTerritoryRow[];
  peopleRows: ParsedPersonRow[];
  importantDateRows: ParsedImportantDateRow[];
  issues: ImportIssue[];
  totalRows: number;
};

export type ImportPayload = {
  fileName: string;
  territoryRows: ImportRow[];
  peopleRows: ImportRow[];
  importantDateRows: ImportRow[];
};

const rowNumberKey = "__rowNumber";

const aliases = {
  department: ["departamento", "department"],
  departmentCode: ["codigo_departamento", "cod_departamento", "dpto_codigo", "code_departamento"],
  municipality: ["municipio", "municipality"],
  municipalityCode: ["codigo_municipio", "cod_municipio", "mpio_codigo", "code_municipio"],
  municipalitySupportScore: ["puntaje_municipio", "support_score_municipio", "apoyo_municipio"],
  commune: ["comuna_zona", "comuna", "zona", "corregimiento"],
  communeCode: ["codigo_comuna", "codigo_zona", "cod_comuna"],
  neighborhood: ["barrio_vereda", "barrio", "vereda", "neighborhood"],
  neighborhoodCode: ["codigo_barrio_vereda", "codigo_barrio", "codigo_vereda", "cod_barrio"],
  votingCenter: ["puesto_votacion", "lugar_votacion", "voting_center", "puesto"],
  votingCenterCode: ["codigo_puesto", "codigo_puesto_votacion", "cod_puesto"],
  votingTable: ["mesa", "mesa_votacion", "table_number"],
  latitude: ["latitud", "latitude", "lat"],
  longitude: ["longitud", "longitude", "lng", "lon"],
  firstName: ["nombres", "nombre", "first_name", "firstName"],
  lastName: ["apellidos", "apellido", "last_name", "lastName"],
  documentNumber: ["cedula", "documento", "numero_documento", "document_number", "cc"],
  phone: ["telefono", "phone", "celular"],
  whatsapp: ["whatsapp", "wsp"],
  email: ["correo", "email", "correo_electronico"],
  birthDate: ["fecha_nacimiento", "birth_date", "nacimiento", "cumpleanos", "cumpleaños"],
  address: ["direccion", "address"],
  profession: ["profesion", "profesión", "profession"],
  company: ["empresa", "company"],
  jobTitle: ["cargo", "job_title", "puesto_trabajo"],
  employmentStatus: ["estado_laboral", "employment_status"],
  leaderDocumentNumber: ["lider_cedula", "cedula_lider", "lider_documento"],
  leaderSector: ["sector_lider", "territorio_lider", "zona_lider", "lider_sector"],
  recordType: ["tipo_registro", "tipo", "record_type"],
  isLeader: ["es_lider", "lider", "is_leader"],
  supportLabel: ["etiqueta_apoyo", "support_label", "tipo_apoyo"],
  supportScore: ["puntaje_apoyo", "support_score"],
  tags: ["etiquetas", "tags"],
  visibilityScope: ["visibilidad", "visibility_scope"],
  notes: ["notas", "observaciones", "notes"],
  title: ["titulo", "título", "title"],
  dateType: ["tipo_fecha", "date_type"],
  dateMonth: ["mes", "date_month"],
  dateDay: ["dia", "día", "date_day"],
  exactDate: ["fecha_exacta", "exact_date", "fecha"],
  channel: ["canal", "channel"],
  audienceScope: ["audiencia_json", "audience_scope", "audiencia"],
  messageTemplate: ["mensaje", "message_template", "plantilla_mensaje"],
  active: ["activo", "active"]
} as const;

export function normalizeImportKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizedRow(row: ImportRow) {
  const map = new Map<string, unknown>();

  Object.entries(row).forEach(([key, value]) => {
    map.set(normalizeImportKey(key), value);
  });

  return map;
}

function readCell(row: ImportRow, field: keyof typeof aliases) {
  const map = normalizedRow(row);
  const keys = aliases[field].map(normalizeImportKey);

  for (const key of keys) {
    if (map.has(key)) {
      return map.get(key);
    }
  }

  return "";
}

function rowNumber(row: ImportRow, index: number) {
  const raw = row[rowNumberKey];
  const parsed = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : index + 2;
}

function text(value: unknown) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function numberOrNull(value: unknown) {
  const clean = text(value).replace(",", ".");
  if (!clean) return null;
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function booleanValue(value: unknown, fallback = true) {
  const clean = normalizeImportKey(text(value));
  if (!clean) return fallback;
  return ["si", "s", "true", "1", "activo", "activa", "yes", "y"].includes(clean);
}

function isBlankRow(row: ImportRow) {
  return Object.entries(row)
    .filter(([key]) => key !== rowNumberKey)
    .every(([, value]) => text(value) === "");
}

function normalizeEmploymentStatus(value: unknown): ParsedPersonRow["employmentStatus"] {
  const clean = normalizeImportKey(text(value));

  if (clean.includes("desemple")) return "desempleado";
  if (clean.includes("independ")) return "independiente";
  if (clean.includes("estudiante")) return "estudiante";
  if (clean.includes("pension")) return "pensionado";

  return "empleado";
}

function normalizeSupportLabel(row: ImportRow) {
  const explicit = text(readCell(row, "supportLabel"));
  const recordType = normalizeImportKey(text(readCell(row, "recordType")));
  const isLeader = normalizeImportKey(text(readCell(row, "isLeader")));

  if (explicit) return explicit;
  if (recordType.includes("lider") || ["si", "s", "true", "1", "yes"].includes(isLeader)) return "Líder";
  if (recordType.includes("volunt")) return "Voluntario";
  if (recordType.includes("vot")) return "Votante";

  return "Simpatizante";
}

function normalizeVisibility(value: unknown): ParsedPersonRow["visibilityScope"] {
  const clean = normalizeImportKey(text(value));

  if (clean.includes("public")) return "public";
  if (clean.includes("legal")) return "legal";
  if (clean.includes("restring")) return "restricted";
  if (clean.includes("restricted")) return "restricted";

  return "operational";
}

function normalizeDateType(value: unknown): ParsedImportantDateRow["dateType"] {
  const clean = normalizeImportKey(text(value));

  if (clean.includes("cumple") || clean === "birthday") return "birthday";
  if (clean.includes("profesion") || clean === "profession_day") return "profession_day";
  if (clean.includes("civic") || clean.includes("civico")) return "civic_day";
  if (clean.includes("campaign") || clean.includes("campana")) return "campaign_day";

  return "custom";
}

function normalizeChannel(value: unknown): ParsedImportantDateRow["channel"] {
  const clean = normalizeImportKey(text(value));

  if (clean.includes("mail") || clean.includes("correo")) return "email";
  if (clean.includes("sms")) return "sms";

  return "whatsapp";
}

function parseTags(value: unknown) {
  return text(value)
    .split(/[;,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseAudienceScope(value: unknown) {
  const clean = text(value);
  if (!clean) return {};

  try {
    const parsed = JSON.parse(clean) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function parseExactDate(value: unknown) {
  const clean = text(value);
  if (!clean) return "";

  const asDate = new Date(clean);
  if (!Number.isNaN(asDate.valueOf())) return asDate.toISOString().slice(0, 10);

  return clean;
}

export function parseImportPayload(payload: ImportPayload): ParsedImport {
  const issues: ImportIssue[] = [];

  const territoryRows = payload.territoryRows.flatMap((row, index) => {
    if (isBlankRow(row)) return [];

    const currentRowNumber = rowNumber(row, index);
    const municipality = text(readCell(row, "municipality"));

    if (!municipality) {
      issues.push({
        sheet: importSheetNames.territory,
        rowNumber: currentRowNumber,
        message: "El municipio es obligatorio para cargar territorio."
      });
      return [];
    }

    return [
      {
        rowNumber: currentRowNumber,
        department: text(readCell(row, "department")) || "Caldas",
        departmentCode: text(readCell(row, "departmentCode")) || "17",
        municipality,
        municipalityCode: text(readCell(row, "municipalityCode")),
        municipalitySupportScore: numberOrNull(readCell(row, "municipalitySupportScore")),
        commune: text(readCell(row, "commune")),
        communeCode: text(readCell(row, "communeCode")),
        neighborhood: text(readCell(row, "neighborhood")),
        neighborhoodCode: text(readCell(row, "neighborhoodCode")),
        votingCenter: text(readCell(row, "votingCenter")),
        votingCenterCode: text(readCell(row, "votingCenterCode")),
        votingTable: text(readCell(row, "votingTable")),
        latitude: numberOrNull(readCell(row, "latitude")),
        longitude: numberOrNull(readCell(row, "longitude"))
      }
    ];
  });

  const peopleRows = payload.peopleRows.flatMap((row, index) => {
    if (isBlankRow(row)) return [];

    const currentRowNumber = rowNumber(row, index);
    const firstName = text(readCell(row, "firstName"));
    const lastName = text(readCell(row, "lastName"));
    const documentNumber = text(readCell(row, "documentNumber"));
    const municipality = text(readCell(row, "municipality")) || pendingMunicipalityName;

    if (!firstName || !documentNumber) {
      issues.push({
        sheet: importSheetNames.people,
        rowNumber: currentRowNumber,
        message: "Nombres y cédula son obligatorios."
      });
      return [];
    }

    const supportScore = numberOrNull(readCell(row, "supportScore"));
    const supportLabel = normalizeSupportLabel(row);

    return [
      {
        rowNumber: currentRowNumber,
        firstName,
        lastName: lastName || "Por completar",
        documentNumber,
        phone: text(readCell(row, "phone")),
        whatsapp: text(readCell(row, "whatsapp")),
        email: text(readCell(row, "email")).toLowerCase(),
        birthDate: parseExactDate(readCell(row, "birthDate")),
        address: text(readCell(row, "address")),
        department: text(readCell(row, "department")) || "Caldas",
        municipality,
        commune: text(readCell(row, "commune")),
        neighborhood: text(readCell(row, "neighborhood")),
        profession: text(readCell(row, "profession")),
        company: text(readCell(row, "company")),
        jobTitle: text(readCell(row, "jobTitle")),
        employmentStatus: normalizeEmploymentStatus(readCell(row, "employmentStatus")),
        votingCenter: text(readCell(row, "votingCenter")),
        votingTable: text(readCell(row, "votingTable")),
        leaderDocumentNumber: text(readCell(row, "leaderDocumentNumber")),
        leaderSector: text(readCell(row, "leaderSector")),
        supportLabel,
        supportScore: clamp(supportScore ?? 0, 0, 100),
        tags: parseTags(readCell(row, "tags")),
        visibilityScope: normalizeVisibility(readCell(row, "visibilityScope")),
        notes: text(readCell(row, "notes"))
      }
    ];
  });

  const importantDateRows = payload.importantDateRows.flatMap((row, index) => {
    if (isBlankRow(row)) return [];

    const currentRowNumber = rowNumber(row, index);
    const title = text(readCell(row, "title"));
    const messageTemplate = text(readCell(row, "messageTemplate"));
    const exactDate = parseExactDate(readCell(row, "exactDate"));
    const dateMonth = numberOrNull(readCell(row, "dateMonth"));
    const dateDay = numberOrNull(readCell(row, "dateDay"));

    if (!title || !messageTemplate || (!exactDate && (!dateMonth || !dateDay))) {
      issues.push({
        sheet: importSheetNames.importantDates,
        rowNumber: currentRowNumber,
        message: "Título, mensaje y fecha exacta o mes/día son obligatorios."
      });
      return [];
    }

    return [
      {
        rowNumber: currentRowNumber,
        title,
        dateType: normalizeDateType(readCell(row, "dateType")),
        dateMonth: dateMonth ? clamp(Math.trunc(dateMonth), 1, 12) : null,
        dateDay: dateDay ? clamp(Math.trunc(dateDay), 1, 31) : null,
        exactDate,
        channel: normalizeChannel(readCell(row, "channel")),
        audienceScope: parseAudienceScope(readCell(row, "audienceScope")),
        messageTemplate,
        active: booleanValue(readCell(row, "active"), true)
      }
    ];
  });

  return {
    territoryRows,
    peopleRows,
    importantDateRows,
    issues,
    totalRows: territoryRows.length + peopleRows.length + importantDateRows.length
  };
}
