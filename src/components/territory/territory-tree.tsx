"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BadgeCheck, ChevronDown, ChevronRight, FileText, GitBranch, MapPin, Phone, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { peopleSeed } from "@/lib/data/people";
import { territorySummary } from "@/lib/data/territory";
import { fileViewUrl } from "@/lib/files/storage-ref";
import { hasSupabaseBrowserConfig } from "@/lib/supabase/client";
import type { PersonRecord } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

type TerritoryNodeKind = "municipality" | "leader" | "person" | "unassigned";

type TerritoryNode = {
  id: string;
  kind: TerritoryNodeKind;
  name: string;
  title: string;
  municipality: string;
  documentNumber?: string;
  influenceScore: number;
  peopleMobilized: number;
  children: TerritoryNode[];
};

function fullName(person: PersonRecord) {
  return `${person.firstName} ${person.lastName}`.trim();
}

function isLeader(person: PersonRecord) {
  return person.supportLabel
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .includes("lider");
}

function averageScore(people: PersonRecord[]) {
  if (people.length === 0) return 0;
  return Math.round(people.reduce((total, person) => total + Number(person.supportScore || 0), 0) / people.length);
}

function nodeId(prefix: string, value: string) {
  return `${prefix}-${value || "sin-dato"}`.replace(/[^a-zA-Z0-9_-]+/g, "-");
}

function buildTerritoryNodes(people: PersonRecord[]): TerritoryNode[] {
  const byMunicipality = new Map<string, PersonRecord[]>();

  people.forEach((person) => {
    const municipality = person.municipality || "Sin municipio";
    byMunicipality.set(municipality, [...(byMunicipality.get(municipality) ?? []), person]);
  });

  return Array.from(byMunicipality.entries())
    .sort(([a], [b]) => a.localeCompare(b, "es"))
    .map(([municipality, municipalityPeople]) => {
      const leaders = municipalityPeople.filter(isLeader);
      const leaderNodes: TerritoryNode[] = leaders.map((leader) => {
        const assigned = municipalityPeople.filter((person) => person.leaderDocumentNumber === leader.documentNumber);

        return {
          id: nodeId("lider", leader.documentNumber),
          kind: "leader",
          name: fullName(leader),
          title: leader.leaderSector ? `Líder de ${leader.leaderSector}` : "Líder territorial",
          municipality,
          documentNumber: leader.documentNumber,
          influenceScore: Number(leader.supportScore || averageScore(assigned)),
          peopleMobilized: assigned.length,
          children: assigned.map((person) => ({
            id: nodeId("persona", person.documentNumber),
            kind: "person",
            name: fullName(person),
            title: person.supportLabel || "Persona registrada",
            municipality,
            documentNumber: person.documentNumber,
            influenceScore: Number(person.supportScore || 0),
            peopleMobilized: 1,
            children: []
          }))
        };
      });

      const unassigned = municipalityPeople.filter((person) => !isLeader(person) && !person.leaderDocumentNumber);
      const unassignedNode: TerritoryNode[] = unassigned.length
        ? [
            {
              id: nodeId("sin-lider", municipality),
              kind: "unassigned",
              name: "Personas sin líder asignado",
              title: "Pendiente por organizar",
              municipality,
              influenceScore: averageScore(unassigned),
              peopleMobilized: unassigned.length,
              children: unassigned.map((person) => ({
                id: nodeId("persona", person.documentNumber),
                kind: "person",
                name: fullName(person),
                title: person.supportLabel || "Persona registrada",
                municipality,
                documentNumber: person.documentNumber,
                influenceScore: Number(person.supportScore || 0),
                peopleMobilized: 1,
                children: []
              }))
            }
          ]
        : [];

      return {
        id: nodeId("municipio", municipality),
        kind: "municipality",
        name: municipality,
        title: `${leaders.length} líder${leaders.length !== 1 ? "es" : ""} registrado${leaders.length !== 1 ? "s" : ""}`,
        municipality,
        influenceScore: averageScore(municipalityPeople),
        peopleMobilized: municipalityPeople.length,
        children: [...leaderNodes, ...unassignedNode]
      };
    });
}

function peopleForNode(node: TerritoryNode, people: PersonRecord[]) {
  if (node.kind === "municipality") return people.filter((person) => (person.municipality || "Sin municipio") === node.municipality);
  if (node.kind === "leader" && node.documentNumber) return people.filter((person) => person.leaderDocumentNumber === node.documentNumber);
  if (node.kind === "unassigned") return people.filter((person) => !isLeader(person) && !person.leaderDocumentNumber && (person.municipality || "Sin municipio") === node.municipality);
  if (node.documentNumber) return people.filter((person) => person.documentNumber === node.documentNumber);
  return [];
}

function ResumeViewer({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const viewUrl = fileViewUrl(url);
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url) || url.includes("image/");

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-ink/82 p-4 backdrop-blur-sm">
      <div className="flex h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-brand-line bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-brand-line px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-brand-muted">Vista previa</p>
            <h3 className="mt-1 font-display text-xl font-semibold text-brand-ink">{name}</h3>
          </div>
          <button onClick={onClose} className="rounded-xl border border-brand-line bg-white p-2 text-brand-muted transition hover:bg-brand-cream hover:text-brand-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 bg-brand-cream/60">
          {isImage ? (
            <div className="flex h-full items-center justify-center overflow-auto p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={viewUrl} alt={name} className="max-h-full max-w-full rounded-2xl object-contain shadow-panel" />
            </div>
          ) : (
            <iframe src={viewUrl} title={name} className="h-full w-full border-0" />
          )}
        </div>
      </div>
    </div>
  );
}

function PersonCard({ person, onViewResume }: { person: PersonRecord; onViewResume: (url: string, name: string) => void }) {
  return (
    <div className="rounded-2xl border border-brand-line bg-white/78 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-brand-ink">{fullName(person)}</p>
            <Badge variant={isLeader(person) ? "gold" : person.supportLabel === "Voluntario" ? "emerald" : "neutral"}>{isLeader(person) ? "Líder" : person.supportLabel}</Badge>
          </div>
          <p className="mt-1 text-sm text-brand-ink/62">CC {person.documentNumber} · {person.profession || "Sin profesión"}</p>
          <p className="mt-1 text-xs text-brand-ink/55">{person.barrio || "Sin barrio/vereda"} · {person.comuna || "Sin comuna/zona"}</p>
        </div>
        {person.resumePath && (
          <button
            onClick={() => onViewResume(person.resumePath, `Hoja de vida - ${fullName(person)}`)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-brand-gold/25 bg-brand-gold/10 px-4 text-sm font-semibold text-brand-ink transition hover:bg-brand-gold/20"
          >
            <FileText className="h-4 w-4" />
            Ver HV
          </button>
        )}
      </div>

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div className="rounded-xl border border-brand-line bg-brand-cream/70 px-3 py-2">
          <p className="text-[10px] uppercase tracking-widest text-brand-muted">Contacto</p>
          <p className="mt-1 text-brand-ink">{person.whatsapp || person.phone || person.email || "Sin contacto"}</p>
        </div>
        <div className="rounded-xl border border-brand-line bg-brand-cream/70 px-3 py-2">
          <p className="text-[10px] uppercase tracking-widest text-brand-muted">Votación</p>
          <p className="mt-1 text-brand-ink">{person.votingPlace || "Sin puesto"}{person.votingTable ? ` · Mesa ${person.votingTable}` : ""}</p>
        </div>
      </div>

      {person.phone && (
        <a href={`tel:${person.phone}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-emerald transition hover:text-brand-navy">
          <Phone className="h-4 w-4" />
          Llamar
        </a>
      )}
    </div>
  );
}

function NodeDetailModal({ node, people, onClose }: { node: TerritoryNode; people: PersonRecord[]; onClose: () => void }) {
  const [resume, setResume] = useState<{ url: string; name: string } | null>(null);
  const visiblePeople = peopleForNode(node, people);

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-end bg-brand-ink/70 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden border-l border-brand-line bg-brand-cream shadow-2xl">
        <div className="shrink-0 border-b border-brand-line bg-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-brand-muted">{node.title} · {node.municipality}</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-brand-ink">{node.name}</h2>
              <p className="mt-1 text-sm text-brand-ink/65">
                {visiblePeople.length} persona{visiblePeople.length !== 1 ? "s" : ""} en este nivel territorial
              </p>
            </div>
            <button onClick={onClose} className="rounded-xl border border-brand-line bg-white p-2 text-brand-muted transition hover:bg-brand-cream hover:text-brand-ink">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            {[
              ["Líderes", visiblePeople.filter(isLeader).length],
              ["Voluntarios", visiblePeople.filter((person) => person.supportLabel === "Voluntario").length],
              ["Simpatizantes", visiblePeople.filter((person) => person.supportLabel === "Simpatizante").length],
              ["Sin líder", visiblePeople.filter((person) => !isLeader(person) && !person.leaderDocumentNumber).length]
            ].map(([label, count]) => (
              <div key={String(label)} className="rounded-2xl border border-brand-line bg-brand-cream px-3 py-2 text-center">
                <p className="text-brand-muted">{label}</p>
                <p className="mt-0.5 text-lg font-bold text-brand-ink">{count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          {visiblePeople.length === 0 ? (
            <div className="rounded-2xl border border-brand-line bg-white/70 px-4 py-8 text-center text-sm text-brand-ink/62">
              No hay personas registradas en este nodo.
            </div>
          ) : (
            visiblePeople.map((person) => (
              <PersonCard key={person.id} person={person} onViewResume={(url, name) => setResume({ url, name })} />
            ))
          )}
        </div>
      </div>

      {resume && <ResumeViewer url={resume.url} name={resume.name} onClose={() => setResume(null)} />}
    </div>
  );
}

function TreeNode({ node, depth = 0, onSelect }: { node: TerritoryNode; depth?: number; onSelect: (node: TerritoryNode) => void }) {
  const [open, setOpen] = useState(depth <= 1);
  const hasChildren = node.children.length > 0;
  const isMunicipality = node.kind === "municipality";

  return (
    <div className={cn("space-y-2", depth > 0 && "ml-4 border-l border-brand-line pl-4")}>
      <Card className={cn(isMunicipality ? "border-brand-gold/35 bg-white/88" : "border-brand-line bg-white/72")}>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {hasChildren ? (
                <button
                  onClick={() => setOpen((current) => !current)}
                  className="mt-0.5 shrink-0 rounded-xl border border-brand-line bg-brand-cream p-1.5 text-brand-ink transition hover:bg-brand-beige"
                >
                  {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              ) : (
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-brand-line bg-brand-cream text-brand-muted">
                  {node.kind === "person" ? <Users className="h-3.5 w-3.5" /> : <GitBranch className="h-3.5 w-3.5" />}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-display text-base font-semibold text-brand-ink">{node.name}</p>
                <p className="mt-0.5 text-sm text-brand-ink/62">{node.title}</p>
              </div>
            </div>
            <Badge variant={node.influenceScore >= 80 ? "gold" : node.influenceScore >= 65 ? "emerald" : "neutral"}>{node.influenceScore}%</Badge>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border border-brand-line bg-brand-cream/70 p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-brand-muted">Municipio</p>
              <p className="mt-0.5 font-medium text-brand-ink">{node.municipality}</p>
            </div>
            <div className="rounded-xl border border-brand-line bg-brand-cream/70 p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-brand-muted">Personas</p>
              <p className="mt-0.5 font-medium text-brand-ink">{node.peopleMobilized.toLocaleString("es-CO")}</p>
            </div>
          </div>

          <button
            onClick={() => onSelect(node)}
            className="mt-3 flex w-full items-center justify-between rounded-xl border border-brand-gold/20 bg-brand-gold/10 px-3 py-2 text-sm font-semibold text-brand-ink transition hover:bg-brand-gold/20"
          >
            <span className="flex items-center gap-2">
              {isMunicipality ? <MapPin className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
              Ver detalle
            </span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </Card>

      {open && hasChildren && (
        <div className="space-y-2">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TerritoryTree() {
  const [people, setPeople] = useState<PersonRecord[]>(peopleSeed);
  const [selectedNode, setSelectedNode] = useState<TerritoryNode | null>(null);
  const [status, setStatus] = useState("");

  const loadPeople = useCallback(async () => {
    if (!hasSupabaseBrowserConfig()) return;

    const response = await fetch("/api/people");
    const data = (await response.json()) as { people?: PersonRecord[]; error?: string };

    if (!response.ok || !Array.isArray(data.people)) {
      setStatus(data.error ?? "No se pudo cargar la estructura desde Supabase.");
      return;
    }

    setPeople(data.people);
    setStatus(data.people.length > 0 ? "Estructura cargada desde Supabase." : "Supabase conectado. Aún no hay personas registradas.");
  }, []);

  useEffect(() => {
    void loadPeople();
  }, [loadPeople]);

  const municipalityNodes = useMemo(() => buildTerritoryNodes(people), [people]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
      <div className="space-y-3">
        {status && (
          <div className="rounded-2xl border border-brand-line bg-white/78 px-4 py-3 text-sm text-brand-ink/70 shadow-panel">
            {status}
          </div>
        )}

        {municipalityNodes.length === 0 ? (
          <Card className="border-brand-line bg-white/78">
            <div className="p-6 text-sm text-brand-ink/62">Carga personas o líderes para construir la estructura territorial.</div>
          </Card>
        ) : (
          municipalityNodes.map((node) => <TreeNode key={node.id} node={node} onSelect={setSelectedNode} />)
        )}
      </div>

      <Card className="border-brand-line bg-white/82">
        <div className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-line bg-brand-cream text-brand-ink">
            <BadgeCheck className="h-5 w-5" />
          </div>
          <p className="mt-5 text-xs uppercase tracking-[0.28em] text-brand-muted">Estructura y cobertura</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-brand-ink">Influencia por municipio</h3>
          <div className="mt-5 space-y-3">
            {territorySummary.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-brand-line bg-brand-cream/70 px-4 py-3">
                <span className="text-sm text-brand-ink/70">{item.label}</span>
                <span className="font-semibold text-brand-ink">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-brand-gold/20 bg-brand-gold/10 px-4 py-3 text-sm text-brand-ink/70">
            Selecciona un municipio, líder o persona para abrir su detalle y consultar los registros asociados.
          </div>
        </div>
      </Card>

      {selectedNode && <NodeDetailModal node={selectedNode} people={people} onClose={() => setSelectedNode(null)} />}
    </div>
  );
}
