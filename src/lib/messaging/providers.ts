import type { MessageChannel, MessageRecipient, DeliveryResult } from "@/lib/messaging/types";

type SendInput = {
  channel: MessageChannel;
  recipient: MessageRecipient;
  subject?: string;
  body: string;
};

function isDryRun() {
  return process.env.MESSAGING_DRY_RUN !== "false";
}

function makeSimulatedResult(channel: MessageChannel): DeliveryResult {
  return {
    status: "simulado",
    provider: `${channel}:simulacion`,
    providerMessageId: `sim-${Date.now()}`,
    simulated: true
  };
}

function toBase64(value: string) {
  if (typeof btoa === "function") return btoa(value);
  return Buffer.from(value).toString("base64");
}

function normalizePhone(value: string) {
  const clean = value.replace(/[^\d+]/g, "");
  if (!clean) return "";
  if (clean.startsWith("+")) return clean;
  if (/^57\d{10}$/.test(clean)) return `+${clean}`;
  if (/^3\d{9}$/.test(clean)) return `+57${clean}`;
  return `+${clean}`;
}

function contactForChannel(channel: MessageChannel, recipient: MessageRecipient) {
  if (channel === "correo") return recipient.email.trim();
  if (channel === "whatsapp") return normalizePhone(recipient.whatsapp || recipient.phone);
  return normalizePhone(recipient.phone || recipient.whatsapp);
}

async function sendEmail({ recipient, subject, body }: SendInput): Promise<DeliveryResult> {
  if (isDryRun()) return makeSimulatedResult("correo");

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = contactForChannel("correo", recipient);

  if (!apiKey || !from) {
    return {
      status: "fallido",
      provider: "resend",
      simulated: false,
      error: "Faltan RESEND_API_KEY y/o EMAIL_FROM."
    };
  }

  if (!to) {
    return {
      status: "fallido",
      provider: "resend",
      simulated: false,
      error: "El destinatario no tiene correo."
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject: subject?.trim() || "Mensaje del equipo Dr. Jahir",
      text: body
    })
  });

  const data = (await response.json().catch(() => ({}))) as { id?: string; message?: string; error?: string };

  if (!response.ok) {
    return {
      status: "fallido",
      provider: "resend",
      simulated: false,
      error: data.message ?? data.error ?? `Resend HTTP ${response.status}`
    };
  }

  return {
    status: "enviado",
    provider: "resend",
    providerMessageId: data.id,
    simulated: false
  };
}

async function sendTwilio({ channel, recipient, body }: SendInput): Promise<DeliveryResult> {
  if (isDryRun()) return makeSimulatedResult(channel);

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = channel === "whatsapp"
    ? process.env.TWILIO_WHATSAPP_MESSAGING_SERVICE_SID
    : process.env.TWILIO_MESSAGING_SERVICE_SID;
  const from = channel === "whatsapp"
    ? process.env.TWILIO_WHATSAPP_FROM
    : process.env.TWILIO_SMS_FROM;
  const to = contactForChannel(channel, recipient);

  if (!accountSid || !authToken || (!messagingServiceSid && !from)) {
    return {
      status: "fallido",
      provider: "twilio",
      simulated: false,
      error: channel === "whatsapp"
        ? "Faltan TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_WHATSAPP_FROM o TWILIO_WHATSAPP_MESSAGING_SERVICE_SID."
        : "Faltan TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_SMS_FROM o TWILIO_MESSAGING_SERVICE_SID."
    };
  }

  if (!to) {
    return {
      status: "fallido",
      provider: "twilio",
      simulated: false,
      error: "El destinatario no tiene teléfono."
    };
  }

  const params = new URLSearchParams();
  params.set("To", channel === "whatsapp" ? `whatsapp:${to}` : to);
  params.set("Body", body);

  if (messagingServiceSid) {
    params.set("MessagingServiceSid", messagingServiceSid);
  } else if (from) {
    params.set("From", channel === "whatsapp" ? `whatsapp:${normalizePhone(from)}` : normalizePhone(from));
  }

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${toBase64(`${accountSid}:${authToken}`)}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  const data = (await response.json().catch(() => ({}))) as { sid?: string; message?: string; error_message?: string };

  if (!response.ok) {
    return {
      status: "fallido",
      provider: "twilio",
      simulated: false,
      error: data.message ?? data.error_message ?? `Twilio HTTP ${response.status}`
    };
  }

  return {
    status: "enviado",
    provider: "twilio",
    providerMessageId: data.sid,
    simulated: false
  };
}

export async function sendMessage(input: SendInput): Promise<DeliveryResult> {
  if (input.channel === "correo") return sendEmail(input);
  return sendTwilio(input);
}

export function getRecipientContact(channel: MessageChannel, recipient: MessageRecipient) {
  return contactForChannel(channel, recipient);
}
