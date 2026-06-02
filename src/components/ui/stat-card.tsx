import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  delta: string;
  icon: ReactNode;
  tone?: "gold" | "emerald" | "navy" | "neutral";
};

const toneClasses = {
  gold: "from-brand-gold/20 via-white to-brand-cream border-brand-gold/25",
  emerald: "from-brand-emerald/22 via-white to-brand-emeraldSoft/28 border-brand-emerald/32",
  navy: "from-brand-navy/12 via-white to-brand-emeraldSoft/24 border-brand-navy/18",
  neutral: "from-white via-brand-beige/70 to-brand-cream border-brand-emerald/24"
};

export function StatCard({ label, value, hint, delta, icon, tone = "neutral" }: StatCardProps) {
  return (
    <Card className={cn("bg-gradient-to-br", toneClasses[tone])}>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-white/65">{label}</p>
          <div>
            <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
            <p className="mt-1 text-sm text-white/72">{hint}</p>
          </div>
          <Badge variant="neutral" className="bg-white/70 text-brand-ink/75">
            {delta}
          </Badge>
        </div>
        <div className="rounded-2xl border border-brand-line bg-white/70 p-3 text-brand-navy">{icon}</div>
      </CardContent>
    </Card>
  );
}
