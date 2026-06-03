"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, FileText, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EmploymentStatus, PersonRecord } from "@/lib/types/domain";
import { hasSupabaseBrowserConfig } from "@/lib/supabase/client";
import { peopleSeed } from "@/lib/data/people";

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
  leaderDocumentNumber: string;
  leaderName: string;
  message: string;
};

type PublicIntakeFormProps = {
  mode?: "public" | "direct";
  documentNumber?: string;
  submitLabel?: string;
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
  leaderDocumentNumber: "",
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

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] ?? "", lastName: "." };

  const splitAt = Math.max(1, Math.ceil(parts.length / 2));
  return {
    firstName: parts.slice(0, splitAt).join(" "),
    lastName: parts.slice(splitAt).join(" ") || "."
  };
}

function supportLabelFromType(type: IntakeFormState["type"]) {
  if (type === "leader") return "Líder";
  if (type === "volunteer") return "Voluntario";
  return "Simpatizante";
}

function typeFromSupportLabel(label: string): IntakeFormState["type"] {
  const clean = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (clean.includes("lider")) return "leader";
  if (clean.includes("volunt")) return "volunteer";
  return "supporter";
}

function supportScoreFromType(type: IntakeFormState["type"]) {
  if (type === "leader") return 90;
  if (type === "volunteer") return 80;
  return 70;
}

function normalizeEmploymentStatus(value: string): EmploymentStatus {
  if (value === "desempleado" || value === "independiente" || value === "estudiante" || value === "pensionado") {
    return value;
  }

  return "empleado";
}

function fullName(person: PersonRecord) {
  return `${person.firstName} ${person.lastName}`.trim();
}

function isLeader(person: PersonRecord) {
  return person.supportLabel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("lider");
}

export function PublicIntakeForm({ mode = "public", documentNumber, submitLabel }: PublicIntakeFormProps) {
  const isDirectMode = mode === "direct";
  const [form, setForm] = useState<IntakeFormState>(initialState);
  const [leaders, setLeaders] = useState<PersonRecord[]>([]);
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isDirectMode) return;

    function applyPeople(records: PersonRecord[]) {
      const nextLeaders = records.filter(isLeader);
      setLeaders(nextLeaders);

      const selected = documentNumber
        ? records.find((person) => person.documentNumber === documentNumber)
        : undefined;

      if (selected) {
        setForm({
          fullName: fullName(selected),
          documentNumber: selected.documentNumber,
          birthDate: selected.birthDate ?? "",
          phone: selected.phone,
          whatsapp: selected.whatsapp,
          email: selected.email,
          type: typeFromSupportLabel(selected.supportLabel),
          department: selected.department || "Caldas",
          municipality: selected.municipality || "Manizales",
          commune: selected.comuna,
          neighborhood: selected.barrio,
          address: selected.address,
          profession: selected.profession,
          company: selected.company,
          jobTitle: selected.jobTitle,
          employmentStatus: selected.employmentStatus,
          votingPlace: selected.votingPlace,
          votingTable: selected.votingTable,
          leaderDocumentNumber: selected.leaderDocumentNumber ?? "",
          leaderName: selected.leaderName,
          message: selected.notes
        });
      }
    }

    if (!hasSupabaseBrowserConfig()) {
      applyPeople(peopleSeed);
      return;
    }

    void (async () => {
      try {
        const response = await fetch("/api/people");
        const data = (await response.json()) as { people?: PersonRecord[] };
        if (response.ok && Array.isArray(data.people)) {
          applyPeople(data.people);
          return;
        }

        applyPeople(peopleSeed);
      } catch {
        applyPeople(peopleSeed);
      }
    })();
  }, [documentNumber, isDirectMode]);

  function updateField<K extends keyof IntakeFormState>(field: K, value: IntakeFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateLeader(documentNumber: string) {
    const leader = leaders.find((item) => item.documentNumber === documentNumber);
    setForm((current) => ({
      ...current,
      leaderDocumentNumber: documentNumber,
      leaderName: leader ? fullName(leader) : ""
    }));
  }

  async function uploadResumeForPerson() {
    if (!resume) return "";

    const formData = new FormData();
    formData.append("file", resume);
    formData.append("kind", "resume");
    formData.append("documentNumber", form.documentNumber);

    const response = await fetch("/api/files/upload", {
      method: "POST",
      body: formData
    });
    const data = (await response.json()) as { storageRef?: string; error?: string };

    if (!response.ok || !data.storageRef) {
      throw new Error(data.error ?? "No se pudo subir la hoja de vida.");
    }

    return data.storageRef;
  }

  async function saveDirectPerson() {
    if (!form.documentNumber.trim()) {
      throw new Error("Para guardar directo en personas debes escribir la cédula.");
    }

    const { firstName, lastName } = splitFullName(form.fullName);
    const resumePath = await uploadResumeForPerson();
    const supportLabel = supportLabelFromType(form.type);
    const selectedLeader = leaders.find((leader) => leader.documentNumber === form.leaderDocumentNumber);
    const leaderName = selectedLeader ? fullName(selectedLeader) : form.leaderName.trim();
    const leaderDocumentNumber = form.type === "leader" ? "" : form.leaderDocumentNumber;
    const leaderNote = leaderName ? `Líder asignado: ${leaderName}.` : "";
    const personPayload: PersonRecord = {
      id: "",
      firstName,
      lastName,
      documentNumber: form.documentNumber.trim(),
      birthDate: form.birthDate,
      phone: form.phone,
      whatsapp: form.whatsapp,
      email: form.email,
      address: form.address,
      barrio: form.neighborhood,
      comuna: form.commune,
      municipality: form.municipality,
      department: form.department,
      profession: form.profession,
      company: form.company,
      jobTitle: form.jobTitle,
      employmentStatus: normalizeEmploymentStatus(form.employmentStatus),
      votingPlace: form.votingPlace,
      votingTable: form.votingTable,
      leaderName,
      leaderDocumentNumber,
      leaderSector: form.type === "leader" ? form.neighborhood || form.commune || form.municipality : "",
      notes: [leaderNote, form.message].filter(Boolean).join("\n"),
      photoPath: "",
      resumePath,
      supportLabel,
      supportScore: supportScoreFromType(form.type),
      tags: ["captacion", isDirectMode ? "carga-interna" : "registro-publico"],
      visibilityScope: "operational"
    };

    const response = await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(personPayload)
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      throw new Error(data.error ?? "No se pudo guardar la persona.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      if (isDirectMode) {
        await saveDirectPerson();
      } else {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => formData.append(key, value));
        formData.append("sourcePage", window.location.pathname);
        if (resume) formData.append("resume", resume);

        const response = await fetch("/api/public-intake", {
          method: "POST",
          body: formData
        });
        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "No se pudo enviar el registro.");
        }
      }

      if (!documentNumber) {
        setForm(initialState);
      }
      setResume(null);
      setMessage(isDirectMode ? "Persona guardada directamente en el CRM." : "Registro guardado. Quedó pendiente para revisión administrativa.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo guardar el registro.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="border-brand-emerald/24 bg-white/88">
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">{isDirectMode ? "Registro CRM" : "Registro público"}</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-brand-ink">Datos personales y participación</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-brand-ink/68">
              {isDirectMode
                ? "Este formulario guarda la persona directamente en el CRM. La hoja de vida es opcional."
                : "Llena lo básico y agrega los datos que tengas. La hoja de vida es opcional."}
            </p>
          </div>
          <Badge variant={isDirectMode ? "emerald" : "gold"}>{isDirectMode ? "Carga directa" : "Activo"}</Badge>
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
                {fieldLabel("Cédula", isDirectMode)}
                <Input value={form.documentNumber} onChange={(event) => updateField("documentNumber", event.target.value)} placeholder="Número de documento" required={isDirectMode} />
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

            <div className="rounded-2xl border border-brand-emerald/20 bg-brand-beige/70 p-4">
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
                  <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-brand-emerald/24 bg-white px-4 text-sm font-semibold text-brand-ink transition hover:bg-brand-beige">
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
              {isDirectMode && form.type !== "leader" ? (
                <Select value={form.leaderDocumentNumber} onChange={(event) => updateLeader(event.target.value)}>
                  <option value="">{leaders.length > 0 ? "Sin líder asignado" : "No hay líderes creados todavía"}</option>
                  {leaders.map((leader) => (
                    <option key={leader.documentNumber} value={leader.documentNumber}>
                      {fullName(leader)} · {leader.leaderSector || leader.barrio || leader.municipality}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input value={form.leaderName} onChange={(event) => updateField("leaderName", event.target.value)} placeholder="Líder que lo refiere, si aplica" />
              )}
              <Textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} placeholder="¿Cómo desea participar? ¿Qué información importante debemos saber?" />
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-brand-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-brand-ink/62">
              {isDirectMode ? "Se guarda directo en Personas, con hoja de vida opcional." : "Se guarda como registro pendiente para revisión administrativa."}
            </p>
            <Button variant="gold" type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : submitLabel ?? (isDirectMode ? "Guardar persona" : "Enviar registro")}
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
