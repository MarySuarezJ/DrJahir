import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { appRoles, type AppRole } from "@/lib/types/roles";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  username: z.string().min(2),
  role: z.enum(appRoles),
  status: z.enum(["active", "paused"]).default("active"),
  territory: z.string().optional().default(""),
  canManageAlerts: z.boolean().optional().default(false)
});

const updateUserSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(appRoles).optional(),
  status: z.enum(["active", "paused"]).optional(),
  territory: z.string().optional(),
  canManageAlerts: z.boolean().optional()
});

const deleteUserSchema = z.object({
  id: z.string().uuid()
});

async function getAdminActor() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { response: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("perfiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin_principal") {
    return { response: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }

  return { userId: user.id };
}

function profileToAdminUser(profile: {
  id: string;
  full_name: string;
  email: string | null;
  username: string | null;
  role: AppRole;
  status: string;
  territory: string | null;
  can_manage_alerts: boolean | null;
  created_at: string;
}) {
  const email = profile.email ?? "";

  return {
    id: profile.id,
    fullName: profile.full_name,
    username: profile.username || email.split("@")[0] || "usuario",
    email,
    role: profile.role,
    status: profile.status === "paused" ? "paused" : "active",
    territory: profile.territory ?? "Sin territorio asignado",
    canManageAlerts: Boolean(profile.can_manage_alerts) || profile.role === "admin_principal" || profile.role === "secretaria",
    lastAccess: "Registrado",
    createdAt: profile.created_at ? new Date(profile.created_at).toLocaleDateString("es-CO") : "Sin fecha"
  };
}

export async function GET() {
  const actor = await getAdminActor();
  if ("response" in actor) return actor.response;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("perfiles")
    .select("id,full_name,email,username,role,status,territory,can_manage_alerts,created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ users: (data ?? []).map((profile) => profileToAdminUser(profile as Parameters<typeof profileToAdminUser>[0])) });
}

export async function POST(request: Request) {
  const payload = createUserSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Datos inválidos", issues: payload.error.flatten() }, { status: 400 });
  }

  const actor = await getAdminActor();
  if ("response" in actor) return actor.response;

  const admin = createSupabaseAdminClient();
  const { email, password, fullName, username, role, status, territory, canManageAlerts } = payload.data;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      username
    }
  });

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? "No se pudo crear el usuario" }, { status: 400 });
  }

  const { error: upsertError } = await admin.from("perfiles").upsert({
    id: created.user.id,
    email,
    username: username.trim().toLowerCase(),
    full_name: fullName,
    role,
    status,
    territory: territory.trim() || null,
    can_manage_alerts: canManageAlerts
  });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 400 });
  }

  return NextResponse.json({
    user: {
      id: created.user.id,
      email,
      fullName,
      username: username.trim().toLowerCase(),
      role,
      status,
      territory: territory.trim() || "Sin territorio asignado",
      canManageAlerts,
      lastAccess: "Pendiente",
      createdAt: "Ahora"
    }
  });
}

export async function PATCH(request: Request) {
  const payload = updateUserSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Datos inválidos", issues: payload.error.flatten() }, { status: 400 });
  }

  const actor = await getAdminActor();
  if ("response" in actor) return actor.response;

  const updatePayload: Record<string, unknown> = {};
  if (payload.data.role) updatePayload.role = payload.data.role;
  if (payload.data.status) updatePayload.status = payload.data.status;
  if (payload.data.territory !== undefined) updatePayload.territory = payload.data.territory.trim() || null;
  if (payload.data.canManageAlerts !== undefined) updatePayload.can_manage_alerts = payload.data.canManageAlerts;

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ ok: true });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("perfiles").update(updatePayload).eq("id", payload.data.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const payload = deleteUserSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const actor = await getAdminActor();
  if ("response" in actor) return actor.response;

  if (payload.data.id === actor.userId) {
    return NextResponse.json({ error: "No puedes eliminar tu propio usuario activo." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(payload.data.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
