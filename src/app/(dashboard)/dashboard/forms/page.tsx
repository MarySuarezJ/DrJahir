import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PublicIntakeForm } from "@/components/forms/public-intake-form";

export default function FormsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="gold">Formularios públicos</Badge>
        <h2 className="mt-3 font-display text-4xl font-semibold text-white">Captación y seguimiento</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75 sm:text-base">
          La captura pública alimenta el CRM con un flujo limpio para simpatizantes, voluntarios y líderes.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <PublicIntakeForm />

        <Card className="border-white/20 bg-white/[0.04]">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.28em] text-white/65">Control de formularios</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-white">Vistas, conversiones y cola</h3>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/80">
            {[
              ["Formulario activo", "Registro público de simpatizantes y voluntarios"],
              ["Sincronización", "Inserción futura en PostgreSQL y Storage"],
              ["Conversión", "Leads por barrio y municipio"],
              ["Seguimiento", "Tareas automáticas y mensajes" ]
            ].map(([title, detail]) => (
              <div key={title} className="rounded-3xl border border-white/20 bg-white/[0.10] p-4">
                <p className="font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm text-white/75">{detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
