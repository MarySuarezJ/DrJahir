import { BrandMark } from "@/components/brand/brand-mark";
import { PublicIntakeForm } from "@/components/forms/public-intake-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function RegistroPublicoPage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <section className="space-y-6">
          <BrandMark subtitle="Formulario público de captación" />
          <Badge variant="gold">Registro abierto</Badge>
          <h1 className="font-display text-4xl font-semibold leading-tight text-brand-ink sm:text-6xl sm:leading-[0.95]">
            Participa con el equipo y entra al radar territorial.
          </h1>
          <p className="max-w-xl text-base leading-7 text-brand-ink/72 sm:text-lg">
            Este formulario público recibe simpatizantes, voluntarios y líderes para alimentar la base de datos del CRM político con trazabilidad y diseño premium.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Captación inmediata", "Alta en base de datos con flujo de seguimiento."],
              ["Territorio priorizado", "Clasificación automática por municipio y comuna."],
              ["Automatización futura", "Mensajes y campañas por segmento."],
              ["Visual corporativa", "Diseño compatible con la identidad premium."]
            ].map(([title, detail]) => (
              <Card key={title} className="border-brand-line bg-white/78 p-5">
                <p className="font-semibold text-brand-ink">{title}</p>
                <p className="mt-2 text-sm leading-6 text-brand-ink/70">{detail}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <PublicIntakeForm />
        </section>
      </div>
    </main>
  );
}
