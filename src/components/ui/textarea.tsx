import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full rounded-2xl border border-brand-line bg-white/80 px-4 py-3 text-sm text-brand-ink placeholder:text-brand-muted/60 shadow-inner shadow-brand-sand/20 outline-none transition focus:border-brand-gold/50 focus:bg-white",
        className
      )}
      {...props}
    />
  );
}
