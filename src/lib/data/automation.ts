import type { AutomationTemplate } from "@/lib/types/domain";

export const automationTemplates: AutomationTemplate[] = [
  {
    name: "Feliz cumpleaños",
    channel: "WhatsApp",
    trigger: "Birthday",
    audience: "Personas con fecha de nacimiento hoy",
    nextRun: "08:00 mañana",
    status: "Scheduled"
  },
  {
    name: "Día del psicólogo",
    channel: "Email",
    trigger: "Profession day",
    audience: "Psicólogos y aliados de salud mental",
    nextRun: "07:30 3 de diciembre",
    status: "Active"
  },
  {
    name: "Campaña territorial barrio",
    channel: "SMS",
    trigger: "Territorial push",
    audience: "Barrios priorizados en Manizales",
    nextRun: "18:00 viernes",
    status: "Draft"
  }
];

export const automationQueue = [
  {
    step: "Segmentar",
    detail: "Filtrar por profesión, barrio y score de apoyo"
  },
  {
    step: "Programar",
    detail: "Asignar fecha, hora y canal de salida"
  },
  {
    step: "Aprobar",
    detail: "Validación del mensaje y del responsable"
  },
  {
    step: "Ejecutar",
    detail: "Lanzamiento con trazabilidad y auditoría"
  }
];
