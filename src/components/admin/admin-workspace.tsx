"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, CalendarPlus, ShieldCheck, Trash2, UserPlus, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { Textarea } from "@/components/ui/textarea";
import { useDemoSession } from "@/components/providers/demo-session-provider";
import {
  adminUsersSeed,
  importantAlertsSeed,
  type AdminUser,
  type AdminUserStatus,
  type ImportantAlert,
  type ImportantAlertStatus
} from "@/lib/data/admin";
import { appRoles, roleMeta, type AppRole } from "@/lib/types/roles";

const usersStorageKey = "jahir-admin-users";
const alertsStorageKey = "jahir-admin-alerts";

const statusVariant: Record<AdminUserStatus | ImportantAlertStatus, "emerald" | "gold" | "neutral" | "danger"> = {
  active: "emerald",
  scheduled: "gold",
  draft: "neutral",
  paused: "danger"
};

const statusLabel: Record<AdminUserStatus | ImportantAlertStatus, string> = {
  active: "Activo",
  scheduled: "Programado",
  draft: "Borrador",
  paused: "Pausado"
};

const emptyUser = (): Omit<AdminUser, "id" | "lastAccess" | "createdAt"> => ({
  fullName: "",
  username: "",
  email: "",
  role: "secretaria",
  status: "active",
  territory: "",
  canManageAlerts: false
});

const emptyAlert = (): Omit<ImportantAlert, "id" | "owner"> => ({
  title: "",
  date: "",
  channel: "WhatsApp",
  audience: "",
  status: "draft",
  message: ""
});

function parseStoredList<T>(value: string | null, fallback: T[]) {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function getRoleLabel(role: AppRole) {
  return roleMeta.find((item) => item.value === role)?.label ?? role;
}

export function AdminWorkspace() {
  const { role, displayName } = useDemoSession();
  const [hydrated, setHydrated] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>(adminUsersSeed);
  const [alerts, setAlerts] = useState<ImportantAlert[]>(importantAlertsSeed);
  const [userForm, setUserForm] = useState(emptyUser());
  const [alertForm, setAlertForm] = useState(emptyAlert());

  useEffect(() => {
    setUsers(parseStoredList(window.localStorage.getItem(usersStorageKey), adminUsersSeed));
    setAlerts(parseStoredList(window.localStorage.getItem(alertsStorageKey), importantAlertsSeed));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(usersStorageKey, JSON.stringify(users));
    window.localStorage.setItem(alertsStorageKey, JSON.stringify(alerts));
  }, [alerts, hydrated, users]);

  const stats = useMemo(
    () => ({
      admins: users.filter((user) => user.role === "admin_principal").length,
      activeUsers: users.filter((user) => user.status === "active").length,
      alertManagers: users.filter((user) => user.canManageAlerts).length,
      activeAlerts: alerts.filter((alert) => alert.status === "active" || alert.status === "scheduled").length
    }),
    [alerts, users]
  );

  function createUser() {
    if (!userForm.fullName.trim() || !userForm.username.trim() || !userForm.email.trim()) return;

    setUsers((current) => [
      {
        ...userForm,
        id: `usr-${globalThis.crypto.randomUUID()}`,
        username: userForm.username.trim().toLowerCase(),
        email: userForm.email.trim().toLowerCase(),
        territory: userForm.territory.trim() || "Sin territorio asignado",
        lastAccess: "Pendiente",
        createdAt: "Ahora"
      },
      ...current
    ]);
    setUserForm(emptyUser());
  }

  function updateUser(id: string, patch: Partial<AdminUser>) {
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, ...patch } : user)));
  }

  function deleteUser(id: string) {
    setUsers((current) => current.filter((user) => user.id !== id));
  }

  function createAlert() {
    if (!alertForm.title.trim() || !alertForm.message.trim()) return;

    setAlerts((current) => [
      {
        ...alertForm,
        id: `alert-${globalThis.crypto.randomUUID()}`,
        date: alertForm.date || "Fecha por definir",
        audience: alertForm.audience.trim() || "Todos los registrados",
        owner: displayName
      },
      ...current
    ]);
    setAlertForm(emptyAlert());
  }

  function updateAlert(id: string, patch: Partial<ImportantAlert>) {
    setAlerts((current) => current.map((alert) => (alert.id === id ? { ...alert, ...patch } : alert)));
  }

  if (role !== "admin_principal") {
    return (
      <Card className="border-brand-gold/25 bg-brand-gold/8">
        <CardContent className="space-y-3 py-8">
          <Badge variant="gold">Acceso administrativo</Badge>
          <h3 className="font-display text-2xl font-semibold text-brand-ink">Solo administradores principales</h3>
          <p className="max-w-2xl text-sm leading-6 text-brand-ink/70">
            Este módulo permite crear usuarios, cambiar roles, asignar territorios y preparar alertas sensibles.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Administradores" value={String(stats.admins)} hint="Control total" delta="Rol crítico" icon={<ShieldCheck className="h-5 w-5" />} tone="gold" />
        <StatCard label="Usuarios activos" value={String(stats.activeUsers)} hint="Operación vigente" delta={`${users.length} creados`} icon={<UsersRound className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Gestores de alertas" value={String(stats.alertManagers)} hint="Permiso especial" delta="Días importantes" icon={<BellRing className="h-5 w-5" />} tone="navy" />
        <StatCard label="Alertas listas" value={String(stats.activeAlerts)} hint="Activas o programadas" delta={`${alerts.length} reglas`} icon={<CalendarPlus className="h-5 w-5" />} tone="neutral" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-brand-gold" />
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">Usuarios y roles</p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-brand-ink">Crear accesos administrativos</h3>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <Input value={userForm.fullName} onChange={(event) => setUserForm({ ...userForm, fullName: event.target.value })} placeholder="Nombre completo" />
              <Input value={userForm.username} onChange={(event) => setUserForm({ ...userForm, username: event.target.value })} placeholder="Usuario de acceso" />
              <Input type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} placeholder="Correo" />
              <Input value={userForm.territory} onChange={(event) => setUserForm({ ...userForm, territory: event.target.value })} placeholder="Territorio o alcance" />
              <Select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value as AppRole })}>
                {appRoles.map((item) => (
                  <option key={item} value={item}>
                    {getRoleLabel(item)}
                  </option>
                ))}
              </Select>
              <Select value={userForm.status} onChange={(event) => setUserForm({ ...userForm, status: event.target.value as AdminUserStatus })}>
                <option value="active">Activo</option>
                <option value="paused">Pausado</option>
              </Select>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-brand-line bg-white/70 px-4 py-3 text-sm text-brand-ink/75">
              <input
                type="checkbox"
                checked={userForm.canManageAlerts}
                onChange={(event) => setUserForm({ ...userForm, canManageAlerts: event.target.checked })}
                className="h-4 w-4 accent-brand-gold"
              />
              Puede crear y aprobar alertas de días importantes
            </label>

            <Button variant="gold" onClick={createUser}>
              <UserPlus className="h-4 w-4" />
              Crear usuario
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CalendarPlus className="h-5 w-5 text-brand-emerald" />
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">Alertas</p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-brand-ink">Días importantes</h3>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input value={alertForm.title} onChange={(event) => setAlertForm({ ...alertForm, title: event.target.value })} placeholder="Nombre de la alerta" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input type="date" value={alertForm.date} onChange={(event) => setAlertForm({ ...alertForm, date: event.target.value })} />
              <Select value={alertForm.channel} onChange={(event) => setAlertForm({ ...alertForm, channel: event.target.value as ImportantAlert["channel"] })}>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Correo">Correo</option>
                <option value="SMS">SMS</option>
              </Select>
            </div>
            <Input value={alertForm.audience} onChange={(event) => setAlertForm({ ...alertForm, audience: event.target.value })} placeholder="Audiencia objetivo" />
            <Select value={alertForm.status} onChange={(event) => setAlertForm({ ...alertForm, status: event.target.value as ImportantAlertStatus })}>
              <option value="draft">Borrador</option>
              <option value="scheduled">Programado</option>
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
            </Select>
            <Textarea value={alertForm.message} onChange={(event) => setAlertForm({ ...alertForm, message: event.target.value })} placeholder="Mensaje. Puedes usar {nombre} para personalizar." />
            <Button variant="emerald" onClick={createAlert}>
              <CalendarPlus className="h-4 w-4" />
              Guardar alerta
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">Directorio operativo</p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-brand-ink">{users.length} usuarios configurados</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="grid gap-3 rounded-2xl border border-brand-line bg-white/72 p-4 lg:grid-cols-[1.1fr_0.85fr_0.65fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-brand-ink">{user.fullName}</p>
                  <Badge variant={statusVariant[user.status]}>{statusLabel[user.status]}</Badge>
                </div>
                <p className="mt-1 text-sm text-brand-ink/62">
                  @{user.username} · {user.email} · {user.lastAccess}
                </p>
              </div>
              <Select value={user.role} onChange={(event) => updateUser(user.id, { role: event.target.value as AppRole })}>
                {appRoles.map((item) => (
                  <option key={item} value={item}>
                    {getRoleLabel(item)}
                  </option>
                ))}
              </Select>
              <Select value={user.status} onChange={(event) => updateUser(user.id, { status: event.target.value as AdminUserStatus })}>
                <option value="active">Activo</option>
                <option value="paused">Pausado</option>
              </Select>
              <div className="flex items-center justify-between gap-3 lg:justify-end">
                <label className="flex items-center gap-2 text-xs font-semibold text-brand-ink/64">
                  <input
                    type="checkbox"
                    checked={user.canManageAlerts}
                    onChange={(event) => updateUser(user.id, { canManageAlerts: event.target.checked })}
                    className="h-4 w-4 accent-brand-gold"
                  />
                  Alertas
                </label>
                <button
                  type="button"
                  onClick={() => deleteUser(user.id)}
                  disabled={user.id === "usr-admin"}
                  className="rounded-xl p-2 text-brand-muted transition hover:bg-rose-50 hover:text-rose-700 disabled:pointer-events-none disabled:opacity-35"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">Automatizaciones administrativas</p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-brand-ink">{alerts.length} alertas de fechas importantes</h3>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="rounded-2xl border border-brand-line bg-white/72 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-brand-ink">{alert.title}</p>
                  <p className="mt-1 text-sm text-brand-ink/62">{alert.date} · {alert.channel}</p>
                </div>
                <Badge variant={statusVariant[alert.status]}>{statusLabel[alert.status]}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-brand-ink/72">{alert.message}</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="rounded-xl border border-brand-line bg-brand-cream/70 px-3 py-2">
                  <p className="text-xs uppercase tracking-wider text-brand-muted">Audiencia</p>
                  <p className="mt-1 text-brand-ink">{alert.audience}</p>
                </div>
                <div className="rounded-xl border border-brand-line bg-brand-cream/70 px-3 py-2">
                  <p className="text-xs uppercase tracking-wider text-brand-muted">Responsable</p>
                  <p className="mt-1 text-brand-ink">{alert.owner}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Select value={alert.status} onChange={(event) => updateAlert(alert.id, { status: event.target.value as ImportantAlertStatus })}>
                  <option value="draft">Borrador</option>
                  <option value="scheduled">Programado</option>
                  <option value="active">Activo</option>
                  <option value="paused">Pausado</option>
                </Select>
                <button
                  type="button"
                  onClick={() => setAlerts((current) => current.filter((item) => item.id !== alert.id))}
                  className="rounded-xl p-3 text-brand-muted transition hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
