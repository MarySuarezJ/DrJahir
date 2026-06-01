"use client";

import { useState } from "react";
import { Plus, Play, Pause, Trash2, X, Send, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { automationTemplates as seedTemplates, automationQueue } from "@/lib/data/automation";
import type { AutomationTemplate } from "@/lib/types/domain";

type Status = "Active" | "Scheduled" | "Draft" | "Paused";

type Template = AutomationTemplate & { id: string; message?: string };

const seed: Template[] = seedTemplates.map((t, i) => ({ ...t, id: `tpl-${i}` }));

const statusVariant: Record<Status, "emerald" | "gold" | "neutral" | "navy"> = {
  Active: "emerald",
  Scheduled: "gold",
  Draft: "neutral",
  Paused: "navy",
};

const emptyForm = (): Omit<Template, "id"> => ({
  name: "",
  channel: "WhatsApp",
  trigger: "",
  audience: "",
  nextRun: "",
  status: "Draft",
  message: "",
});

export function AutomationWorkspace() {
  const [templates, setTemplates] = useState<Template[]>(seed);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sent, setSent] = useState<string[]>([]);

  function handleCreate() {
    if (!form.name.trim()) return;
    setTemplates((prev) => [
      { ...form, id: `tpl-${Date.now()}` },
      ...prev,
    ]);
    setForm(emptyForm());
    setShowForm(false);
  }

  function toggleStatus(id: string) {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id !== id
          ? t
          : { ...t, status: t.status === "Active" ? "Paused" : "Active" }
      )
    );
  }

  function deleteTemplate(id: string) {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  function handleSend(id: string) {
    setSent((prev) => [...prev, id]);
    setTimeout(() => setSent((prev) => prev.filter((s) => s !== id)), 2500);
  }

  return (
    <div className="space-y-6">
      {/* Nueva plantilla */}
      <div>
        {!showForm ? (
          <Button variant="gold" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Crear nueva plantilla
          </Button>
        ) : (
          <Card className="border-brand-gold/25 bg-brand-gold/5">
            <div className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold text-white">Nueva plantilla de automatización</h3>
                <button onClick={() => setShowForm(false)} className="text-white/50 hover:text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nombre de la plantilla" />
                <Select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as Template["channel"] })}>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Email">Correo electrónico</option>
                  <option value="SMS">SMS</option>
                </Select>
                <Input value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} placeholder="Disparador (ej: Cumpleaños, Día del maestro)" />
                <Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} placeholder="Audiencia objetivo" />
                <Input value={form.nextRun} onChange={(e) => setForm({ ...form, nextRun: e.target.value })} placeholder="Próxima ejecución (ej: 08:00 lunes)" />
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })}>
                  <option value="Draft">Borrador</option>
                  <option value="Scheduled">Programado</option>
                  <option value="Active">Activo</option>
                </Select>
              </div>
              <Textarea
                className="mt-4"
                value={form.message ?? ""}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Mensaje de la campaña (usa {nombre} para personalizar)"
              />
              <div className="mt-5 flex gap-3">
                <Button variant="gold" onClick={handleCreate}>Guardar plantilla</Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Lista de plantillas */}
      <div className="grid gap-4 lg:grid-cols-3">
        {templates.map((tpl) => {
          const expanded = expandedId === tpl.id;
          const wasSent = sent.includes(tpl.id);
          return (
            <Card key={tpl.id} className="border-white/20 bg-white/[0.06]">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold text-white">{tpl.name}</p>
                    <p className="mt-0.5 text-sm text-white/65">{tpl.audience}</p>
                  </div>
                  <Badge variant={statusVariant[tpl.status as Status] ?? "neutral"}>{tpl.status}</Badge>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-white/80">
                  <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2">
                    <span>Canal</span><span className="text-white">{tpl.channel}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2">
                    <span>Disparador</span><span className="text-white">{tpl.trigger}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2">
                    <span>Próxima ejecución</span><span className="text-white">{tpl.nextRun}</span>
                  </div>
                </div>

                {tpl.message && (
                  <div className="mt-3">
                    <button
                      className="flex items-center gap-1 text-xs text-white/50 hover:text-white transition"
                      onClick={() => setExpandedId(expanded ? null : tpl.id)}
                    >
                      Ver mensaje {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {expanded && (
                      <p className="mt-2 rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-white/80 leading-6">
                        {tpl.message}
                      </p>
                    )}
                  </div>
                )}

                {wasSent && (
                  <div className="mt-3 rounded-xl border border-brand-emerald/20 bg-brand-emerald/10 px-3 py-2 text-xs text-emerald-300">
                    ✓ Campaña enviada correctamente
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <Button variant="ghost" size="sm" onClick={() => toggleStatus(tpl.id)}>
                    {tpl.status === "Active" ? <><Pause className="h-3.5 w-3.5" /> Pausar</> : <><Play className="h-3.5 w-3.5" /> Activar</>}
                  </Button>
                  <Button variant="emerald" size="sm" onClick={() => handleSend(tpl.id)}>
                    <Send className="h-3.5 w-3.5" />Enviar ahora
                  </Button>
                  <button onClick={() => deleteTemplate(tpl.id)} className="ml-auto text-white/35 hover:text-rose-400 transition">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pipeline */}
      <Card className="border-white/20 bg-white/[0.06]">
        <div className="p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-white/65">Pipeline automatizado</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-white">Flujo de ejecución</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {automationQueue.map((step, i) => (
              <div key={step.step} className="flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/[0.06] p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gold/20 text-sm font-bold text-brand-goldSoft">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-white">{step.step}</p>
                  <p className="mt-1 text-sm text-white/72">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
