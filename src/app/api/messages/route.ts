import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { messageChannels, type DeliveryResult, type MessageChannel, type MessageStatus } from "@/lib/messaging/types";
import { resolveAudienceRecipients, renderMessageTemplate } from "@/lib/messaging/audience";
import { sendMessage } from "@/lib/messaging/providers";
import type { AppRole } from "@/lib/types/roles";

const sendMessageSchema = z.object({
  channel: z.enum(messageChannels),
  audience: z.string().min(1),
  subject: z.string().optional().default(""),
  body: z.string().min(1)
});

type MessageActor = {
  userId: string;
  role: AppRole;
  canManageAlerts: boolean;
};

type MessageBatchRow = {
  id: string;
  canal: MessageChannel;
  audiencia: string;
  asunto: string | null;
  cuerpo: string;
  estado: MessageStatus;
  proveedor: string | null;
  modo_simulacion: boolean;
  total_destinatarios: number;
  total_enviados: number;
  total_fallidos: number;
  created_at: string;
};

function maxRecipients() {
  const parsed = Number(process.env.MESSAGING_MAX_RECIPIENTS ?? "100");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
}

async function getMessageActor(write = false): Promise<{ actor: MessageActor } | { response: NextResponse }> {
  let supabase;

  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return {
      response: NextResponse.json(
        { error: "Faltan variables de Supabase para autenticar el envío." },
        { status: 500 }
      )
    };
  }

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

  const canWrite = actor.role === "admin_principal" || actor.canManageAlerts;
  const canRead = canWrite || actor.role === "doctor" || actor.role === "secretaria";

  if ((write && !canWrite) || (!write && !canRead)) {
    return { response: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }

  return { actor };
}

function batchToResponse(row: MessageBatchRow) {
  return {
    id: row.id,
    channel: row.canal,
    audience: row.audiencia,
    subject: row.asunto ?? "(sin asunto)",
    body: row.cuerpo,
    status: row.estado,
    provider: row.proveedor ?? "",
    simulated: row.modo_simulacion,
    totalRecipients: row.total_destinatarios,
    totalSent: row.total_enviados,
    totalFailed: row.total_fallidos,
    sentAt: row.created_at ? new Date(row.created_at).toLocaleString("es-CO") : "Sin fecha"
  };
}

export async function GET() {
  const actor = await getMessageActor();
  if ("response" in actor) return actor.response;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("envios_mensajes")
    .select("id,canal,audiencia,asunto,cuerpo,estado,proveedor,modo_simulacion,total_destinatarios,total_enviados,total_fallidos,created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ messages: ((data ?? []) as MessageBatchRow[]).map(batchToResponse) });
}

export async function POST(request: Request) {
  const payload = sendMessageSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Datos inválidos", issues: payload.error.flatten() }, { status: 400 });
  }

  const actor = await getMessageActor(true);
  if ("response" in actor) return actor.response;

  const admin = createSupabaseAdminClient();
  const { channel, audience, subject, body } = payload.data;
  const recipients = await resolveAudienceRecipients(admin, channel, audience);
  const allowedRecipients = maxRecipients();

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No hay destinatarios con datos válidos para ese canal y audiencia." },
      { status: 400 }
    );
  }

  if (recipients.length > allowedRecipients) {
    return NextResponse.json(
      { error: `La audiencia tiene ${recipients.length} destinatarios. El límite actual es ${allowedRecipients}. Ajusta MESSAGING_MAX_RECIPIENTS para producción.` },
      { status: 400 }
    );
  }

  const { data: batch, error: batchError } = await admin
    .from("envios_mensajes")
    .insert({
      canal: channel,
      audiencia: audience,
      asunto: subject.trim() || null,
      cuerpo: body,
      estado: "pendiente",
      total_destinatarios: recipients.length,
      enviado_por: actor.actor.userId
    })
    .select("id")
    .single();

  if (batchError || !batch?.id) {
    return NextResponse.json({ error: batchError?.message ?? "No se pudo crear el envío." }, { status: 500 });
  }

  let sent = 0;
  let failed = 0;
  let simulated = 0;
  const providers = new Set<string>();

  for (const recipient of recipients) {
    const renderedBody = renderMessageTemplate(body, recipient);
    const result = await sendMessage({ channel, recipient, subject, body: renderedBody }).catch((error: unknown): DeliveryResult => ({
      status: "fallido",
      provider: channel,
      simulated: false,
      error: error instanceof Error ? error.message : "Error desconocido enviando el mensaje."
    }));

    providers.add(result.provider);
    if (result.status === "enviado") sent += 1;
    if (result.status === "simulado") simulated += 1;
    if (result.status === "fallido") failed += 1;

    const { error: recipientError } = await admin.from("destinatarios_mensaje").insert({
      envio_id: batch.id,
      persona_id: recipient.id,
      nombre: recipient.fullName,
      email: recipient.email || null,
      telefono: recipient.phone || null,
      whatsapp: recipient.whatsapp || null,
      estado: result.status,
      proveedor: result.provider,
      proveedor_message_id: result.providerMessageId ?? null,
      error: result.error ?? null,
      enviado_at: result.status === "enviado" || result.status === "simulado" ? new Date().toISOString() : null
    });

    if (recipientError) {
      failed += 1;
    }
  }

  const status: MessageStatus = failed === 0 && simulated === recipients.length
    ? "simulado"
    : failed === 0
      ? "enviado"
      : sent + simulated > 0
        ? "parcial"
        : "fallido";

  const { data: updated, error: updateError } = await admin
    .from("envios_mensajes")
    .update({
      estado: status,
      proveedor: Array.from(providers).join(", "),
      modo_simulacion: simulated === recipients.length,
      total_enviados: sent,
      total_fallidos: failed,
      error: failed > 0 ? `${failed} destinatario(s) fallaron.` : null
    })
    .eq("id", batch.id)
    .select("id,canal,audiencia,asunto,cuerpo,estado,proveedor,modo_simulacion,total_destinatarios,total_enviados,total_fallidos,created_at")
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message ?? "No se pudo actualizar el envío." }, { status: 500 });
  }

  return NextResponse.json({
    message: batchToResponse(updated as MessageBatchRow),
    summary: {
      recipients: recipients.length,
      sent,
      simulated,
      failed,
      status
    }
  });
}
