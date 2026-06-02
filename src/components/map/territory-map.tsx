"use client";

import { useEffect, useRef, useState } from "react";
import { GeoJSON, MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import type { GeoJSON as LeafletGeoJSON, PathOptions } from "leaflet";

type MunicipalityStats = {
  supportPercent: number;
  voters: number;
  leaders: number;
  employed: number;
  unemployed: number;
};

const statsMap: Record<string, MunicipalityStats> = {
  MANIZALES:   { supportPercent: 81, voters: 3420,  leaders: 64, employed: 1880, unemployed: 620 },
  VILLAMARIA:  { supportPercent: 76, voters: 1980,  leaders: 38, employed: 1090, unemployed: 410 },
  CHINCHINA:   { supportPercent: 69, voters: 1640,  leaders: 29, employed:  920, unemployed: 360 },
  NEIRA:       { supportPercent: 74, voters:  940,  leaders: 21, employed:  550, unemployed: 180 },
  PALESTINA:   { supportPercent: 72, voters: 1280,  leaders: 26, employed:  670, unemployed: 220 },
  RIOSUCIO:    { supportPercent: 66, voters: 1260,  leaders: 24, employed:  660, unemployed: 260 },
  SALAMINA:    { supportPercent: 71, voters:  860,  leaders: 17, employed:  430, unemployed: 150 },
  "LA DORADA": { supportPercent: 63, voters: 1450,  leaders: 24, employed:  780, unemployed: 310 },
  AGUADAS:     { supportPercent: 68, voters:  790,  leaders: 15, employed:  390, unemployed: 120 },
  SUPIA:       { supportPercent: 70, voters: 1040,  leaders: 19, employed:  560, unemployed: 210 },
  ANSERMA:     { supportPercent: 67, voters:  920,  leaders: 18, employed:  480, unemployed: 170 },
  MANZANARES:  { supportPercent: 73, voters:  810,  leaders: 16, employed:  420, unemployed: 140 },
  PENSILVANIA: { supportPercent: 65, voters:  870,  leaders: 14, employed:  410, unemployed: 180 },
  FILADELFIA:  { supportPercent: 69, voters:  560,  leaders: 12, employed:  310, unemployed: 110 },
};

function getStats(name: string): MunicipalityStats {
  const key = name.toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return statsMap[key] ?? { supportPercent: 65, voters: 500, leaders: 10, employed: 280, unemployed: 100 };
}

function getFill(pct: number) {
  if (pct >= 80) return "#22c97d";
  if (pct >= 75) return "#4ade80";
  if (pct >= 70) return "#e8c55a";
  if (pct >= 65) return "#fb923c";
  return "#60a5fa";
}

function getBorder(pct: number) {
  if (pct >= 80) return "#15803d";
  if (pct >= 75) return "#16a34a";
  if (pct >= 70) return "#b45309";
  if (pct >= 65) return "#c2410c";
  return "#1d4ed8";
}

type GeoJSONData = {
  type: string;
  features: Array<{
    type: string;
    properties: Record<string, string | number>;
    geometry: { type: string; coordinates: unknown };
  }>;
};

export default function TerritoryMap() {
  const geoJsonRef = useRef<LeafletGeoJSON | null>(null);
  const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<{ name: string; stats: MunicipalityStats } | null>(null);

  useEffect(() => {
    fetch("/api/caldas-geojson")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: GeoJSONData) => {
        if (data.features?.length) {
          setGeoData(data);
        } else {
          setError("Sin datos de municipios.");
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="overflow-hidden rounded-[20px] border border-brand-line bg-white shadow-panel">
      <style>{`
        .leaflet-tooltip {
          background: rgba(255,250,240,0.96) !important;
          border: 1px solid rgba(151,119,63,0.22) !important;
          border-radius: 14px !important;
          color: #273241 !important;
          padding: 10px 14px !important;
          font-size: 13px !important;
          line-height: 1.7 !important;
          box-shadow: 0 8px 32px rgba(61,49,29,0.14) !important;
          backdrop-filter: blur(14px) !important;
          pointer-events: none !important;
        }
        .leaflet-tooltip strong { color: #e8c55a; font-size: 14px; display:block; margin-bottom:2px; }
        .support-high { color: #22c97d; font-weight: 700; }
        .support-mid  { color: #e8c55a; font-weight: 700; }
        .support-low  { color: #60a5fa; font-weight: 700; }
        .leaflet-control-zoom { border: none !important; }
        .leaflet-control-zoom a { background: rgba(255,250,240,0.94) !important; color: #273241 !important; border: 1px solid rgba(151,119,63,0.22) !important; border-radius: 8px !important; margin-bottom: 4px !important; }
        .leaflet-control-zoom a:hover { background: rgba(234,212,162,0.55) !important; }
      `}</style>

      <div className="relative">
        <div className="absolute bottom-3 left-3 z-[500] flex flex-col gap-1.5 rounded-xl border border-brand-line bg-white/90 px-3 py-2.5 text-xs text-brand-ink backdrop-blur-md">
          <p className="mb-0.5 text-[10px] uppercase tracking-widest text-brand-muted">Nivel de apoyo</p>
          {[
            { color: "#22c97d", label: "≥ 80% - Alto" },
            { color: "#4ade80", label: "75-79% - Bueno" },
            { color: "#e8c55a", label: "70-74% - Medio" },
            { color: "#fb923c", label: "65-69% - Bajo" },
            { color: "#60a5fa", label: "< 65% - Crítico" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: item.color }} />
              <span className="text-brand-muted">{item.label}</span>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex h-[500px] items-center justify-center bg-brand-cream">
            <div className="space-y-2 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-goldSoft border-t-transparent" />
              <p className="text-sm text-brand-muted">Cargando mapa de Caldas...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex h-[500px] items-center justify-center bg-brand-cream">
            <p className="text-sm text-rose-400">Error cargando mapa: {error}</p>
          </div>
        )}

        {!loading && !error && geoData && (
          <MapContainer
            center={[5.22, -75.35]}
            zoom={8}
            className="h-[520px] w-full"
            zoomControl={false}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <ZoomControl position="topright" />
            <GeoJSON
              key={`${geoData.features.length}-${selected?.name ?? "sin-seleccion"}`}
              ref={geoJsonRef}
              data={geoData as never}
              style={(feature) => {
                const rawName: string = (feature?.properties?.MPIO_CNMBR as string) ?? "";
                const stats = getStats(rawName);
                const isSelected = rawName === selected?.name;
                return {
                  color: isSelected ? "#273241" : getBorder(stats.supportPercent),
                  weight: isSelected ? 3 : 1.5,
                  fillColor: getFill(stats.supportPercent),
                  fillOpacity: isSelected ? 0.82 : 0.60,
                } satisfies PathOptions;
              }}
              onEachFeature={(feature, layer) => {
                const rawName: string = (feature.properties?.MPIO_CNMBR as string) ?? "-";
                const stats = getStats(rawName);
                const pct = stats.supportPercent;
                const cls = pct >= 75 ? "support-high" : pct >= 68 ? "support-mid" : "support-low";

                layer.bindTooltip(
                  `<div style="min-width:180px">
                  <strong>${rawName}</strong>
                  Votantes: <b>${stats.voters.toLocaleString("es-CO")}</b><br/>
                  Líderes: <b>${stats.leaders}</b><br/>
                  Apoyo: <span class="${cls}">${pct}%</span><br/>
                  <span style="color:#7b8493">Clic para ver detalle</span>
                </div>`,
                  { sticky: true, direction: "top", opacity: 1 }
                );

                layer.on({
                  click: () => setSelected({ name: rawName, stats }),
                  mouseover: (e) => {
                    const t = e.target as { setStyle?: (o: PathOptions) => void };
                    t.setStyle?.({ weight: 3, fillOpacity: 0.85 });
                  },
                  mouseout: () => {
                    geoJsonRef.current?.resetStyle(layer);
                  },
                });
              }}
            />
          </MapContainer>
        )}
      </div>

      <div className="border-t border-brand-line bg-brand-cream/70 p-4 sm:p-5">
        {selected ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">Municipio seleccionado</p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-brand-ink">{selected.name}</h3>
              </div>
              <span className="w-fit rounded-full border border-brand-line bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                {selected.stats.supportPercent}% apoyo
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Votantes", value: selected.stats.voters.toLocaleString("es-CO") },
                { label: "Líderes", value: selected.stats.leaders.toLocaleString("es-CO") },
                { label: "Empleados", value: selected.stats.employed.toLocaleString("es-CO") },
                { label: "Desempleados", value: selected.stats.unemployed.toLocaleString("es-CO") },
              ].map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-brand-line bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-brand-muted">{metric.label}</p>
                  <p className="mt-1 text-xl font-semibold text-brand-ink">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-brand-line bg-white px-4 py-5 text-sm text-brand-muted">
            Selecciona un municipio en el mapa para ver sus indicadores aquí.
          </div>
        )}
      </div>
    </div>
  );
}
