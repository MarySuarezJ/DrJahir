"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { getNavigationForRole } from "@/lib/permissions";
import { useSession } from "@/components/providers/session-provider";
import { cn } from "@/lib/utils";

type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { role } = useSession();
  const navigation = useMemo(() => getNavigationForRole(role), [role]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-[300px] transform border-r border-brand-line bg-white/90 p-5 backdrop-blur-2xl transition lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="space-y-6">
        <BrandMark compact />

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-4 py-3 transition",
                  active
                    ? "border-brand-gold/35 bg-brand-gold/12 text-brand-ink shadow-glowGold"
                    : "border-brand-line bg-white/60 text-brand-ink/78 hover:border-brand-gold/25 hover:bg-brand-beige/70 hover:text-brand-ink"
                )}
              >
                <span className={cn("rounded-xl p-2", active ? "bg-white/70" : "bg-brand-beige/70")}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="block truncate text-xs text-brand-ink/58">{item.description}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
