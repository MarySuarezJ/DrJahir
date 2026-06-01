import type { NavigationItem } from "@/lib/types/domain";
import {
  BarChart3,
  FileText,
  GitBranch,
  LayoutDashboard,
  Map,
  Megaphone,
  MessageSquareMore,
  Settings2,
  Shield,
  UsersRound
} from "lucide-react";

export const navigationItems: Array<NavigationItem & { icon: typeof LayoutDashboard }> = [
  {
    label: "Dashboard",
    href: "/dashboard",
    description: "Métricas, mapa y actividad general.",
    roles: ["admin_principal", "secretaria", "abogado", "coordinador_territorial"],
    icon: LayoutDashboard
  },
  {
    label: "Personas",
    href: "/dashboard/people",
    description: "CRM, búsqueda y detalle de registros.",
    roles: ["admin_principal", "secretaria", "abogado", "coordinador_territorial"],
    icon: UsersRound
  },
  {
    label: "Territorio",
    href: "/dashboard/territory",
    description: "Jerarquía política y cobertura territorial.",
    roles: ["admin_principal", "secretaria", "coordinador_territorial"],
    icon: GitBranch
  },
  {
    label: "Mapa",
    href: "/dashboard/map",
    description: "GeoJSON, métricas y color dinámico.",
    roles: ["admin_principal", "secretaria", "coordinador_territorial"],
    icon: Map
  },
  {
    label: "Automatización",
    href: "/dashboard/automation",
    description: "Cumpleaños, profesión y campañas.",
    roles: ["admin_principal"],
    icon: Megaphone
  },
  {
    label: "Documentos",
    href: "/dashboard/documents",
    description: "Hojas de vida, PDFs y fotos.",
    roles: ["admin_principal", "secretaria", "abogado"],
    icon: FileText
  },
  {
    label: "Administración",
    href: "/dashboard/admin",
    description: "Usuarios, roles, permisos y alertas.",
    roles: ["admin_principal"],
    icon: Settings2
  },
  {
    label: "Formularios",
    href: "/dashboard/forms",
    description: "Captación y seguimiento público.",
    roles: ["admin_principal", "secretaria"],
    icon: Shield
  },
  {
    label: "Mensajería",
    href: "/dashboard/messages",
    description: "WhatsApp, correo y SMS futuro.",
    roles: ["admin_principal"],
    icon: MessageSquareMore
  },
  {
    label: "Analítica",
    href: "/dashboard/analytics",
    description: "Lectura ejecutiva y proyecciones.",
    roles: ["admin_principal", "secretaria", "coordinador_territorial"],
    icon: BarChart3
  }
];

export type NavigationIcon = (typeof navigationItems)[number]["icon"];
