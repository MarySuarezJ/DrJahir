import type { DashboardMetric } from "@/lib/types/domain";

export const dashboardMetrics: DashboardMetric[] = [
  {
    label: "Total líderes",
    value: "184",
    delta: "+12%",
    tone: "gold",
    hint: "Red activa y escalable"
  },
  {
    label: "Total votantes",
    value: "12.480",
    delta: "+8.4%",
    tone: "emerald",
    hint: "Base territorial consolidada"
  },
  {
    label: "Municipios",
    value: "27",
    delta: "+2",
    tone: "navy",
    hint: "Cobertura en expansión"
  },
  {
    label: "Comunas",
    value: "96",
    delta: "+6",
    tone: "gold",
    hint: "Segmentación barrial"
  },
  {
    label: "Empleados",
    value: "7.320",
    delta: "+9.1%",
    tone: "emerald",
    hint: "Campo económico activo"
  },
  {
    label: "Desempleados",
    value: "3.410",
    delta: "-2.2%",
    tone: "navy",
    hint: "Segmento priorizable"
  }
];

export const voteByMunicipalityData = [
  { name: "Manizales", value: 4280 },
  { name: "Villamaría", value: 2210 },
  { name: "Chinchiná", value: 1860 },
  { name: "La Dorada", value: 1540 },
  { name: "Riosucio", value: 1480 },
  { name: "Neira", value: 1120 },
  { name: "Palestina", value: 1040 },
  { name: "Supía", value: 880 }
];

export const territorialParticipationData = [
  { name: "Líderes", apoyo: 82, movilizacion: 75 },
  { name: "Votantes", apoyo: 68, movilizacion: 62 },
  { name: "Voluntarios", apoyo: 74, movilizacion: 70 },
  { name: "Barrios", apoyo: 77, movilizacion: 66 },
  { name: "Comunas", apoyo: 71, movilizacion: 64 }
];

export const weeklyGrowthData = [
  { name: "Lun", personas: 8, líderes: 2, mensajes: 22 },
  { name: "Mar", personas: 11, líderes: 1, mensajes: 31 },
  { name: "Mié", personas: 15, líderes: 3, mensajes: 41 },
  { name: "Jue", personas: 18, líderes: 2, mensajes: 48 },
  { name: "Vie", personas: 22, líderes: 4, mensajes: 59 },
  { name: "Sáb", personas: 27, líderes: 5, mensajes: 68 },
  { name: "Dom", personas: 19, líderes: 2, mensajes: 34 }
];

export const leaderRankingData = [
  { name: "Equipo Norte Manizales", score: 98 },
  { name: "Centro Villamaría", score: 94 },
  { name: "Sur Chinchiná", score: 91 },
  { name: "Magdalena Medio", score: 87 },
  { name: "Riosucio Rural", score: 84 }
];

export const recentActivity = [
  {
    title: "Nuevo líder secundario registrado",
    detail: "Villamaría · Centro Villamaría",
    time: "Hace 8 min"
  },
  {
    title: "Hoja de vida adjuntada",
    detail: "Luis Fernando López · ruta legal",
    time: "Hace 20 min"
  },
  {
    title: "Nodo territorial actualizado",
    detail: "Riosucio · 2 veredas activas",
    time: "Hace 1 h"
  },
  {
    title: "Simpatizante captado",
    detail: "La Dorada · Barrio La Concordia",
    time: "Hace 3 h"
  }
];
