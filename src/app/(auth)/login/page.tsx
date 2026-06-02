import { BrandMark } from "@/components/brand/brand-mark";
import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";

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
            <p className="max-w-full break-words text-base leading-7 text-brand-ink/72 sm:max-w-2xl sm:text-lg">
              Plataforma operativa para seguimiento de líderes, personas movilizadas, territorios, alertas, documentos y comunicación segmentada.
            </p>
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
