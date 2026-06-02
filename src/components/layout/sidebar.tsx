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
        "fixed inset-y-0 left-0 z-40 w-[300px] transform border-r border-brand-emerald/25 bg-white/92 p-5 backdrop-blur-2xl transition lg:static lg:translate-x-0",
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
                    ? "border-brand-emerald/45 bg-brand-emerald/16 text-brand-ink shadow-glowEmerald"
                    : "border-brand-line bg-white/68 text-brand-ink/78 hover:border-brand-emerald/35 hover:bg-brand-emerald/8 hover:text-brand-ink"
                )}
              >
                <span className={cn("rounded-xl p-2", active ? "bg-white/80 text-brand-navy" : "bg-brand-emeraldSoft/25 text-brand-navy")}>
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
