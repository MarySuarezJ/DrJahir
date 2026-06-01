import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold/45 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border border-brand-line bg-white text-brand-ink shadow-sm hover:border-brand-gold/35 hover:bg-brand-cream",
        secondary: "border border-brand-line bg-brand-navySoft text-white shadow-sm hover:bg-brand-navy",
        ghost: "bg-transparent text-brand-ink/75 hover:bg-brand-beige/70 hover:text-brand-ink",
        gold: "bg-gradient-to-r from-brand-gold to-brand-goldSoft text-brand-ink shadow-glowGold hover:brightness-105",
        emerald: "bg-gradient-to-r from-brand-emerald to-brand-emeraldSoft text-white shadow-glowEmerald hover:brightness-105",
        danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-5",
        lg: "h-12 px-6",
        icon: "h-10 w-10 p-0"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  children: ReactNode;
}

export function Button({ className, children, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  );
}
