import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-2xl border border-brand-line bg-white/80 px-4 text-sm text-brand-ink outline-none transition focus:border-brand-gold/50 focus:bg-white",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
