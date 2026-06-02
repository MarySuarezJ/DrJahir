"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, FileText, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type IntakeFormState = {
  fullName: string;
  documentNumber: string;
  birthDate: string;
  phone: string;
  whatsapp: string;
  email: string;
  type: "supporter" | "volunteer" | "leader";
  department: string;
  municipality: string;
  commune: string;
  neighborhood: string;
  address: string;
  profession: string;
  company: string;
  jobTitle: string;
  employmentStatus: string;
  votingPlace: string;
  votingTable: string;
  leaderName: string;
  message: string;
};

const initialState: IntakeFormState = {
  fullName: "",
  documentNumber: "",
  birthDate: "",
  phone: "",
  whatsapp: "",
  email: "",
  type: "supporter",
  department: "Caldas",
  municipality: "Manizales",
  commune: "",
  neighborhood: "",
  address: "",
  profession: "",
  company: "",
  jobTitle: "",
  employmentStatus: "",
  votingPlace: "",
  votingTable: "",
  leaderName: "",
  message: ""
};

const municipalities = [
  "Manizales",
  "Aguadas",
  "Anserma",
  "Aranzazu",
  "Belalcázar",
  "Chinchiná",
  "Filadelfia",
  "La Dorada",
  "La Merced",
  "Manzanares",
  "Marmato",
  "Marquetalia",
  "Marulanda",
  "Neira",
  "Norcasia",
  "Pácora",
  "Palestina",
  "Pensilvania",
  "Riosucio",
  "Risaralda",
  "Salamina",
  "Samaná",
  "San José",
  "Supía",
  "Victoria",
  "Villamaría",
  "Viterbo"
];

function fieldLabel(label: string, required = false) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
      {label}{required ? " *" : ""}
    </label>
  );
}

export function PublicIntakeForm() {
  const [form, setForm] = useState<IntakeFormState>(initialState);
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField<K extends keyof IntakeFormState>(field: K, value: IntakeFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    formData.append("sourcePage", window.location.pathname);
    if (resume) formData.append("resume", resume);

    try {
      const response = await fetch("/api/public-intake", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "No se pudo enviar el registro.");
        return;
      }

      setForm(initialState);
      setResume(null);
      setMessage("Registro guardado. Quedó pendiente para revisión administrativa.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-brand-line bg-white/82">
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">Registro público</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-brand-ink">Datos personales y participación</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-ink/68">
              Llena lo básico y agrega los datos que tengas. La hoja de vida es opcional.
            </p>
          </div>
          <Badge variant="gold">Activo</Badge>
        </div>

        <form className="mt-6 space-y-6" onSubmit={(event) => void handleSubmit(event)}>
          <section className="space-y-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-brand-muted">1. Datos básicos</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                {fieldLabel("Nombre completo", true)}
                <Input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} placeholder="Ej. Mariana Suarez" required />
              </div>
              <div className="space-y-2">
                {fieldLabel("Cédula")}
                <Input value={form.documentNumber} onChange={(event) => updateField("documentNumber", event.target.value)} placeholder="Número de documento" />
              </div>
              <div className="space-y-2">
                {fieldLabel("Cumpleaños")}
                <Input value={form.birthDate} onChange={(event) => updateField("birthDate", event.target.value)} type="date" />
              </div>
              <div className="space-y-2">
                {fieldLabel("Tipo de registro")}
                <Select value={form.type} onChange={(event) => updateField("type", event.target.value as IntakeFormState["type"])}>
                  <option value="supporter">Simpatizante</option>
                  <option value="volunteer">Voluntario</option>
                  <option value="leader">Líder</option>
                </Select>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-muted">2. Contacto</p>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                {fieldLabel("Teléfono")}
                <Input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="Teléfono" />
              </div>
              <div className="space-y-2">
                {fieldLabel("WhatsApp")}
                <Input value={form.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} placeholder="WhatsApp" />
              </div>
              <div className="space-y-2">
                {fieldLabel("Correo")}
                <Input value={form.email} onChange={(event) => updateField("email", event.target.value)} placeholder="correo@ejemplo.com" type="email" />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-muted">3. Territorio y votación</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                {fieldLabel("Municipio")}
                <Select value={form.municipality} onChange={(event) => updateField("municipality", event.target.value)}>
                  {municipalities.map((municipality) => (
                    <option key={municipality} value={municipality}>{municipality}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                {fieldLabel("Comuna, zona o corregimiento")}
                <Input value={form.commune} onChange={(event) => updateField("commune", event.target.value)} placeholder="Ej. Comuna 1, Zona rural" />
              </div>
              <div className="space-y-2">
                {fieldLabel("Barrio o vereda")}
                <Input value={form.neighborhood} onChange={(event) => updateField("neighborhood", event.target.value)} placeholder="Ej. Bajo Tablazo" />
              </div>
              <div className="space-y-2">
                {fieldLabel("Dirección")}
                <Input value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Dirección o referencia" />
              </div>
              <div className="space-y-2">
                {fieldLabel("Puesto de votación")}
                <Input value={form.votingPlace} onChange={(event) => updateField("votingPlace", event.target.value)} placeholder="Ej. I.E. Chipre" />
              </div>
              <div className="space-y-2">
                {fieldLabel("Mesa")}
                <Input value={form.votingTable} onChange={(event) => updateField("votingTable", event.target.value)} placeholder="Número de mesa" />
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-muted">4. Laboral y soporte</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                {fieldLabel("Profesión")}
                <Input value={form.profession} onChange={(event) => updateField("profession", event.target.value)} placeholder="Profesión u oficio" />
              </div>
              <div className="space-y-2">
                {fieldLabel("Estado laboral")}
                <Select value={form.employmentStatus} onChange={(event) => updateField("employmentStatus", event.target.value)}>
                  <option value="">Sin especificar</option>
                  <option value="empleado">Empleado</option>
                  <option value="desempleado">Desempleado</option>
                  <option value="independiente">Independiente</option>
                  <option value="estudiante">Estudiante</option>
                  <option value="pensionado">Pensionado</option>
                </Select>
              </div>
              <div className="space-y-2">
                {fieldLabel("Empresa o comunidad")}
                <Input value={form.company} onChange={(event) => updateField("company", event.target.value)} placeholder="Empresa, JAC, asociación..." />
              </div>
              <div className="space-y-2">
                {fieldLabel("Cargo")}
                <Input value={form.jobTitle} onChange={(event) => updateField("jobTitle", event.target.value)} placeholder="Cargo o rol" />
              </div>
            </div>

            <div className="rounded-2xl border border-brand-line bg-brand-cream/70 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-line bg-white text-brand-ink">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-brand-ink">Hoja de vida opcional</p>
                    <p className="text-sm text-brand-ink/60">{resume ? resume.name : "PDF, DOC, DOCX o imagen hasta 12 MB"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {resume && (
                    <button
                      type="button"
                      onClick={() => setResume(null)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      <X className="h-4 w-4" />
                      Quitar
                    </button>
                  )}
                  <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-brand-line bg-white px-4 text-sm font-semibold text-brand-ink transition hover:bg-brand-cream">
                    <Upload className="h-4 w-4" />
                    Seleccionar
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(event) => setResume(event.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-brand-muted">5. Observaciones</p>
            <div className="grid gap-4 md:grid-cols-2">
              <Input value={form.leaderName} onChange={(event) => updateField("leaderName", event.target.value)} placeholder="Líder que lo refiere, si aplica" />
              <Textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} placeholder="¿Cómo desea participar? ¿Qué información importante debemos saber?" />
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-brand-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-brand-ink/62">Se guarda como registro pendiente para revisión administrativa.</p>
            <Button variant="gold" type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Enviar registro"}
            </Button>
          </div>
        </form>

        {message ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-brand-emerald/25 bg-brand-emerald/10 p-4 text-sm text-brand-ink">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-emerald" />
            <span>{message}</span>
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
