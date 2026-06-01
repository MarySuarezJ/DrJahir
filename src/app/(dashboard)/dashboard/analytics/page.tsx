"use client";

import dynamic from "next/dynamic";
import { TrendingUp, TrendingDown, Users, MapPin, BarChart3, GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { dashboardMetrics } from "@/lib/data/dashboard";

const VoteByMunicipalityChart      = dynamic(() => import("@/components/charts/vote-by-municipality-chart"),       { ssr: false });
const TerritorialParticipationChart = dynamic(() => import("@/components/charts/territorial-participation-chart"), { ssr: false });
const WeeklyGrowthChart             = dynamic(() => import("@/components/charts/weekly-growth-chart"),              { ssr: false });
const LeaderRankingChart            = dynamic(() => import("@/components/charts/leader-ranking-chart"),             { ssr: false });

const kpis = [
  { label: "Tasa de crecimiento semanal",  value: "+8.4%",   delta: "+1.2pp vs semana anterior", icon: <TrendingUp className="h-5 w-5" />,   tone: "emerald" as const },
  { label: "Conversión de leads",          value: "64%",     delta: "+3% este mes",              icon: <Users className="h-5 w-5" />,        tone: "gold"    as const },
  { label: "Cobertura territorial",        value: "78%",     delta: "27 de 27 municipios",       icon: <MapPin className="h-5 w-5" />,       tone: "navy"    as const },
  { label: "Índice de movilización",       value: "71%",     delta: "+5% vs mes anterior",       icon: <BarChart3 className="h-5 w-5" />,    tone: "gold"    as const },
  { label: "Líderes activos",             value: "184",     delta: "+12 este mes",              icon: <GitBranch className="h-5 w-5" />,    tone: "emerald" as const },
  { label: "Riesgo de fuga",              value: "8.2%",    delta: "-2.1pp vs mes anterior",    icon: <TrendingDown className="h-5 w-5" />, tone: "neutral" as const },
];

const projections = [
  { label: "Votantes proyectados al 15 de junio", value: "14.200", trend: "▲ +13.8%" },
  { label: "Líderes proyectados",                  value: "210",    trend: "▲ +14.1%" },
  { label: "Municipios con cobertura completa",    value: "22",     trend: "▲ +5 meses" },
  { label: "Score promedio de apoyo",              value: "73%",    trend: "▲ +2pp" },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="gold">Analítica ejecutiva</Badge>
        <h2 className="mt-3 font-display text-4xl font-semibold text-white">Lectura ejecutiva y proyecciones</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75 sm:text-base">
          Indicadores clave de desempeño, tendencias territoriales y proyecciones de crecimiento para Caldas.
        </p>
      </div>

      {/* KPIs específicos de analítica */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} delta={k.delta} hint="" icon={k.icon} tone={k.tone} />
        ))}
      </div>

      {/* Proyecciones */}
      <Card className="border-white/20 bg-white/[0.06]">
        <CardHeader>
          <Badge variant="emerald">Proyecciones</Badge>
          <h3 className="mt-2 font-display text-2xl font-semibold text-white">Estimaciones a 30 días</h3>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          {projections.map((p) => (
            <div key={p.label} className="rounded-2xl border border-white/15 bg-white/[0.06] p-4">
              <p className="text-xs uppercase tracking-widest text-white/55">{p.label}</p>
              <p className="mt-2 text-3xl font-bold text-white">{p.value}</p>
              <p className="mt-1 text-sm font-medium text-brand-emeraldSoft">{p.trend}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Gráficas */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/20 bg-white/[0.06]">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.28em] text-white/65">Votantes por municipio</p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-white">Distribución territorial</h3>
          </CardHeader>
          <CardContent><VoteByMunicipalityChart /></CardContent>
        </Card>

        <Card className="border-white/20 bg-white/[0.06]">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.28em] text-white/65">Crecimiento semanal</p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-white">Expansión de la red</h3>
          </CardHeader>
          <CardContent><WeeklyGrowthChart /></CardContent>
        </Card>
      </div>

      <Card className="border-white/20 bg-white/[0.06]">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.28em] text-white/65">Participación territorial</p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-white">Apoyo vs movilización</h3>
        </CardHeader>
        <CardContent><TerritorialParticipationChart /></CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/20 bg-white/[0.06]">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.28em] text-white/65">Ranking de líderes</p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-white">Influencia operativa</h3>
          </CardHeader>
          <CardContent><LeaderRankingChart /></CardContent>
        </Card>

        {/* Métricas generales */}
        <Card className="border-white/20 bg-white/[0.06]">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.28em] text-white/65">Indicadores generales</p>
            <h3 className="mt-1 font-display text-2xl font-semibold text-white">Resumen de la campaña</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardMetrics.map((m) => (
              <div key={m.label} className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/55">{m.label}</p>
                  <p className="mt-0.5 text-xl font-bold text-white">{m.value}</p>
                </div>
                <Badge variant={m.tone === "gold" ? "gold" : m.tone === "emerald" ? "emerald" : "navy"}>
                  {m.delta}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
