import type { AppRole } from "@/lib/types/roles";

export type EmploymentStatus = "empleado" | "desempleado" | "independiente" | "estudiante" | "pensionado";
export type VisibilityScope = "public" | "operational" | "legal" | "restricted";

export type DashboardMetric = {
  label: string;
  value: string;
  delta: string;
  tone: "gold" | "emerald" | "navy" | "neutral";
  hint: string;
};

export type PersonRecord = {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  birthDate?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  barrio: string;
  comuna: string;
  municipality: string;
  department: string;
  profession: string;
  company: string;
  jobTitle: string;
  employmentStatus: EmploymentStatus;
  votingPlace: string;
  votingTable: string;
  leaderName: string;
  leaderDocumentNumber?: string;
  leaderSector?: string;
  notes: string;
  photoPath: string;
  resumePath: string;
  supportLabel: string;
  supportScore: number;
  tags: string[];
  visibilityScope: VisibilityScope;
};

export type LeaderNode = {
  id: string;
  name: string;
  title: string;
  municipality: string;
  influenceScore: number;
  peopleMobilized: number;
  children: LeaderNode[];
};

export type TerritoryMetric = {
  name: string;
  supportPercent: number;
  voters: number;
  leaders: number;
  employed: number;
  unemployed: number;
  color: string;
  center: [number, number];
};

export type AutomationTemplate = {
  name: string;
  channel: "WhatsApp" | "Email" | "SMS";
  trigger: string;
  audience: string;
  nextRun: string;
  status: "Scheduled" | "Active" | "Draft" | "Paused";
};

export type NavigationItem = {
  label: string;
  href: string;
  description: string;
  roles: AppRole[];
};
