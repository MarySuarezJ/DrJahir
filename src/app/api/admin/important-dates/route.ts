import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/types/roles";

const statusSchema = z.enum(["active", "scheduled", "draft", "paused"]);

const importantDateSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2),
  date: z.string().min(1),
  channel: z.enum(["WhatsApp", "Correo", "SMS"]),
  audience: z.string().optional().default("Todos los registrados"),
  status: statusSchema.default("draft"),
  message: z.string().min(1)
});

const deleteSchema = z.object({
  id: z.string().uuid()
});

type Actor = {
  userId: string;
  role: AppRole;
  canManageAlerts: boolean;
};

type ImportantDateRow = {
  id: string;
  title: string;
  exact_date: string | null;
  date_month: number | null;
  date_day: number | null;
  channel: "whatsapp" | "email" | "sms";
  audience_scope: Record<string, unknown> | null;
  message_template: string;
  active: boolean;
  created_by: string | null;
};

function channelToDb(channel: "WhatsApp" | "Correo" | "SMS") {
  if (channel === "Correo") return "email";
  if (channel === "SMS") return "sms";
  return "whatsapp";
}

function channelFromDb(channel: ImportantDateRow["channel"]) {
  if (channel === "email") return "Correo";
  if (channel === "sms") return "SMS";
  return "WhatsApp";
}

function statusToActive(status: z.infer<typeof statusSchema>) {
  return status === "active" || status === "scheduled";
}

function statusFromActive(active: boolean, exactDate: string | null) {
  if (!active) return "draft";
  if (exactDate) {
    const time = new Date(`${exactDate}T00:00:00`).valueOf();
    if (!Number.isNaN(time) && time > Date.now()) return "scheduled";
  }
  return "active";
}

function parseDateParts(value: string) {
  const clean = value.trim();
  if (!clean || clean.toLowerCase().includes("todos")) {
    return { exactDate: null, month: 1, day: 1 };
  }

  const parsed = new Date(`${clean}T00:00:00`);
  if (!Number.isNaN(parsed.valueOf()) && /^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return {
      exactDate: clean,
      month: parsed.getUTCMonth() + 1,
      day: parsed.getUTCDate()
    };
  }

  const match = clean.match(/^(\d{1,2})[/-](\d{1,2})$/);
  if (match) {
    return {
      exactDate: null,
      month: Math.min(Math.max(Number(match[1]), 1), 12),
      day: Math.min(Math.max(Number(match[2]), 1), 31)
    };
  }

  return { exactDate: null, month: 1, day: 1 };
}

function rowToAlert(row: ImportantDateRow) {
  const scope = row.audience_scope ?? {};
  const audience = typeof scope.audience === "string" ? scope.audience : "Todos los registrados";

  return {
    id: row.id,
    title: row.title,
    date: row.exact_date ?? (row.date_month && row.date_day ? `${row.date_month}/${row.date_day}` : "Fecha por definir"),
    channel: channelFromDb(row.channel),
    audience,
    status: statusFromActive(row.active, row.exact_date),
    message: row.message_template,
    owner: "Administración"
  };
}

async function getActor(write = false): Promise<{ actor: Actor } | { response: NextResponse }> {
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
    .select("role,can_manage_alerts")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.role) {
    return { response: NextResponse.json({ error: "Perfil no configurado" }, { status: 403 }) };
  }

  const actor = {
    userId: user.id,
    role: profile.role as AppRole,
    canManageAlerts: Boolean(profile.can_manage_alerts)
  };
  const canAccess = actor.role === "admin_principal" || actor.role === "secretaria" || actor.canManageAlerts;

  void write;

  if (!canAccess) {
    return { response: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }

  return { actor };
}

export async function GET() {
  const actor = await getActor();
  if ("response" in actor) return actor.response;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("fechas_importantes")
    .select("id,title,exact_date,date_month,date_day,channel,audience_scope,message_template,active,created_by")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ alerts: ((data ?? []) as ImportantDateRow[]).map(rowToAlert) });
}

export async function POST(request: Request) {
  const payload = importantDateSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Datos inválidos", issues: payload.error.flatten() }, { status: 400 });
  }

  const actor = await getActor(true);
  if ("response" in actor) return actor.response;

  const { exactDate, month, day } = parseDateParts(payload.data.date);
  const row = {
    title: payload.data.title.trim(),
    date_type: "custom",
    date_month: month,
    date_day: day,
    exact_date: exactDate,
    channel: channelToDb(payload.data.channel),
    audience_scope: { audience: payload.data.audience.trim() || "Todos los registrados" },
    message_template: payload.data.message,
    active: statusToActive(payload.data.status),
    created_by: actor.actor.userId
  };

  const admin = createSupabaseAdminClient();
  const query = payload.data.id
    ? admin.from("fechas_importantes").update(row).eq("id", payload.data.id)
    : admin.from("fechas_importantes").insert(row);

  const { data, error } = await query
    .select("id,title,exact_date,date_month,date_day,channel,audience_scope,message_template,active,created_by")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "No se pudo guardar la fecha." }, { status: 500 });
  }

  return NextResponse.json({ alert: rowToAlert(data as ImportantDateRow) });
}

export async function PATCH(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  const payload = deleteSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const actor = await getActor(true);
  if ("response" in actor) return actor.response;

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("fechas_importantes").delete().eq("id", payload.data.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
