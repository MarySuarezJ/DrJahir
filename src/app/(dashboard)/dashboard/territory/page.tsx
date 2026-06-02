import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { territoryMetrics } from "@/lib/data/territory";
import { TerritoryTree } from "@/components/territory/territory-tree";

export default function TerritoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="gold">Jerarquía política</Badge>
        <h2 className="mt-3 font-display text-4xl font-semibold text-brand-ink">Estructura territorial y liderazgo</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-ink/72 sm:text-base">
          Una vista tipo árbol para entender movilización, cobertura y alcance de los líderes en Caldas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {territoryMetrics.map((territory) => (
          <Card key={territory.name} className="border-brand-line bg-white/78">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">{territory.name}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-brand-ink">{territory.supportPercent}%</h3>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-brand-ink/70">
              <div className="flex items-center justify-between rounded-2xl border border-brand-line bg-brand-cream/70 px-4 py-3">
                <span>Votantes</span>
                <span className="text-brand-ink">{territory.voters.toLocaleString("es-CO")}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-brand-line bg-brand-cream/70 px-4 py-3">
                <span>Líderes</span>
                <span className="text-brand-ink">{territory.leaders}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TerritoryTree />
    </div>
  );
}
