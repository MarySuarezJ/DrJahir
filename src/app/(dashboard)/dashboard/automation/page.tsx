import { Badge } from "@/components/ui/badge";
import { AutomationWorkspace } from "@/components/automation/automation-workspace";

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="gold">Automatización política</Badge>
        <h2 className="mt-3 font-display text-4xl font-semibold text-white">Campañas, cumpleaños y segmentación</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75 sm:text-base">
          Estructura preparada para WhatsApp, correo y SMS sin integrar todavía APIs externas.
        </p>
      </div>

      <AutomationWorkspace />
    </div>
  );
}
