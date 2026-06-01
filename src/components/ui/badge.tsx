import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]", {
  variants: {
    variant: {
      neutral: "border-brand-line bg-white/70 text-brand-ink/75",
      gold: "border-brand-gold/35 bg-brand-gold/12 text-brand-ink",
      emerald: "border-brand-emerald/30 bg-brand-emerald/12 text-brand-emerald",
      navy: "border-brand-navy/20 bg-brand-navy/8 text-brand-navy",
      danger: "border-rose-200 bg-rose-50 text-rose-700"
    }
  },
  defaultVariants: {
    variant: "neutral"
  }
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
