export const appRoles = ["admin_principal", "doctor", "secretaria", "abogado", "coordinador_territorial"] as const;

export type AppRole = (typeof appRoles)[number];

export type RoleCredential = {
  role: AppRole;
  username: string;
  password: string;
  displayName: string;
};

export const roleCredentials: RoleCredential[] = [
  { role: "admin_principal",         username: "admin",        password: "admin2024",  displayName: "Administración General" },
  { role: "doctor",                  username: "doctor",       password: "jahir2024",  displayName: "Dr. Jahir Álvarez" },
  { role: "secretaria",              username: "secretaria",   password: "sec2024",    displayName: "Yuli Paulina" },
  { role: "abogado",                 username: "abogado",      password: "legal2024",  displayName: "Carlos Ríos" },
  { role: "coordinador_territorial", username: "coordinador",  password: "terr2024",   displayName: "Pedro Muñoz" }
];

export type RoleMeta = {
  value: AppRole;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
};

export const roleMeta: RoleMeta[] = [
  {
    value: "admin_principal",
    label: "Administrador Principal",
    shortLabel: "Admin",
    description: "Acceso total al sistema, territorios, usuarios y automatizaciones.",
    accent: "gold"
  },
  {
    value: "doctor",
    label: "Doctor Jahir",
    shortLabel: "Doctor",
    description: "Vista ejecutiva para seguimiento estratégico, mapa, líderes y resultados.",
    accent: "navy"
  },
  {
    value: "secretaria",
    label: "Secretaria",
    shortLabel: "Secretaría",
    description: "Registro de personas, documentos y consulta operativa parcial.",
    accent: "emerald"
  },
  {
    value: "abogado",
    label: "Abogado",
    shortLabel: "Legal",
    description: "Lectura limitada a hojas de vida y datos autorizados.",
    accent: "navy"
  },
  {
    value: "coordinador_territorial",
    label: "Coordinador Territorial",
    shortLabel: "Territorial",
    description: "Solo ve sus líderes, barrios y comunas asignadas.",
    accent: "gold"
  }
];
