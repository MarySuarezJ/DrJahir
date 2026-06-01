"use client";

import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { roleMeta } from "@/lib/types/roles";
import { cn } from "@/lib/utils";

type RoleSelectorProps = {
  value: string;
  onChange: (role: string) => void;
};

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {roleMeta.map((role) => {
        const active = value === role.value;

        return (
          <button key={role.value} type="button" className="text-left" onClick={() => onChange(role.value)}>
            <Card
              className={cn(
                "h-full transition duration-200",
                active ? "border-brand-gold/30 bg-brand-gold/10 shadow-glowGold" : "hover:border-white/20 hover:bg-white/10"
              )}
            >
              <div className="flex h-full flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={active ? "gold" : "neutral"}>{role.shortLabel}</Badge>
                  {active ? <Check className="h-4 w-4 text-brand-goldSoft" /> : null}
                </div>
                <div>
                  <p className="font-display text-base font-semibold text-white">{role.label}</p>
                  <p className="mt-1 text-sm leading-6 text-white/72">{role.description}</p>
                </div>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
