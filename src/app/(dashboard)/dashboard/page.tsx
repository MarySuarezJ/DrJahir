"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BarChart3, GitBranch, MapPinned, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { useSession } from "@/components/providers/session-provider";
import { dashboardMetrics, recentActivity } from "@/lib/data/dashboard";
import type { AppRole } from "@/lib/types/roles";

const VoteByMunicipalityChart = dynamic(() => import("@/components/charts/vote-by-municipality-chart"), { ssr: false });
const TerritorialParticipationChart = dynamic(() => import("@/components/charts/territorial-participation-chart"), { ssr: false });
const WeeklyGrowthChart = dynamic(() => import("@/components/charts/weekly-growth-chart"), { ssr: false });
const LeaderRankingChart = dynamic(() => import("@/components/charts/leader-ranking-chart"), { ssr: false });
const TerritoryMap = dynamic(() => import("@/components/map/territory-map"), { ssr: false });

const dashboardLayoutStorageKey = "jahir-dashboard-layout";

type DashboardWidget = {
  id: string;
  title: string;
  role: AppRole | "todos";
  size: "pequeño" | "mediano" | "grande";
  visible: boolean;
};

const defaultDashboardWidgets: DashboardWidget[] = [
  { id: "metricas", title: "Métricas generales", role: "todos", size: "grande", visible: true },
  { id: "mapa", title: "Mapa territorial", role: "todos", size: "grande", visible: true },
  { id: "actividad", title: "Actividad reciente", role: "todos", size: "mediano", visible: true },
  { id: "lideres", title: "Ranking de líderes", role: "todos", size: "mediano", visible: true },
  { id: "votantes", title: "Votantes por municipio", role: "todos", size: "mediano", visible: true },
  { id: "crecimiento", title: "Crecimiento semanal", role: "todos", size: "mediano", visible: true },
  { id: "participacion", title: "Participación territorial", role: "todos", size: "grande", visible: true }
];

function parseDashboardLayout(value: string | null) {
  if (!value) return defaultDashboardWidgets;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as DashboardWidget[]) : defaultDashboardWidgets;
  } catch {
    return defaultDashboardWidgets;
  }
}

function widgetSpan(size: DashboardWidget["size"]) {
  if (size === "grande") return "xl:col-span-2";
  return "xl:col-span-1";
}

function DashboardCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <Card className="h-full border-brand-line bg-white/78">
      <CardHeader>
        <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">{eyebrow}</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-brand-ink">{title}</h3>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { role } = useSession();
  const [layout, setLayout] = useState(defaultDashboardWidgets);

  useEffect(() => {
    setLayout(parseDashboardLayout(window.localStorage.getItem(dashboardLayoutStorageKey)));
  }, []);

  const widgets = useMemo(() => {
    const components: Record<string, ReactNode> = {
      metricas: (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {dashboardMetrics.map((metric) => (
            <StatCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              delta={metric.delta}
              hint={metric.hint}
              tone={metric.tone}
              icon={metric.label.includes("líder") ? <GitBranch className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
            />
          ))}
        </div>
      ),
      mapa: (
        <DashboardCard eyebrow="Mapa central" title="Territorio y zonas activas">
          <TerritoryMap />
        </DashboardCard>
      ),
      actividad: (
        <DashboardCard eyebrow="Actividad reciente" title="Últimos movimientos">
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.title} className="rounded-2xl border border-brand-line bg-brand-cream/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-brand-ink">{activity.title}</p>
                  <span className="text-xs text-brand-ink/55">{activity.time}</span>
                </div>
                <p className="mt-2 text-sm text-brand-ink/70">{activity.detail}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      ),
      lideres: (
        <DashboardCard eyebrow="Ranking de líderes" title="Influencia operativa">
          <LeaderRankingChart />
        </DashboardCard>
      ),
      votantes: (
        <DashboardCard eyebrow="Votantes por municipio" title="Distribución territorial">
          <VoteByMunicipalityChart />
        </DashboardCard>
      ),
      crecimiento: (
        <DashboardCard eyebrow="Crecimiento semanal" title="Expansión de la red">
          <WeeklyGrowthChart />
        </DashboardCard>
      ),
      participacion: (
        <DashboardCard eyebrow="Participación territorial" title="Apoyo vs movilización">
          <TerritorialParticipationChart />
        </DashboardCard>
      )
    };

    return layout
      .filter((widget) => widget.visible && (widget.role === "todos" || widget.role === role))
      .filter((widget) => Boolean(components[widget.id]))
      .map((widget) => ({ ...widget, component: components[widget.id] }));
  }, [layout, role]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="gold">Visión ejecutiva</Badge>
          <h2 className="mt-3 font-display text-4xl font-semibold text-brand-ink">Dashboard inteligente del territorio</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-ink/72 sm:text-base">
            Lectura del comportamiento político, cobertura territorial y estado operativo de la campaña.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/people">
            <Button variant="ghost">
              <UsersRound className="h-4 w-4" />
              Equipo activo
            </Button>
          </Link>
          <Link href="/dashboard/map">
            <Button variant="gold">
              <MapPinned className="h-4 w-4" />
              Ver territorio
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {widgets.map((widget) => (
          <div key={widget.id} className={widgetSpan(widget.size)}>
            {widget.component}
          </div>
        ))}
      </div>
    </div>
  );
}
