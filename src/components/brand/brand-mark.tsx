import Image from "next/image";
import logo from "../../../Logo.png";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
  subtitle?: string;
};

export function BrandMark({ className, compact = false, subtitle = "CRM político inteligente" }: BrandMarkProps) {
  return (
    <div className={cn("flex min-w-0 gap-4", compact ? "items-center" : "flex-col items-start sm:flex-row sm:items-center", className)}>
      <div className="relative overflow-hidden rounded-3xl border border-brand-line bg-white/82 p-3 shadow-panel backdrop-blur-xl">
        <Image src={logo} alt="Jahir Alvarez" className={compact ? "h-16 w-auto" : "h-20 w-auto"} priority />
      </div>
      <div className="min-w-0 space-y-1">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">Plataforma premium</p>
        <p className="text-wrap text-sm font-semibold text-white">{subtitle}</p>
      </div>
    </div>
  );
}
