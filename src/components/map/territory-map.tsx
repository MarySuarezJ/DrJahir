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

type MapStatsResponse = {
  stats?: Array<MunicipalityStats & { municipality: string }>;
  error?: string;
};

function normalizeName(name: string) {
  return name.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function getStats(name: string, statsMap: Record<string, MunicipalityStats>): MunicipalityStats {
  const key = normalizeName(name);
  return statsMap[key] ?? { supportPercent: 0, voters: 0, leaders: 0, employed: 0, unemployed: 0 };
}

function getFill(pct: number) {
  if (pct <= 0) return "#9DBEBB";
  if (pct >= 80) return "#22c97d";
  if (pct >= 75) return "#4ade80";
  if (pct >= 70) return "#e8c55a";
  if (pct >= 65) return "#fb923c";
  return "#60a5fa";
}

function getBorder(pct: number) {
  if (pct <= 0) return "#468189";
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
  const [statsByMunicipality, setStatsByMunicipality] = useState<Record<string, MunicipalityStats>>({});
  const [selectedName, setSelectedName] = useState<string | null>(null);

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

  useEffect(() => {
    fetch("/api/map-stats")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: MapStatsResponse) => {
        const nextStats: Record<string, MunicipalityStats> = {};
        (data.stats ?? []).forEach((item) => {
          nextStats[normalizeName(item.municipality)] = {
            supportPercent: item.supportPercent,
            voters: item.voters,
            leaders: item.leaders,
            employed: item.employed,
            unemployed: item.unemployed
          };
        });
        setStatsByMunicipality(nextStats);
      })
      .catch(() => {
        setStatsByMunicipality({});
      });
  }, []);

  const selectedStats = selectedName ? getStats(selectedName, statsByMunicipality) : null;

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
              key={`${geoData.features.length}-${selectedName ?? "sin-seleccion"}-${Object.keys(statsByMunicipality).length}`}
              ref={geoJsonRef}
              data={geoData as never}
              style={(feature) => {
                const rawName: string = (feature?.properties?.MPIO_CNMBR as string) ?? "";
                const stats = getStats(rawName, statsByMunicipality);
                const isSelected = rawName === selectedName;
                return {
                  color: isSelected ? "#273241" : getBorder(stats.supportPercent),
                  weight: isSelected ? 3 : 1.5,
                  fillColor: getFill(stats.supportPercent),
                  fillOpacity: isSelected ? 0.82 : 0.60,
                } satisfies PathOptions;
              }}
              onEachFeature={(feature, layer) => {
                const rawName: string = (feature.properties?.MPIO_CNMBR as string) ?? "-";
                const stats = getStats(rawName, statsByMunicipality);
                const pct = stats.supportPercent;
                const cls = pct >= 75 ? "support-high" : pct >= 68 ? "support-mid" : "support-low";

                layer.bindTooltip(
                  `<div style="min-width:180px">
                  <strong>${rawName}</strong>
                  Personas: <b>${stats.voters.toLocaleString("es-CO")}</b><br/>
                  Líderes: <b>${stats.leaders}</b><br/>
                  Apoyo: <span class="${cls}">${pct}%</span><br/>
                  <span style="color:#7b8493">Clic para ver detalle</span>
                </div>`,
                  { sticky: true, direction: "top", opacity: 1 }
                );

                layer.on({
                  click: () => setSelectedName(rawName),
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
        {selectedName && selectedStats ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">Municipio seleccionado</p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-brand-ink">{selectedName}</h3>
              </div>
              <span className="w-fit rounded-full border border-brand-line bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                {selectedStats.supportPercent}% apoyo
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Personas", value: selectedStats.voters.toLocaleString("es-CO") },
                { label: "Líderes", value: selectedStats.leaders.toLocaleString("es-CO") },
                { label: "Empleados", value: selectedStats.employed.toLocaleString("es-CO") },
                { label: "Desempleados", value: selectedStats.unemployed.toLocaleString("es-CO") },
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
