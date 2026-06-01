"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { BarChart3, GitBranch, MapPinned, UsersRound } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dashboardMetrics, recentActivity } from "@/lib/data/dashboard";

const VoteByMunicipalityChart = dynamic(() => import("@/components/charts/vote-by-municipality-chart"), { ssr: false });
const TerritorialParticipationChart = dynamic(() => import("@/components/charts/territorial-participation-chart"), { ssr: false });
const WeeklyGrowthChart = dynamic(() => import("@/components/charts/weekly-growth-chart"), { ssr: false });
const LeaderRankingChart = dynamic(() => import("@/components/charts/leader-ranking-chart"), { ssr: false });
const TerritoryMap = dynamic(() => import("@/components/map/territory-map"), { ssr: false });

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="gold">Visión ejecutiva</Badge>
          <h2 className="mt-3 font-display text-4xl font-semibold text-white">Dashboard inteligente del territorio</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75 sm:text-base">
            Una lectura premium del comportamiento político, la cobertura territorial y el estado operativo de la campaña.
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

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Card className="border-white/20 bg-white/[0.04]">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/65">Mapa central</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-white">Caldas y sus zonas activas</h3>
              </div>
              <Badge variant="neutral">Leaflet + GeoJSON</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <TerritoryMap />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/20 bg-white/[0.04]">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.28em] text-white/65">Actividad reciente</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-white">Últimos movimientos</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.title} className="rounded-3xl border border-white/20 bg-white/[0.10] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{activity.title}</p>
                    <span className="text-xs text-white/65">{activity.time}</span>
                  </div>
                  <p className="mt-2 text-sm text-white/75">{activity.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/20 bg-white/[0.04]">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.28em] text-white/65">Ranking de líderes</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-white">Influencia operativa</h3>
            </CardHeader>
            <CardContent>
              <LeaderRankingChart />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/20 bg-white/[0.04]">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.28em] text-white/65">Votantes por municipio</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-white">Distribución territorial</h3>
          </CardHeader>
          <CardContent>
            <VoteByMunicipalityChart />
          </CardContent>
        </Card>

        <Card className="border-white/20 bg-white/[0.04]">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.28em] text-white/65">Crecimiento semanal</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-white">Expansión de la red</h3>
          </CardHeader>
          <CardContent>
            <WeeklyGrowthChart />
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/20 bg-white/[0.04]">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.28em] text-white/65">Participación territorial</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-white">Apoyo vs movilización</h3>
        </CardHeader>
        <CardContent>
          <TerritorialParticipationChart />
        </CardContent>
      </Card>
    </div>
  );
}
