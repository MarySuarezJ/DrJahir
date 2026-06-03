import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { resolveAudienceRecipients, renderMessageTemplate } from "@/lib/messaging/audience";
import { sendMessage } from "@/lib/messaging/providers";
import type { DeliveryResult, MessageChannel, MessageStatus } from "@/lib/messaging/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BirthdayTemplateRow = {
  title: string;
  channel: "whatsapp" | "email" | "sms";
  message_template: string;
};

function maxRecipients() {
  const parsed = Number(process.env.MESSAGING_MAX_RECIPIENTS ?? "100");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
}

function cronSecretResponse(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "Falta CRON_SECRET en variables de entorno." }, { status: 500 });
  }

  const authorization = request.headers.get("authorization");
  const querySecret = new URL(request.url).searchParams.get("secret");
  const valid = authorization === `Bearer ${secret}` || querySecret === secret;

  return valid ? null : NextResponse.json({ error: "No autorizado." }, { status: 401 });
}

function bogotaDateKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function toMessageChannel(channel: BirthdayTemplateRow["channel"]): MessageChannel {
  return channel === "email" ? "correo" : channel;
}

async function getBirthdayTemplate() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("fechas_importantes")
    .select("title,channel,message_template")
    .eq("date_type", "birthday")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return (data as BirthdayTemplateRow | null) ?? {
    title: "Feliz cumpleaños",
    channel: "whatsapp",
    message_template: "Hola {nombre}, desde el equipo del Dr. Jahir te deseamos un feliz cumpleaños."
  };
}

async function alreadySentToday(channel: MessageChannel, audience: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("envios_mensajes")
    .select("id,estado,total_destinatarios,total_enviados,total_fallidos,created_at")
    .eq("canal", channel)
    .eq("audiencia", audience)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

async function runBirthdayMessages(request: Request) {
  const unauthorized = cronSecretResponse(request);
  if (unauthorized) return unauthorized;

  const admin = createSupabaseAdminClient();
  const dateKey = bogotaDateKey();
  const template = await getBirthdayTemplate();
  const channel = toMessageChannel(template.channel);
  const audience = `Cumpleaños de hoy ${dateKey}`;
  const existingBatch = await alreadySentToday(channel, audience);

  if (existingBatch) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      message: "El envío de cumpleaños de hoy ya estaba registrado.",
      batch: existingBatch
    });
  }

  const recipients = await resolveAudienceRecipients(admin, channel, audience);
  const allowedRecipients = maxRecipients();

  if (recipients.length === 0) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      message: "No hay personas de cumpleaños hoy con contacto válido para el canal seleccionado.",
      recipients: 0
    });
  }

  if (recipients.length > allowedRecipients) {
    return NextResponse.json(
      {
        error: `Hay ${recipients.length} destinatario(s), pero MESSAGING_MAX_RECIPIENTS permite ${allowedRecipients}.`
      },
      { status: 400 }
    );
  }

  const { data: batch, error: batchError } = await admin
    .from("envios_mensajes")
    .insert({
      canal: channel,
      audiencia: audience,
      asunto: channel === "correo" ? template.title : null,
      cuerpo: template.message_template,
      estado: "pendiente",
      total_destinatarios: recipients.length
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
    const body = renderMessageTemplate(template.message_template, recipient);
    const result = await sendMessage({
      channel,
      recipient,
      subject: template.title,
      body
    }).catch((error: unknown): DeliveryResult => ({
      status: "fallido",
      provider: channel,
      simulated: false,
      error: error instanceof Error ? error.message : "Error desconocido enviando cumpleaños."
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

    if (recipientError) failed += 1;
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
    .select("id,canal,audiencia,estado,proveedor,modo_simulacion,total_destinatarios,total_enviados,total_fallidos,created_at")
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message ?? "No se pudo actualizar el envío." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Cumpleaños procesados.",
    batch: updated,
    summary: {
      recipients: recipients.length,
      sent,
      simulated,
      failed,
      status
    }
  });
}

export async function GET(request: Request) {
  return runBirthdayMessages(request);
}

export async function POST(request: Request) {
  return runBirthdayMessages(request);
}
