"use client";

import { Menu, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { roleMeta } from "@/lib/types/roles";
import { useDemoSession } from "@/components/providers/demo-session-provider";
import type { AppRole } from "@/lib/types/roles";

type TopbarProps = {
  onMenuClick: () => void;
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const { role, setRole, displayName, logout } = useDemoSession();

  return (
    <header className="sticky top-0 z-30 border-b border-brand-line bg-white/86 px-4 py-4 backdrop-blur-2xl sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="xl:hidden" onClick={onMenuClick}>
            <Menu className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/65">Panel ejecutivo</p>
            <h1 className="text-lg font-semibold text-white sm:text-2xl">{displayName}</h1>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 xl:flex-row xl:items-center xl:justify-end">
          <div className="relative xl:w-[340px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <Input placeholder="Buscar personas, líderes o territorios" className="pl-11" />
          </div>

          <Select value={role} onChange={(event) => setRole(event.target.value as AppRole)} className="xl:w-[230px]">
            {roleMeta.map((item) => (
              <option key={item.value} value={item.value} className="bg-brand-cream text-brand-ink">
                {item.shortLabel}
              </option>
            ))}
          </Select>

          <Button variant="ghost" onClick={logout} className="justify-center">
            <LogOut className="h-4 w-4" />
            Salir
          </Button>
        </div>
      </div>
    </header>
  );
}
