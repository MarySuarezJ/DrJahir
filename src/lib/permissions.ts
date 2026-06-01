import { navigationItems } from "@/lib/data/navigation";
import type { AppRole } from "@/lib/types/roles";

export function getNavigationForRole(role: AppRole) {
  return navigationItems.filter((item) => item.roles.includes(role));
}

export function hasRoleAccess(role: AppRole, allowedRoles: AppRole[]) {
  return allowedRoles.includes(role);
}
