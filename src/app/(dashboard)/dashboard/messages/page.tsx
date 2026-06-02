"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Mail, MessageSquareMore, Plus, Send, Smartphone, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { hasSupabaseBrowserConfig } from "@/lib/supabase/client";
import type { MessageChannel, MessageStatus } from "@/lib/messaging/types";

type SentMsg = {
  id: string;
  channel: MessageChannel;
  audience: string;
  subject: string;
  body: string;
  status: MessageStatus;
  provider: string;
  simulated: boolean;
  totalRecipients: number;
  totalSent: number;
  totalFailed: number;
  sentAt: string;
};

const CHANNELS: Array<{ id: MessageChannel; label: string; icon: typeof MessageSquareMore; color: string }> = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquareMore, color: "#22c97d" },
  { id: "correo", label: "Correo", icon: Mail, color: "#e8c55a" },
  { id: "sms", label: "SMS", icon: Smartphone, color: "#60a5fa" }
];

const AUDIENCES = [
  "Todos los registrados",
  "Cumpleaños de hoy",
  "Líderes Manizales",
  "Líderes Caldas",
  "Voluntarios Caldas",
  "Simpatizantes Manizales",
  "Coordinadores territoriales"
];

const statusLabel: Record<MessageStatus, string> = {
  pendiente: "Pendiente",
  enviado: "Enviado",
  fallido: "Fallido",
  parcial: "Parcial",
  simulado: "Simulado"
};

const statusVariant: Record<MessageStatus, "emerald" | "gold" | "neutral" | "danger" | "navy"> = {
  pendiente: "neutral",
  enviado: "emerald",
  fallido: "danger",
  parcial: "gold",
  simulado: "navy"
};

function channelLabel(channel: MessageChannel) {
  return CHANNELS.find((item) => item.id === channel)?.label ?? channel;
}

function channelVariant(channel: MessageChannel) {
  if (channel === "whatsapp") return "emerald";
  if (channel === "correo") return "gold";
  return "navy";
}

export default function MessagesPage() {
  const [showCompose, setShowCompose] = useState(false);
  const [messages, setMessages] = useState<SentMsg[]>([]);
  const [channel, setChannel] = useState<MessageChannel>("whatsapp");
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [flash, setFlash] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const supabaseReady = hasSupabaseBrowserConfig();

  const counts = useMemo(() => {
    return CHANNELS.reduce<Record<MessageChannel, number>>(
      (acc, item) => ({ ...acc, [item.id]: messages.filter((message) => message.channel === item.id).length }),
      { whatsapp: 0, correo: 0, sms: 0 }
    );
  }, [messages]);

  useEffect(() => {
    async function loadMessages() {
      if (!supabaseReady) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/messages");
        const data = (await response.json()) as { messages?: SentMsg[]; error?: string };

        if (!response.ok || !Array.isArray(data.messages)) {
          setFlash({ type: "error", message: data.error ?? "No se pudo cargar el historial de mensajes." });
          return;
        }

        setMessages(data.messages);
      } finally {
        setLoading(false);
      }
    }

    void loadMessages();
  }, [supabaseReady]);

  async function handleSend() {
    if (!body.trim() || sending) return;
    setSending(true);
    setFlash(null);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          audience,
          subject,
          body
        })
      });
      const data = (await response.json()) as { message?: SentMsg; error?: string; summary?: { status: MessageStatus; recipients: number; sent: number; simulated: number; failed: number } };

      if (!response.ok || !data.message) {
        setFlash({ type: "error", message: data.error ?? "No se pudo enviar el mensaje." });
        return;
      }

      setMessages((prev) => [data.message as SentMsg, ...prev]);
      setBody("");
      setSubject("");
      setShowCompose(false);

      const summary = data.summary;
      const mode = data.message.simulated ? "simulado y registrado" : "enviado";
      setFlash({
        type: summary?.failed ? "error" : "success",
        message: `${summary?.recipients ?? data.message.totalRecipients} destinatario(s): ${mode}. Fallidos: ${summary?.failed ?? data.message.totalFailed}.`
      });
    } catch (error) {
      setFlash({ type: "error", message: error instanceof Error ? error.message : "Error enviando el mensaje." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge variant="gold">Mensajería masiva</Badge>
          <h2 className="mt-3 font-display text-4xl font-semibold text-white">WhatsApp, Correo y SMS</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75 sm:text-base">
            Redacta y envía mensajes segmentados a tu red de simpatizantes, voluntarios y líderes.
          </p>
        </div>
        <Button variant="gold" onClick={() => setShowCompose(true)} disabled={!supabaseReady}>
          <Plus className="h-4 w-4" />Redactar mensaje
        </Button>
      </div>

      {!supabaseReady && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          Configura Supabase y las tablas de mensajería antes de enviar. El módulo ya no marca mensajes como enviados si no hay backend real.
        </div>
      )}

      {flash && (
        <div className={`flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm ${flash.type === "success" ? "border-brand-emerald/25 bg-brand-emerald/10 text-emerald-300" : "border-rose-300/35 bg-rose-500/10 text-rose-200"}`}>
          {flash.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {flash.message}
        </div>
      )}

      {showCompose && (
        <Card className="border-brand-gold/25 bg-brand-gold/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold text-white">Nuevo mensaje</h3>
              <button onClick={() => setShowCompose(false)} className="text-white/50 transition hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-white/55">Canal de envío</p>
              <div className="flex flex-wrap gap-3">
                {CHANNELS.map(({ id, label, icon: Icon, color }) => (
                  <button
                    key={id}
                    onClick={() => setChannel(id)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${channel === id ? "border-white/30 bg-white/15 text-white" : "border-white/15 bg-white/[0.04] text-white/65 hover:bg-white/10"}`}
                  >
                    <Icon className="h-4 w-4" style={{ color: channel === id ? color : undefined }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-white/55">Destinatarios</p>
                <Select value={audience} onChange={(event) => setAudience(event.target.value)}>
                  {AUDIENCES.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-white/55">Asunto</p>
                <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Asunto del mensaje" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-white/55">Mensaje</p>
                <span className="text-xs text-white/40">Variables: {"{nombre}"}, {"{municipio}"}, {"{profesion}"}</span>
              </div>
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Hola {nombre}, te escribimos desde el equipo del Dr. Jahir..."
                className="min-h-[120px]"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <p className="text-sm text-white/55">{body.length} caracteres · <span className="text-white/80">{audience}</span></p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowCompose(false)}>Cancelar</Button>
                <Button variant="gold" onClick={() => void handleSend()} disabled={!body.trim() || sending}>
                  <Send className="h-4 w-4" />
                  {sending ? "Enviando..." : "Enviar ahora"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {CHANNELS.map(({ id, label, icon: Icon, color }) => (
          <Card key={id} className="border-white/20 bg-white/[0.06]">
            <CardContent className="flex items-center gap-4 py-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.08]" style={{ color }}>
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-xl font-semibold text-white">{label}</p>
                <p className="text-sm text-white/65">{counts[id]} envío{counts[id] !== 1 ? "s" : ""}</p>
              </div>
              <button
                onClick={() => { setChannel(id); setShowCompose(true); }}
                disabled={!supabaseReady}
                className="ml-auto rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/15 hover:text-white disabled:pointer-events-none disabled:opacity-40"
              >
                Redactar
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-white/20 bg-white/[0.06]">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.28em] text-white/65">Historial</p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-white">{messages.length} envío{messages.length !== 1 ? "s" : ""}</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-white/55">Cargando historial...</p>}
          {!loading && messages.length === 0 && (
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 text-sm text-white/65">
              Aún no hay envíos registrados.
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={channelVariant(message.channel)}>{channelLabel(message.channel)}</Badge>
                    <Badge variant={statusVariant[message.status]}>{statusLabel[message.status]}</Badge>
                    <span className="text-sm font-semibold text-white">{message.subject}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-white/65">{message.body}</p>
                  <p className="mt-2 text-xs text-white/45">
                    Destinatarios: {message.totalRecipients} · Enviados reales: {message.totalSent} · Fallidos: {message.totalFailed}
                    {message.simulated ? " · Modo simulación" : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-white/45">{message.sentAt}</p>
                  <p className="mt-0.5 text-xs text-white/55">{message.audience}</p>
                  {message.provider && <p className="mt-0.5 text-xs text-white/35">{message.provider}</p>}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
