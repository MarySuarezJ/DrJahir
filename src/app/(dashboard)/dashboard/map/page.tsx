"use client";

import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TerritoryLegend } from "@/components/map/territory-legend";
import { territoryMetrics } from "@/lib/data/territory";

const TerritoryMap = dynamic(() => import("@/components/map/territory-map"), { ssr: false });

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="gold">Mapa territorial</Badge>
        <h2 className="mt-3 font-display text-4xl font-semibold text-white">GeoJSON interactivo de Caldas</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75 sm:text-base">
          Hover, colores dinámicos y lecturas rápidas por municipio para sostener decisiones territoriales y campañas.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/20 bg-white/[0.04]">
          <CardHeader>
            <TerritoryLegend />
          </CardHeader>
          <CardContent>
            <TerritoryMap />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-white/20 bg-white/[0.04]">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.28em] text-white/65">Indicadores por zona</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-white">Resumen ejecutivo</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {territoryMetrics.map((territory) => (
                <div key={territory.name} className="rounded-3xl border border-white/20 bg-white/[0.10] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{territory.name}</p>
                    <Badge variant={territory.supportPercent >= 80 ? "emerald" : territory.supportPercent >= 72 ? "gold" : "navy"}>
                      {territory.supportPercent}% apoyo
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-white/80">
                    <div className="rounded-2xl border border-white/20 bg-white/[0.10] px-3 py-2">Líderes: <span className="text-white">{territory.leaders}</span></div>
                    <div className="rounded-2xl border border-white/20 bg-white/[0.10] px-3 py-2">Votantes: <span className="text-white">{territory.voters.toLocaleString("es-CO")}</span></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-white/20 bg-white/[0.04]">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.28em] text-white/65">Uso futuro</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-white">Municipios, comunas y barrios</h3>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-white/78">
              Esta vista quedará lista para cargar capas oficiales, consultar municipios y desplegar barrios con soporte de Supabase Storage y GeoJSON real.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
