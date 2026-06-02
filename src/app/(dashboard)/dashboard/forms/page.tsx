import { Badge } from "@/components/ui/badge";
import { PublicIntakeForm } from "@/components/forms/public-intake-form";

export default function FormsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="gold">Formularios públicos</Badge>
        <h2 className="mt-3 font-display text-4xl font-semibold text-brand-ink">Captación y seguimiento</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-ink/72 sm:text-base">
          La captura pública alimenta el CRM con un flujo limpio para simpatizantes, voluntarios y líderes.
        </p>
      </div>

      <div className="max-w-5xl">
        <PublicIntakeForm />
      </div>
    </div>
  );
}
