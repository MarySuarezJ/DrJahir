import { Badge } from "@/components/ui/badge";

export function TerritoryLegend() {
  const stops = [
    { label: "Bajo", color: "#10213d" },
    { label: "Medio", color: "#d7b24a" },
    { label: "Alto", color: "#1ba66a" }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.28em] text-white/65">Escala de apoyo</p>
        <Badge variant="neutral">GeoJSON</Badge>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {stops.map((stop) => (
          <div key={stop.label} className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/[0.10] px-3 py-2 text-xs text-white/85">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: stop.color }} />
            {stop.label}
          </div>
        ))}
      </div>
    </div>
  );
}
