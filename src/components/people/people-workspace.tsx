"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Download,
  Eye,
  FileText,
  GitBranch,
  ImageIcon,
  PencilLine,
  Plus,
  Trash2,
  Upload,
  UserCheck,
  UsersRound,
  UserX,
  X
} from "lucide-react";
import { peopleSeed } from "@/lib/data/people";
import type { EmploymentStatus, PersonRecord } from "@/lib/types/domain";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatCard } from "@/components/ui/stat-card";
import { hasSupabaseBrowserConfig } from "@/lib/supabase/client";
import { fileViewUrl } from "@/lib/files/storage-ref";
import { cn } from "@/lib/utils";

function ResumeViewer({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const isImage = url.match(/\.(jpg|jpeg|png|webp|gif)$/i) || url.includes("image/");
  const viewUrl = fileViewUrl(url);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-ink/78 p-4 backdrop-blur-sm">
      <div className="relative flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-brand-line bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-brand-line px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-brand-emerald" />
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-muted">Documento</p>
              <p className="font-semibold text-brand-ink">{name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={viewUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-brand-emerald/24 bg-brand-beige px-3 py-2 text-xs font-semibold text-brand-ink/70 transition hover:bg-brand-emerald/10"
            >
              <Download className="h-3.5 w-3.5" />
              Descargar
            </a>
            <button onClick={onClose} className="rounded-xl border border-brand-emerald/24 bg-white p-2 text-brand-muted transition hover:bg-brand-beige hover:text-brand-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {isImage ? (
            <div className="flex h-full items-center justify-center overflow-auto p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={viewUrl} alt={name} className="max-h-full max-w-full rounded-xl object-contain shadow-xl" />
            </div>
          ) : (
            <iframe src={viewUrl} title={name} className="h-full w-full border-0" />
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
  birthDate: "",
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
  leaderDocumentNumber: "",
  leaderSector: "",
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

function fullName(person: PersonRecord) {
  return `${person.firstName} ${person.lastName}`.trim();
}

function isLeader(person: PersonRecord) {
  return person.supportLabel.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes("lider");
}

type PeopleWorkspaceProps = {
  initialMode?: "view" | "create";
};

type PeopleMode = "view" | "create" | "edit";

export function PeopleWorkspace({ initialMode = "view" }: PeopleWorkspaceProps = {}) {
  const router = useRouter();
  const startsCreating = initialMode === "create";
  const [people, setPeople] = useState<PersonRecord[]>(peopleSeed);
  const [selectedId, setSelectedId] = useState(startsCreating ? "" : peopleSeed[0]?.id ?? "");
  const [selectedLeaderDocument, setSelectedLeaderDocument] = useState(peopleSeed.find(isLeader)?.documentNumber ?? "");
  const [search, setSearch] = useState("");
  const [municipalityFilter, setMunicipalityFilter] = useState("all");
  const [draft, setDraft] = useState<PersonRecord>(startsCreating ? blankPerson() : peopleSeed[0] ?? blankPerson());
  const [mode, setMode] = useState<PeopleMode>(startsCreating ? "create" : "view");
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerName, setViewerName] = useState("");
  const [syncMessage, setSyncMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<"photo" | "resume" | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const loadPeopleFromApi = useCallback(async (preferredDocumentNumber?: string) => {
    if (!hasSupabaseBrowserConfig()) return;

    setSyncMessage("Sincronizando personas desde Supabase...");
    const response = await fetch("/api/people");
    const data = (await response.json()) as { people?: PersonRecord[]; error?: string };

    if (!response.ok || !Array.isArray(data.people)) {
      setSyncMessage(data.error ?? "No se pudieron cargar personas desde Supabase.");
      return;
    }

    const nextPeople = data.people;
    const nextSelected = preferredDocumentNumber
      ? nextPeople.find((person) => person.documentNumber === preferredDocumentNumber) ?? nextPeople[0]
      : nextPeople[0];
    const nextLeader = nextSelected && isLeader(nextSelected) ? nextSelected : nextPeople.find(isLeader);

    setPeople(nextPeople);
    if (startsCreating && !preferredDocumentNumber) {
      setSelectedId("");
      setDraft(blankPerson());
      setMode("create");
      setSelectedLeaderDocument(nextPeople.find(isLeader)?.documentNumber ?? "");
      setSyncMessage(nextPeople.length > 0 ? "Datos cargados desde Supabase. Completa el nuevo registro." : "Supabase conectado. Completa el primer registro.");
      return;
    }

    setSelectedId(nextSelected?.id ?? "");
    setDraft(nextSelected ?? blankPerson());
    setMode(nextSelected ? "view" : "create");
    setSelectedLeaderDocument(nextLeader?.documentNumber ?? "");
    setSyncMessage(nextPeople.length > 0 ? "Datos cargados desde Supabase." : "Supabase conectado. Aún no hay personas cargadas.");
  }, [startsCreating]);

  useEffect(() => {
    if (hasSupabaseBrowserConfig()) {
      void loadPeopleFromApi();
    } else {
      setSyncMessage("Sin variables Supabase: puedes revisar y editar la interfaz durante esta sesión.");
    }
  }, [loadPeopleFromApi]);

  const leaders = useMemo(() => people.filter(isLeader), [people]);
  const selectedLeader = useMemo(
    () => leaders.find((leader) => leader.documentNumber === selectedLeaderDocument) ?? leaders[0],
    [leaders, selectedLeaderDocument]
  );

  const assignedPeople = useMemo(() => {
    if (!selectedLeader) return [];
    return people.filter((person) => person.leaderDocumentNumber === selectedLeader.documentNumber && person.documentNumber !== selectedLeader.documentNumber);
  }, [people, selectedLeader]);

  const municipalities = useMemo(() => Array.from(new Set(people.map((person) => person.municipality))), [people]);

  const filteredPeople = useMemo(
    () =>
      people.filter((person) => {
        const haystack = [
          fullName(person),
          person.documentNumber,
          person.leaderName,
          person.leaderDocumentNumber,
          person.leaderSector,
          person.barrio,
          person.comuna,
          person.municipality
        ]
          .join(" ")
          .toLowerCase();
        const matchesSearch = haystack.includes(search.toLowerCase());
        const matchesMunicipality = municipalityFilter === "all" || person.municipality === municipalityFilter;
        return matchesSearch && matchesMunicipality;
      }),
    [municipalityFilter, people, search]
  );

  const stats = useMemo(
    () => ({
      total: people.length,
      leaders: leaders.length,
      assigned: people.filter((person) => person.leaderDocumentNumber).length,
      unassigned: people.filter((person) => !isLeader(person) && !person.leaderDocumentNumber).length
    }),
    [leaders.length, people]
  );

  function syncDraft(nextPerson: PersonRecord) {
    setDraft(nextPerson);
  }

  function openSelected(person: PersonRecord) {
    setSelectedId(person.id);
    setMode("view");
    syncDraft(person);
    if (isLeader(person)) setSelectedLeaderDocument(person.documentNumber);
  }

  function editPerson(person: PersonRecord) {
    setSelectedId(person.id);
    setMode("edit");
    syncDraft(person);
    if (isLeader(person)) setSelectedLeaderDocument(person.documentNumber);
  }

  function createNew() {
    router.push("/dashboard/people/new");
  }

  function updateField<K extends keyof PersonRecord>(field: K, value: PersonRecord[K]) {
    setDraft((current) => {
      const next = { ...current, [field]: value };
      if (field === "supportLabel" && isLeader(next)) {
        next.leaderDocumentNumber = "";
        next.leaderName = "";
      }
      return next;
    });
  }

  async function handleSave() {
    const selectedLeaderForDraft = leaders.find((leader) => leader.documentNumber === draft.leaderDocumentNumber);
    const nextPerson: PersonRecord = {
      ...draft,
      id: mode === "create" ? `person-${globalThis.crypto.randomUUID()}` : draft.id,
      leaderName: isLeader(draft) ? "" : selectedLeaderForDraft ? fullName(selectedLeaderForDraft) : draft.leaderName,
      tags: draft.tags.filter(Boolean),
      supportScore: Number.isFinite(draft.supportScore) ? draft.supportScore : 70
    };

    if (hasSupabaseBrowserConfig()) {
      setSaving(true);
      setSyncMessage("Guardando persona en Supabase...");

      try {
        const response = await fetch("/api/people", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextPerson)
        });
        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          setSyncMessage(data.error ?? "No se pudo guardar la persona.");
          return;
        }

        await loadPeopleFromApi(nextPerson.documentNumber);
        setSyncMessage("Persona guardada en Supabase.");
        setMode("view");
      } finally {
        setSaving(false);
      }
      return;
    }

    if (mode === "create") {
      setPeople((current) => [nextPerson, ...current]);
      setSelectedId(nextPerson.id);
      setMode("view");
      setDraft(nextPerson);
      if (isLeader(nextPerson)) setSelectedLeaderDocument(nextPerson.documentNumber);
      return;
    }

    setPeople((current) => current.map((person) => (person.id === nextPerson.id ? nextPerson : person)));
    setSelectedId(nextPerson.id);
    setDraft(nextPerson);
    setMode("view");
    if (isLeader(nextPerson)) setSelectedLeaderDocument(nextPerson.documentNumber);
  }

  async function handleDelete() {
    if (!selectedId) return;

    const deleted = people.find((person) => person.id === selectedId);

    if (hasSupabaseBrowserConfig() && deleted) {
      setSaving(true);
      setSyncMessage("Eliminando persona en Supabase...");

      try {
        const response = await fetch("/api/people", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentNumber: deleted.documentNumber })
        });
        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          setSyncMessage(data.error ?? "No se pudo eliminar la persona.");
          return;
        }

        await loadPeopleFromApi();
        setSyncMessage("Persona eliminada en Supabase.");
      } finally {
        setSaving(false);
      }
      return;
    }

    const nextPeople = people
      .filter((person) => person.id !== selectedId)
      .map((person) =>
        deleted && person.leaderDocumentNumber === deleted.documentNumber
          ? { ...person, leaderDocumentNumber: "", leaderName: "" }
          : person
      );
    const nextSelected = nextPeople[0];

    setPeople(nextPeople);
    if (nextSelected) {
      setSelectedId(nextSelected.id);
      setDraft(nextSelected);
      setSelectedLeaderDocument(nextPeople.find(isLeader)?.documentNumber ?? "");
    } else {
      setSelectedId("");
      setDraft(blankPerson());
      setMode("create");
      setSelectedLeaderDocument("");
    }
  }

  async function uploadPersonFile(file: File, kind: "photo" | "resume") {
    if (!hasSupabaseBrowserConfig()) {
      updateField(kind === "photo" ? "photoPath" : "resumePath", URL.createObjectURL(file));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    formData.append("documentNumber", draft.documentNumber);

    setUploadingFile(kind);
    setSyncMessage(kind === "photo" ? "Subiendo foto a Supabase Storage..." : "Subiendo hoja de vida a Supabase Storage...");

    try {
      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData
      });
      const data = (await response.json()) as { storageRef?: string; error?: string };

      if (!response.ok || !data.storageRef) {
        setSyncMessage(data.error ?? "No se pudo subir el archivo.");
        return;
      }

      updateField(kind === "photo" ? "photoPath" : "resumePath", data.storageRef);
      setSyncMessage(kind === "photo" ? "Foto cargada. Guarda la persona para asociarla." : "Hoja de vida cargada. Guarda la persona para asociarla.");
    } finally {
      setUploadingFile(null);
    }
  }

  function openViewer(url: string, name: string) {
    setViewerUrl(url);
    setViewerName(name);
  }

  const selectedIsLeader = isLeader(draft);

  return (
    <div className="space-y-6">
      {syncMessage && (
        <div className="rounded-2xl border border-brand-line bg-white/78 px-4 py-3 text-sm text-brand-ink/70 shadow-panel">
          {syncMessage}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-4">
        <StatCard label="Total personas" value={String(stats.total)} hint="Base registrada" delta="CRM territorial" icon={<UsersRound className="h-5 w-5" />} tone="gold" />
        <StatCard label="Líderes" value={String(stats.leaders)} hint="Responsables por sector" delta="Estructura" icon={<BadgeCheck className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Asignadas" value={String(stats.assigned)} hint="Personas con líder" delta="Movilización" icon={<GitBranch className="h-5 w-5" />} tone="navy" />
        <StatCard label="Sin líder" value={String(stats.unassigned)} hint="Pendientes por asignar" delta="Revisión" icon={<UserX className="h-5 w-5" />} tone="neutral" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">Liderazgo territorial</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-brand-ink">Líderes y personas a cargo</h2>
            </div>
            <Button variant="gold" onClick={createNew}>
              <Plus className="h-4 w-4" />
              Nuevo registro
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-3">
            {leaders.map((leader) => {
              const count = people.filter((person) => person.leaderDocumentNumber === leader.documentNumber).length;
              const active = selectedLeader?.documentNumber === leader.documentNumber;
              return (
                <button
                  key={leader.id}
                  type="button"
                  onClick={() => {
                    setSelectedLeaderDocument(leader.documentNumber);
                    openSelected(leader);
                  }}
                  className={cn(
                    "w-full rounded-2xl border p-4 text-left transition",
                    active ? "border-brand-emerald/45 bg-brand-emerald/14 shadow-glowEmerald" : "border-brand-line bg-white/76 hover:border-brand-emerald/35 hover:bg-brand-emerald/8"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-ink">{fullName(leader)}</p>
                      <p className="mt-1 text-sm text-brand-ink/62">{leader.leaderSector || leader.barrio || "Sector por definir"}</p>
                    </div>
                    <Badge variant="gold">{count} personas</Badge>
                  </div>
                  <p className="mt-2 text-xs text-brand-muted">CC {leader.documentNumber}</p>
                </button>
              );
            })}
          </div>

          <div className="rounded-3xl border border-brand-line bg-white/72 p-4">
            {selectedLeader ? (
              <>
                <div className="flex flex-col gap-3 border-b border-brand-line pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-brand-muted">Listado movilizado por</p>
                    <h3 className="mt-1 font-display text-2xl font-semibold text-brand-ink">{fullName(selectedLeader)}</h3>
                    <p className="mt-1 text-sm text-brand-ink/64">{selectedLeader.leaderSector || selectedLeader.barrio}</p>
                  </div>
                  <Badge variant="emerald">{assignedPeople.length} asignadas</Badge>
                </div>

                <div className="mt-4 max-h-[360px] space-y-2 overflow-auto pr-1">
                  {assignedPeople.length === 0 ? (
                    <div className="rounded-2xl border border-brand-emerald/20 bg-brand-beige/70 px-4 py-6 text-sm text-brand-ink/64">
                      Este líder todavía no tiene personas asignadas.
                    </div>
                  ) : (
                    assignedPeople.map((person) => (
                      <button
                        type="button"
                        key={person.id}
                        onClick={() => openSelected(person)}
                        className="grid w-full gap-2 rounded-2xl border border-brand-line bg-white px-4 py-3 text-left transition hover:border-brand-emerald/35 hover:bg-brand-beige sm:grid-cols-[1fr_auto]"
                      >
                        <div>
                          <p className="font-semibold text-brand-ink">{fullName(person)}</p>
                          <p className="text-xs text-brand-ink/58">CC {person.documentNumber} · {person.whatsapp || person.phone || "Sin teléfono"}</p>
                        </div>
                        <Badge variant={person.supportLabel === "Voluntario" ? "emerald" : "neutral"}>{person.supportLabel}</Badge>
                      </button>
                    ))
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-brand-emerald/20 bg-brand-beige/70 px-4 py-6 text-sm text-brand-ink/64">
                Crea o importa un líder para ver su estructura territorial.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">Directorio CRM</p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-brand-ink">Personas, líderes y movilización</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[460px]">
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nombre, cédula, líder o sector" />
                <Select value={municipalityFilter} onChange={(event) => setMunicipalityFilter(event.target.value)}>
                  <option value="all">Todos los municipios</option>
                  {municipalities.map((municipality) => (
                    <option key={municipality} value={municipality}>
                      {municipality}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Persona</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Territorio</TableHead>
                  <TableHead>Líder responsable</TableHead>
                  <TableHead>Laboral</TableHead>
                  <TableHead>HV</TableHead>
                  <TableHead>Acciones</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredPeople.map((person) => {
                  const active = selectedId === person.id;
                  return (
                    <TableRow key={person.id} onClick={() => openSelected(person)} className={cn("cursor-pointer", active && "bg-brand-emerald/10")}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-brand-ink">{fullName(person)}</p>
                          <p className="text-xs text-brand-ink/58">CC {person.documentNumber}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isLeader(person) ? "gold" : person.supportLabel === "Voluntario" ? "emerald" : "neutral"}>{isLeader(person) ? "Líder" : person.supportLabel}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-brand-ink">{person.municipality}</p>
                        <p className="text-xs text-brand-ink/58">{person.barrio} · {person.comuna}</p>
                      </TableCell>
                      <TableCell>{isLeader(person) ? person.leaderSector || "Sector por definir" : person.leaderName || "Sin asignar"}</TableCell>
                      <TableCell>
                        <p className="text-brand-ink">{employmentLabels[person.employmentStatus]}</p>
                        <p className="text-xs text-brand-ink/58">{person.profession}</p>
                      </TableCell>
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        {person.resumePath ? (
                          <button
                            onClick={() => openViewer(person.resumePath, fullName(person))}
                            className="flex items-center gap-1 rounded-lg border border-brand-gold/25 bg-brand-gold/10 px-2.5 py-1.5 text-xs font-semibold text-brand-ink transition hover:bg-brand-gold/20"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Ver
                          </button>
                        ) : (
                          <span className="text-xs text-brand-muted">Sin archivo</span>
                        )}
                      </TableCell>
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => editPerson(person)}>
                          <PencilLine className="h-3.5 w-3.5" />
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {mode !== "view" && (
          <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">Detalle y edición</p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-brand-ink">{mode === "create" ? "Nuevo registro" : fullName(draft)}</h3>
              </div>
              <div className="flex items-center gap-2">
                {mode === "edit" ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (selectedId) setDraft(people.find((person) => person.id === selectedId) ?? draft);
                      setMode("view");
                    }}
                  >
                    Cancelar
                  </Button>
                ) : null}
                <Button variant="danger" onClick={handleDelete} disabled={saving || mode === "create"}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <fieldset disabled={saving} className="space-y-4 disabled:opacity-70">
            <div className="grid gap-3 md:grid-cols-2">
              <Input value={draft.firstName} onChange={(event) => updateField("firstName", event.target.value)} placeholder="Nombres" />
              <Input value={draft.lastName} onChange={(event) => updateField("lastName", event.target.value)} placeholder="Apellidos" />
              <Input value={draft.documentNumber} onChange={(event) => updateField("documentNumber", event.target.value)} placeholder="Cédula" />
              <Input value={draft.birthDate ?? ""} onChange={(event) => updateField("birthDate", event.target.value)} placeholder="Fecha de nacimiento" type="date" />
              <Select value={draft.supportLabel} onChange={(event) => updateField("supportLabel", event.target.value)}>
                <option value="Líder">Líder</option>
                <option value="Voluntario">Voluntario</option>
                <option value="Simpatizante">Simpatizante</option>
                <option value="Votante">Votante</option>
              </Select>
            </div>

            {selectedIsLeader ? (
              <Input value={draft.leaderSector ?? ""} onChange={(event) => updateField("leaderSector", event.target.value)} placeholder="Sector que lidera. Ej: Bajo Tablazo" />
            ) : (
              <Select value={draft.leaderDocumentNumber ?? ""} onChange={(event) => updateField("leaderDocumentNumber", event.target.value)}>
                <option value="">Sin líder asignado</option>
                {leaders.map((leader) => (
                  <option key={leader.documentNumber} value={leader.documentNumber}>
                    {fullName(leader)} · {leader.leaderSector || leader.barrio}
                  </option>
                ))}
              </Select>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <Input value={draft.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="Teléfono" />
              <Input value={draft.whatsapp} onChange={(event) => updateField("whatsapp", event.target.value)} placeholder="WhatsApp" />
              <Input value={draft.email} onChange={(event) => updateField("email", event.target.value)} placeholder="Correo" type="email" />
              <Input value={draft.address} onChange={(event) => updateField("address", event.target.value)} placeholder="Dirección" />
              <Input value={draft.department} onChange={(event) => updateField("department", event.target.value)} placeholder="Departamento" />
              <Input value={draft.municipality} onChange={(event) => updateField("municipality", event.target.value)} placeholder="Municipio" />
              <Input value={draft.comuna} onChange={(event) => updateField("comuna", event.target.value)} placeholder="Comuna, zona o corregimiento" />
              <Input value={draft.barrio} onChange={(event) => updateField("barrio", event.target.value)} placeholder="Barrio o vereda" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input value={draft.profession} onChange={(event) => updateField("profession", event.target.value)} placeholder="Profesión" />
              <Input value={draft.company} onChange={(event) => updateField("company", event.target.value)} placeholder="Empresa" />
              <Input value={draft.jobTitle} onChange={(event) => updateField("jobTitle", event.target.value)} placeholder="Cargo" />
              <Select value={draft.employmentStatus} onChange={(event) => updateField("employmentStatus", event.target.value as EmploymentStatus)}>
                {Object.entries(employmentLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <Input value={draft.votingPlace} onChange={(event) => updateField("votingPlace", event.target.value)} placeholder="Puesto de votación" />
              <Input value={draft.votingTable} onChange={(event) => updateField("votingTable", event.target.value)} placeholder="Mesa" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={draft.supportScore}
                onChange={(event) => updateField("supportScore", Number(event.target.value) as PersonRecord["supportScore"])}
                placeholder="Puntaje de apoyo"
              />
              <Select value={draft.visibilityScope} onChange={(event) => updateField("visibilityScope", event.target.value as PersonRecord["visibilityScope"])}>
                <option value="public">Público</option>
                <option value="operational">Operativo</option>
                <option value="legal">Legal</option>
                <option value="restricted">Restringido</option>
              </Select>
            </div>

            <Input
              value={draft.tags.join(", ")}
              onChange={(event) => updateField("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))}
              placeholder="Etiquetas separadas por coma"
            />
            <Textarea value={draft.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="Observaciones" />

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-brand-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-widest text-brand-muted">Foto de perfil</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {draft.photoPath ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fileViewUrl(draft.photoPath)} alt="Foto" className="h-14 w-14 rounded-xl border border-brand-line object-cover" />
                      <Button variant="ghost" size="sm" onClick={() => openViewer(draft.photoPath, `Foto - ${fullName(draft)}`)}>
                        <Eye className="h-3.5 w-3.5" />
                        Ver
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => photoInputRef.current?.click()} disabled={uploadingFile === "photo"}>
                        <ImageIcon className="h-3.5 w-3.5" />
                        Cambiar
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => photoInputRef.current?.click()} disabled={uploadingFile === "photo"}>
                      <ImageIcon className="h-3.5 w-3.5" />
                      {uploadingFile === "photo" ? "Subiendo..." : "Subir foto"}
                    </Button>
                  )}
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPersonFile(file, "photo"); }} />
                </div>
              </div>

              <div className="rounded-2xl border border-brand-line bg-white/70 p-4">
                <p className="text-xs uppercase tracking-widest text-brand-muted">Hoja de vida</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {draft.resumePath ? (
                    <>
                      <Button variant="gold" size="sm" onClick={() => openViewer(draft.resumePath, `Hoja de vida - ${fullName(draft)}`)}>
                        <Eye className="h-3.5 w-3.5" />
                        Ver hoja de vida
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => resumeInputRef.current?.click()} disabled={uploadingFile === "resume"}>
                        <Upload className="h-3.5 w-3.5" />
                        Cambiar
                      </Button>
                    </>
                  ) : (
                    <Button variant="ghost" size="sm" onClick={() => resumeInputRef.current?.click()} disabled={uploadingFile === "resume"}>
                      <Upload className="h-3.5 w-3.5" />
                      {uploadingFile === "resume" ? "Subiendo..." : "Subir HV"}
                    </Button>
                  )}
                  <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadPersonFile(file, "resume"); }} />
                </div>
              </div>
            </div>

            {selectedIsLeader && (
              <div className="rounded-2xl border border-brand-emerald/25 bg-brand-emerald/10 px-4 py-3 text-sm text-brand-ink/75">
                <UserCheck className="mr-2 inline h-4 w-4 text-brand-emerald" />
                Este líder tiene {people.filter((person) => person.leaderDocumentNumber === draft.documentNumber).length} persona(s) a cargo.
              </div>
            )}
            </fieldset>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-brand-ink/62">
                Los cambios de producción se guardarán contra Supabase según rol y permisos.
              </p>
              <Button variant="gold" onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </CardContent>
          </Card>
        )}
      </div>

      {viewerUrl && <ResumeViewer url={viewerUrl} name={viewerName} onClose={() => setViewerUrl(null)} />}
    </div>
  );
}
