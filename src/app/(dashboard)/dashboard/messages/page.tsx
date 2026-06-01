"use client";

import { useState } from "react";
import { MessageSquareMore, Mail, Smartphone, Send, Plus, X, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SentMsg = { id: string; channel: string; recipients: string; subject: string; body: string; sentAt: string };

const seed: SentMsg[] = [
  { id: "m1", channel: "WhatsApp", recipients: "Líderes Manizales",  subject: "Convocatoria reunión", body: "Hola {nombre}, te invitamos a la reunión del martes a las 6pm.", sentAt: "Hace 2 h" },
  { id: "m2", channel: "Correo",   recipients: "Voluntarios Caldas", subject: "Boletín semanal",      body: "Estimado {nombre}, aquí el resumen de actividades de esta semana.", sentAt: "Ayer" },
];

const CHANNELS = [
  { id: "WhatsApp", icon: MessageSquareMore, color: "#22c97d" },
  { id: "Correo",   icon: Mail,              color: "#e8c55a" },
  { id: "SMS",      icon: Smartphone,        color: "#60a5fa" },
];

const AUDIENCES = [
  "Todos los registrados", "Líderes Manizales", "Líderes Caldas",
  "Voluntarios Caldas", "Simpatizantes Manizales", "Coordinadores territoriales",
];

export default function MessagesPage() {
  const [showCompose, setShowCompose] = useState(false);
  const [messages, setMessages] = useState<SentMsg[]>(seed);
  const [channel, setChannel] = useState("WhatsApp");
  const [recipients, setRecipients] = useState(AUDIENCES[0]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [flash, setFlash] = useState("");

  function handleSend() {
    if (!body.trim()) return;
    setMessages((prev) => [{ id: `m-${Date.now()}`, channel, recipients, subject: subject || "(sin asunto)", body, sentAt: "Ahora" }, ...prev]);
    setFlash(`Mensaje enviado a ${recipients} vía ${channel}`);
    setBody(""); setSubject(""); setShowCompose(false);
    setTimeout(() => setFlash(""), 3000);
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
        <Button variant="gold" onClick={() => setShowCompose(true)}>
          <Plus className="h-4 w-4" />Redactar mensaje
        </Button>
      </div>

      {flash && (
        <div className="flex items-center gap-3 rounded-2xl border border-brand-emerald/25 bg-brand-emerald/10 px-5 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />{flash}
        </div>
      )}

      {showCompose && (
        <Card className="border-brand-gold/25 bg-brand-gold/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-semibold text-white">Nuevo mensaje</h3>
              <button onClick={() => setShowCompose(false)} className="text-white/50 hover:text-white transition"><X className="h-5 w-5" /></button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-white/55">Canal de envío</p>
              <div className="flex gap-3 flex-wrap">
                {CHANNELS.map(({ id, icon: Icon, color }) => (
                  <button key={id} onClick={() => setChannel(id)}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${channel === id ? "border-white/30 bg-white/15 text-white" : "border-white/15 bg-white/[0.04] text-white/65 hover:bg-white/10"}`}>
                    <Icon className="h-4 w-4" style={{ color: channel === id ? color : undefined }} />{id}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-white/55">Destinatarios</p>
                <Select value={recipients} onChange={(e) => setRecipients(e.target.value)}>
                  {AUDIENCES.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </Select>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-widest text-white/55">Asunto</p>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Asunto del mensaje" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-widest text-white/55">Mensaje</p>
                <span className="text-xs text-white/40">Usa {"{nombre}"} para personalizar</span>
              </div>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Hola {nombre}, te escribimos desde el equipo de Jahir Álvarez..." className="min-h-[120px]" />
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
              <p className="text-sm text-white/55">{body.length} caracteres · <span className="text-white/80">{recipients}</span></p>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowCompose(false)}>Cancelar</Button>
                <Button variant="gold" onClick={handleSend} disabled={!body.trim()}><Send className="h-4 w-4" />Enviar ahora</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {CHANNELS.map(({ id, icon: Icon, color }) => {
          const count = messages.filter((m) => m.channel === id).length;
          return (
            <Card key={id} className="border-white/20 bg-white/[0.06]">
              <CardContent className="flex items-center gap-4 py-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.08]" style={{ color }}>
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-display text-xl font-semibold text-white">{id}</p>
                  <p className="text-sm text-white/65">{count} mensaje{count !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => { setChannel(id); setShowCompose(true); }}
                  className="ml-auto rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/15 hover:text-white transition">
                  Redactar
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-white/20 bg-white/[0.06]">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.28em] text-white/65">Historial</p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-white">{messages.length} enviado{messages.length !== 1 ? "s" : ""}</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-2xl border border-white/15 bg-white/[0.04] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={m.channel === "WhatsApp" ? "emerald" : m.channel === "Correo" ? "gold" : "navy"}>{m.channel}</Badge>
                    <span className="text-sm font-semibold text-white">{m.subject}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-white/65 line-clamp-2">{m.body}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-white/45">{m.sentAt}</p>
                  <p className="mt-0.5 text-xs text-white/55">{m.recipients}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
