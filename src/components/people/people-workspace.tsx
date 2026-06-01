"use client";

import { useMemo, useRef, useState } from "react";
import { PencilLine, Plus, Trash2, FileText, Eye, X, Upload, ImageIcon, Download } from "lucide-react";
import { peopleSeed } from "@/lib/data/people";
import type { EmploymentStatus, PersonRecord } from "@/lib/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/ui/stat-card";
import { UsersRound, BriefcaseBusiness, BadgeCheck, UserX } from "lucide-react";

/* ── Visor de hoja de vida / foto ─────────────────────────────────── */
function ResumeViewer({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const isImage = url.match(/\.(jpg|jpeg|png|webp|gif)$/i) || url.includes("image/");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-white/20 bg-[#0e1e38] shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/15 px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-brand-goldSoft" />
            <div>
              <p className="text-xs uppercase tracking-widest text-white/55">Hoja de vida</p>
              <p className="font-semibold text-white">{name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={url} download target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/15 hover:text-white transition">
              <Download className="h-3.5 w-3.5" />Descargar
            </a>
            <a href={url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/15 hover:text-white transition">
              <Eye className="h-3.5 w-3.5" />Abrir en nueva pestaña
            </a>
            <button onClick={onClose} className="rounded-xl border border-white/20 bg-white/[0.06] p-2 text-white/60 hover:bg-white/15 hover:text-white transition">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-hidden">
          {isImage ? (
            <div className="flex h-full items-center justify-center overflow-auto p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={name} className="max-h-full max-w-full rounded-xl object-contain shadow-xl" />
            </div>
          ) : (
            <iframe
              src={url}
              title={name}
              className="h-full w-full border-0"
              style={{ background: "#fff" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const blankPerson = (): PersonRecord => ({
  id: "",
  firstName: "",
  lastName: "",
  documentNumber: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  barrio: "",
  comuna: "",
  municipality: "Manizales",
  department: "Caldas",
  profession: "",
  company: "",
  jobTitle: "",
  employmentStatus: "empleado",
  votingPlace: "",
  votingTable: "",
  leaderName: "",
  notes: "",
  photoPath: "",
  resumePath: "",
  supportLabel: "Simpatizante",
  supportScore: 70,
  tags: [],
  visibilityScope: "operational"
});

const employmentLabels: Record<EmploymentStatus, string> = {
  empleado: "Empleado",
  desempleado: "Desempleado",
  independiente: "Independiente",
  estudiante: "Estudiante",
  pensionado: "Pensionado"
};

export function PeopleWorkspace() {
  const [people, setPeople] = useState<PersonRecord[]>(peopleSeed);
  const [selectedId, setSelectedId] = useState(peopleSeed[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [municipalityFilter, setMunicipalityFilter] = useState("all");
  const [employmentFilter, setEmploymentFilter] = useState("all");
  const [draft, setDraft] = useState<PersonRecord>(peopleSeed[0] ?? blankPerson());
  const [mode, setMode] = useState<"view" | "create">("view");
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerName, setViewerName] = useState("");
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  function handleResumeUpload(file: File) {
    const url = URL.createObjectURL(file);
    updateField("resumePath", url);
  }

  function handlePhotoUpload(file: File) {
    const url = URL.createObjectURL(file);
    updateField("photoPath", url);
  }

  function openViewer(url: string, name: string) {
    setViewerUrl(url);
    setViewerName(name);
  }

  const selectedPerson = useMemo(() => people.find((item) => item.id === selectedId) ?? people[0], [people, selectedId]);

  const filteredPeople = useMemo(
    () =>
      people.filter((person) => {
        const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
        const matchesSearch =
          fullName.includes(search.toLowerCase()) ||
          person.documentNumber.includes(search) ||
          person.leaderName.toLowerCase().includes(search.toLowerCase());
        const matchesMunicipality = municipalityFilter === "all" || person.municipality === municipalityFilter;
        const matchesEmployment = employmentFilter === "all" || person.employmentStatus === employmentFilter;

        return matchesSearch && matchesMunicipality && matchesEmployment;
      }),
    [employmentFilter, municipalityFilter, people, search]
  );

  const municipalities = useMemo(() => Array.from(new Set(people.map((person) => person.municipality))), [people]);

  const stats = useMemo(
    () => ({
      total: people.length,
      leaders: people.filter((person) => person.supportLabel === "Líder").length,
      employed: people.filter((person) => person.employmentStatus === "empleado").length,
      unemployed: people.filter((person) => person.employmentStatus === "desempleado").length
    }),
    [people]
  );

  function syncDraft(nextPerson: PersonRecord) {
    setDraft(nextPerson);
  }

  function openSelected(person: PersonRecord) {
    setSelectedId(person.id);
    setMode("view");
    syncDraft(person);
  }

  function createNew() {
    setMode("create");
    const nextDraft = blankPerson();
    nextDraft.municipality = municipalityFilter === "all" ? "Manizales" : municipalityFilter;
    syncDraft(nextDraft);
    setSelectedId("");
  }

  function updateField<K extends keyof PersonRecord>(field: K, value: PersonRecord[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    const nextPerson: PersonRecord = {
      ...draft,
      id: mode === "create" ? `person-${globalThis.crypto.randomUUID()}` : draft.id,
      tags: typeof draft.tags[0] === "string" ? draft.tags : draft.tags.filter(Boolean),
      supportScore: Number.isFinite(draft.supportScore) ? draft.supportScore : 70
    };

    if (mode === "create") {
      setPeople((current) => [nextPerson, ...current]);
      setSelectedId(nextPerson.id);
      setMode("view");
      setDraft(nextPerson);
      return;
    }

    setPeople((current) => current.map((person) => (person.id === nextPerson.id ? nextPerson : person)));
    setSelectedId(nextPerson.id);
    setDraft(nextPerson);
  }

  function handleDelete() {
    if (!selectedId) {
      return;
    }

    const nextPeople = people.filter((person) => person.id !== selectedId);
    setPeople(nextPeople);
    const nextSelected = nextPeople[0];

    if (nextSelected) {
      setSelectedId(nextSelected.id);
      setDraft(nextSelected);
    } else {
      setSelectedId("");
      setDraft(blankPerson());
      setMode("create");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Total personas" value={String(stats.total)} hint="Base registrada" delta="+12 esta semana" icon={<UsersRound className="h-5 w-5" />} tone="gold" />
        <StatCard label="Líderes" value={String(stats.leaders)} hint="Estructura activa" delta="Segmentos clave" icon={<BadgeCheck className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Empleados" value={String(stats.employed)} hint="Campo laboral" delta="Oportunidad de contacto" icon={<BriefcaseBusiness className="h-5 w-5" />} tone="navy" />
        <StatCard label="Desempleados" value={String(stats.unemployed)} hint="Base prioritaria" delta="Atención social" icon={<UserX className="h-5 w-5" />} tone="neutral" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <Card className="border-white/20 bg-white/[0.04]">
          <div className="border-b border-white/20 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/65">Gestión de personas</p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-white">CRUD local preparado para Supabase</h2>
              </div>
              <Button variant="gold" onClick={createNew}>
                <Plus className="h-4 w-4" />
                Nuevo registro
              </Button>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-3">
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, cédula o líder" />
              <Select value={municipalityFilter} onChange={(event) => setMunicipalityFilter(event.target.value)}>
                <option value="all">Todos los municipios</option>
                {municipalities.map((municipality) => (
                  <option key={municipality} value={municipality}>
                    {municipality}
                  </option>
                ))}
              </Select>
              <Select value={employmentFilter} onChange={(event) => setEmploymentFilter(event.target.value)}>
                <option value="all">Todos los estados laborales</option>
                {Object.entries(employmentLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="overflow-hidden rounded-b-[28px]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <tr>
                    <TableHead>Persona</TableHead>
                    <TableHead>Territorio</TableHead>
                    <TableHead>Líder</TableHead>
                    <TableHead>Laboral</TableHead>
                    <TableHead>Apoyo</TableHead>
                    <TableHead>HV</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {filteredPeople.map((person) => {
                    const active = selectedId === person.id;
                    return (
                      <TableRow key={person.id} onClick={() => openSelected(person)} className={active ? "bg-brand-gold/10" : "cursor-pointer"}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {person.photoPath && (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={person.photoPath}
                                alt=""
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                className="h-8 w-8 shrink-0 rounded-lg object-cover border border-white/15"
                              />
                            )}
                            <div>
                              <p className="font-semibold text-white">{person.firstName} {person.lastName}</p>
                              <p className="text-xs text-white/65">CC {person.documentNumber}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white">{person.municipality}</p>
                            <p className="text-xs text-white/65">{person.barrio} · {person.comuna}</p>
                          </div>
                        </TableCell>
                        <TableCell>{person.leaderName}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-white">{employmentLabels[person.employmentStatus]}</p>
                            <p className="text-xs text-white/65">{person.profession}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Badge variant={person.supportLabel === "Líder" ? "gold" : person.supportLabel === "Voluntario" ? "emerald" : "neutral"}>{person.supportLabel}</Badge>
                            <span className="text-xs text-white/65">{person.supportScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {person.resumePath ? (
                            <button
                              onClick={() => openViewer(person.resumePath, `${person.firstName} ${person.lastName}`)}
                              className="flex items-center gap-1 rounded-lg border border-brand-gold/25 bg-brand-gold/10 px-2.5 py-1.5 text-xs font-semibold text-brand-goldSoft hover:bg-brand-gold/20 transition"
                            >
                              <FileText className="h-3.5 w-3.5" />Ver
                            </button>
                          ) : (
                            <span className="text-xs text-white/30">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </Card>

        <Card className="border-white/20 bg-white/[0.04]">
          <div className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/65">Detalle y edición</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-white">{mode === "create" ? "Nuevo registro" : `${selectedPerson?.firstName ?? draft.firstName} ${selectedPerson?.lastName ?? draft.lastName}`}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => selectedPerson && openSelected(selectedPerson)}>
                  <PencilLine className="h-4 w-4" />
                  Cargar seleccionado
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input value={draft.firstName} onChange={(event) => updateField("firstName", event.target.value)} placeholder="Nombres" />
                <Input value={draft.lastName} onChange={(event) => updateField("lastName", event.target.value)} placeholder="Apellidos" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input value={draft.documentNumber} onChange={(event) => updateField("documentNumber", event.target.value)} placeholder="Cédula" />
                <Input value={draft.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="Teléfono" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input value={draft.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} placeholder="WhatsApp" />
                <Input value={draft.email} onChange={(event) => updateField("email", event.target.value)} placeholder="Correo" type="email" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input value={draft.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Dirección" />
                <Input value={draft.barrio} onChange={(event) => updateField("barrio", event.target.value)} placeholder="Barrio" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input value={draft.comuna} onChange={(event) => updateField("comuna", event.target.value)} placeholder="Comuna" />
                <Input value={draft.municipality} onChange={(event) => updateField("municipality", event.target.value)} placeholder="Municipio" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input value={draft.department} onChange={(event) => updateField("department", event.target.value)} placeholder="Departamento" />
                <Input value={draft.profession} onChange={(event) => updateField("profession", event.target.value)} placeholder="Profesión" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input value={draft.company} onChange={(event) => updateField("company", event.target.value)} placeholder="Empresa" />
                <Input value={draft.jobTitle} onChange={(event) => updateField("jobTitle", event.target.value)} placeholder="Cargo" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Select value={draft.employmentStatus} onChange={(event) => updateField("employmentStatus", event.target.value as EmploymentStatus)}>
                  {Object.entries(employmentLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Input value={draft.votingPlace} onChange={(event) => updateField("votingPlace", event.target.value)} placeholder="Lugar de votación" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input value={draft.votingTable} onChange={(event) => updateField("votingTable", event.target.value)} placeholder="Mesa" />
                <Input value={draft.leaderName} onChange={(event) => updateField("leaderName", event.target.value)} placeholder="Líder asociado" />
              </div>
              {/* Foto de perfil */}
              <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4 space-y-3">
                <p className="text-xs uppercase tracking-widest text-white/55">Foto de perfil</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {draft.photoPath ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={draft.photoPath}
                        alt="Foto"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        className="h-16 w-16 rounded-xl object-cover border border-white/20"
                      />
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openViewer(draft.photoPath, `Foto — ${draft.firstName} ${draft.lastName}`)}>
                          <Eye className="h-3.5 w-3.5" />Ver
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => photoInputRef.current?.click()}>
                          <Upload className="h-3.5 w-3.5" />Cambiar
                        </Button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-xl border border-dashed border-white/25 bg-white/[0.04] px-4 py-3 text-sm text-white/60 hover:border-white/40 hover:text-white transition"
                    >
                      <ImageIcon className="h-4 w-4" />Subir foto de perfil
                    </button>
                  )}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }}
                  />
                </div>
              </div>

              {/* Hoja de vida */}
              <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-4 space-y-3">
                <p className="text-xs uppercase tracking-widest text-white/55">Hoja de vida</p>
                <div className="flex items-center gap-3 flex-wrap">
                  {draft.resumePath ? (
                    <>
                      <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-3 py-2.5">
                        <FileText className="h-4 w-4 text-brand-goldSoft shrink-0" />
                        <span className="max-w-[180px] truncate text-sm text-white">
                          {draft.resumePath.startsWith("blob:") ? "Documento cargado" : draft.resumePath.split("/").pop()}
                        </span>
                      </div>
                      <Button variant="gold" size="sm" onClick={() => openViewer(draft.resumePath, `Hoja de vida — ${draft.firstName} ${draft.lastName}`)}>
                        <Eye className="h-3.5 w-3.5" />Ver hoja de vida
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => resumeInputRef.current?.click()}>
                        <Upload className="h-3.5 w-3.5" />Cambiar
                      </Button>
                    </>
                  ) : (
                    <button
                      onClick={() => resumeInputRef.current?.click()}
                      className="flex items-center gap-2 rounded-xl border border-dashed border-white/25 bg-white/[0.04] px-4 py-3 text-sm text-white/60 hover:border-white/40 hover:text-white transition"
                    >
                      <FileText className="h-4 w-4" />Subir hoja de vida (PDF)
                    </button>
                  )}
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleResumeUpload(f); }}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Select value={draft.supportLabel} onChange={(event) => updateField("supportLabel", event.target.value)}>
                  <option value="Líder">Líder</option>
                  <option value="Voluntario">Voluntario</option>
                  <option value="Simpatizante">Simpatizante</option>
                  <option value="Votante">Votante</option>
                </Select>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={draft.supportScore}
                  onChange={(event) => updateField("supportScore", Number(event.target.value) as PersonRecord["supportScore"])}
                  placeholder="Score de apoyo"
                />
              </div>
              <Input
                value={draft.tags.join(", ")}
                onChange={(event) => updateField("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))}
                placeholder="Etiquetas separadas por coma"
              />
              <Textarea value={draft.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="Observaciones" />
              <div className="grid gap-4 md:grid-cols-2">
                <Select value={draft.visibilityScope} onChange={(event) => updateField("visibilityScope", event.target.value as PersonRecord["visibilityScope"])}>
                  <option value="public">Público</option>
                  <option value="operational">Operativo</option>
                  <option value="legal">Legal</option>
                  <option value="restricted">Restringido</option>
                </Select>
                <div className="rounded-2xl border border-white/20 bg-white/[0.10] px-4 py-3 text-sm text-white/78">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/58">Estado del registro</p>
                  <p className="mt-1 text-white">Listo para persistir en PostgreSQL con RLS</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-white/72">La edición ya funciona localmente y luego se conectará a Supabase Storage y PostgreSQL.</p>
                <Button variant="gold" onClick={handleSave}>
                  Guardar cambios
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {viewerUrl && (
        <ResumeViewer
          url={viewerUrl}
          name={viewerName}
          onClose={() => setViewerUrl(null)}
        />
      )}
    </div>
  );
}
