import { Badge } from "@/components/ui/badge";
import { AdminWorkspace } from "@/components/admin/admin-workspace";

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="gold">Administración</Badge>
        <h2 className="mt-3 font-display text-4xl font-semibold text-brand-ink">Usuarios, roles y alertas importantes</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-ink/72 sm:text-base">
          Panel administrativo para separar el perfil del doctor de la gestión global del sistema: accesos, permisos y reglas de comunicación.
        </p>
      </div>

      <AdminWorkspace />
    </div>
  );
}
