import type { AppRole } from "@/lib/types/roles";

export type AdminUserStatus = "active" | "paused";

export type AdminUser = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: AppRole;
  status: AdminUserStatus;
  territory: string;
  canManageAlerts: boolean;
  lastAccess: string;
  createdAt: string;
};

export type ImportantAlertStatus = "active" | "scheduled" | "draft" | "paused";

export type ImportantAlert = {
  id: string;
  title: string;
  date: string;
  channel: "WhatsApp" | "Correo" | "SMS";
  audience: string;
  status: ImportantAlertStatus;
  message: string;
  owner: string;
};

export const adminUsersSeed: AdminUser[] = [
  {
    id: "usr-admin",
    fullName: "Administración General",
    username: "admin",
    email: "admin@drjahir.local",
    role: "admin_principal",
    status: "active",
    territory: "Todo Caldas",
    canManageAlerts: true,
    lastAccess: "Hoy",
    createdAt: "Inicial"
  },
  {
    id: "usr-doctor",
    fullName: "Dr. Jahir Álvarez",
    username: "doctor",
    email: "jahir@drjahir.local",
    role: "admin_principal",
    status: "active",
    territory: "Dirección general",
    canManageAlerts: true,
    lastAccess: "Hoy",
    createdAt: "Inicial"
  },
  {
    id: "usr-sec",
    fullName: "Laura Gómez",
    username: "secretaria",
    email: "secretaria@drjahir.local",
    role: "secretaria",
    status: "active",
    territory: "Operación central",
    canManageAlerts: false,
    lastAccess: "Hace 2 h",
    createdAt: "Inicial"
  },
  {
    id: "usr-legal",
    fullName: "Carlos Ríos",
    username: "abogado",
    email: "legal@drjahir.local",
    role: "abogado",
    status: "active",
    territory: "Legal",
    canManageAlerts: false,
    lastAccess: "Ayer",
    createdAt: "Inicial"
  },
  {
    id: "usr-territory",
    fullName: "Pedro Muñoz",
    username: "coordinador",
    email: "territorio@drjahir.local",
    role: "coordinador_territorial",
    status: "active",
    territory: "Manizales norte",
    canManageAlerts: false,
    lastAccess: "Hace 1 día",
    createdAt: "Inicial"
  }
];

export const importantAlertsSeed: ImportantAlert[] = [
  {
    id: "alert-birthday",
    title: "Cumpleaños de personas registradas",
    date: "Todos los días",
    channel: "WhatsApp",
    audience: "Personas con fecha de nacimiento del día",
    status: "active",
    message: "Hola {nombre}, desde el equipo del Dr. Jahir te deseamos un feliz cumpleaños.",
    owner: "Administración General"
  },
  {
    id: "alert-teacher",
    title: "Día del maestro",
    date: "2026-05-15",
    channel: "Correo",
    audience: "Docentes y aliados del sector educación",
    status: "scheduled",
    message: "Gracias por educar y construir territorio. Feliz día del maestro, {nombre}.",
    owner: "Dr. Jahir Álvarez"
  },
  {
    id: "alert-health",
    title: "Día del profesional de la salud",
    date: "2026-12-03",
    channel: "WhatsApp",
    audience: "Profesionales de salud y cuidadores",
    status: "draft",
    message: "Reconocemos tu vocación y servicio. Gracias por cuidar a nuestra gente.",
    owner: "Administración General"
  }
];
