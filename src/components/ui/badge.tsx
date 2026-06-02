import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]", {
  variants: {
    variant: {
      neutral: "border-brand-emerald/22 bg-white/76 text-brand-ink/75",
      gold: "border-brand-gold/35 bg-brand-gold/12 text-brand-ink",
      emerald: "border-brand-emerald/36 bg-brand-emerald/14 text-brand-navy",
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
