"use client";

import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TerritoryLegend } from "@/components/map/territory-legend";

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

      <Card className="border-white/20 bg-white/[0.04]">
        <CardHeader>
          <TerritoryLegend />
        </CardHeader>
        <CardContent>
          <TerritoryMap />
        </CardContent>
      </Card>
    </div>
  );
}
