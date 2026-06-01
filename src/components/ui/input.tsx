import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-brand-line bg-white/80 px-4 text-sm text-brand-ink placeholder:text-brand-muted/60 shadow-inner shadow-brand-sand/20 outline-none transition focus:border-brand-gold/50 focus:bg-white",
        className
      )}
      {...props}
    />
  );
}
