import { BrandMark } from "@/components/brand/brand-mark";
import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Shield, Sparkles, WandSparkles } from "lucide-react";

const loginHighlights = [
  { icon: Shield, title: "Permisos por rol", detail: "Acceso segmentado por administración, legal y territorio." },
  { icon: Sparkles, title: "Dashboard inteligente", detail: "Métricas, mapa, rankings y actividad en tiempo real." },
  { icon: WandSparkles, title: "Automatización", detail: "Cumpleaños, campañas y segmentación listas para escalar." }
];

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[1.15fr_0.9fr]">
        <section className="w-full min-w-0 space-y-8 overflow-hidden">
          <BrandMark subtitle="Jahir Alvarez · Comando político digital" />

          <div className="w-full max-w-3xl space-y-5">
            <Badge variant="gold">CRM político premium</Badge>
            <h1 className="max-w-full break-words font-display text-4xl font-semibold leading-tight text-brand-ink sm:text-6xl sm:leading-[0.95] xl:text-7xl">
              Control territorial, analítica y gestión política en una sola plataforma.
            </h1>
            <p className="max-w-full break-words text-base leading-7 text-white/80 sm:max-w-2xl sm:text-lg">
              Una demo local de alto nivel para presentar liderazgo, coordinación barrial, automatización y control de campañas con estética corporativa y visión de producción.
            </p>
          </div>

          <div className="grid min-w-0 gap-4 md:grid-cols-3">
            {loginHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="border-brand-line bg-white/76">
                  <div className="space-y-4 p-5">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-line bg-brand-beige/75 text-brand-navy">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-white/75">{item.detail}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="relative min-w-0">
          <div className="absolute inset-0 rounded-[32px] bg-brand-mesh opacity-80 blur-3xl" />
          <div className="relative">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
