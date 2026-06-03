import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicIntakeForm } from "@/components/forms/public-intake-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type EditPersonPageProps = {
  params: Promise<{ documentNumber: string }>;
};

export default async function EditPersonPage({ params }: EditPersonPageProps) {
  const { documentNumber } = await params;
  const decodedDocumentNumber = decodeURIComponent(documentNumber);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="emerald">Editar registro</Badge>
          <h2 className="mt-3 font-display text-4xl font-semibold text-brand-ink">Modificar persona o líder</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-ink/72 sm:text-base">
            Actualiza datos personales, territorio, votación, líder responsable y hoja de vida opcional.
          </p>
        </div>
        <Link href="/dashboard/people">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            Volver al directorio
          </Button>
        </Link>
      </div>

      <PublicIntakeForm mode="direct" documentNumber={decodedDocumentNumber} submitLabel="Guardar cambios" />
    </div>
  );
}
