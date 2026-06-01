"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Users, X, FileText, Phone, MapPin, Briefcase, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { leadershipTree, territorySummary } from "@/lib/data/territory";
import { peopleSeed } from "@/lib/data/people";
import type { PersonRecord } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

/* ── Mini visor de hoja de vida ─────────────────────────────────── */
function ResumeViewer({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(url) || url.includes("image/");
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative flex h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[22px] border border-white/20 bg-[#0e1e38] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-white/15 px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-brand-goldSoft" />
            <div>
              <p className="text-xs uppercase tracking-widest text-white/55">Hoja de vida</p>
              <p className="font-semibold text-white">{name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={url} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/15 hover:text-white transition">
              <Eye className="h-3.5 w-3.5" />Nueva pestaña
            </a>
            <button onClick={onClose} className="rounded-xl border border-white/20 bg-white/[0.06] p-2 text-white/60 hover:bg-white/15 hover:text-white transition">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {isImage
            ? <div className="flex h-full items-center justify-center overflow-auto p-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={name} className="max-h-full max-w-full rounded-xl object-contain" />
              </div>
            : <iframe src={url} title={name} className="h-full w-full border-0" style={{ background: "#fff" }} />
          }
        </div>
      </div>
    </div>
  );
}

/* ── Tarjeta de persona dentro del modal ────────────────────────── */
function PersonCard({ person, onViewResume }: { person: PersonRecord; onViewResume: (url: string, name: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.05] overflow-hidden">
      {/* Fila principal */}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Foto */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-white/10">
          {person.photoPath
            ? /* eslint-disable-next-line @next/next/no-img-element */
              <img src={person.photoPath} alt="" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} className="h-full w-full object-cover" />
            : <Users className="h-5 w-5 text-white/30" />
          }
        </div>

        {/* Info básica */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white">{person.firstName} {person.lastName}</p>
            <Badge variant={person.supportLabel === "Líder" ? "gold" : person.supportLabel === "Voluntario" ? "emerald" : "neutral"} >
              {person.supportLabel}
            </Badge>
            <span className="text-xs text-white/45">{person.supportScore}%</span>
          </div>
          <div className="mt-0.5 flex items-center gap-3 flex-wrap text-xs text-white/55">
            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{person.profession}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{person.municipality} · {person.barrio}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex shrink-0 items-center gap-2">
          {person.resumePath && (
            <button
              onClick={() => onViewResume(person.resumePath, `${person.firstName} ${person.lastName}`)}
              className="flex items-center gap-1 rounded-lg border border-brand-gold/25 bg-brand-gold/10 px-2.5 py-1.5 text-xs font-semibold text-brand-goldSoft hover:bg-brand-gold/20 transition"
            >
              <FileText className="h-3.5 w-3.5" />Ver HV
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1.5 text-xs text-white/60 hover:bg-white/15 hover:text-white transition"
          >
            {expanded ? "▲ Menos" : "▼ Más"}
          </button>
        </div>
      </div>

      {/* Detalle expandido */}
      {expanded && (
        <div className="border-t border-white/10 px-4 py-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          {[
            ["Cédula",       person.documentNumber],
            ["Teléfono",     person.phone],
            ["WhatsApp",     person.whatsapp],
            ["Correo",       person.email],
            ["Dirección",    person.address],
            ["Comuna",       person.comuna],
            ["Empresa",      person.company],
            ["Cargo",        person.jobTitle],
            ["Situación",    person.employmentStatus],
            ["Puesto votación", person.votingPlace],
            ["Mesa",         person.votingTable],
            ["Visibilidad",  person.visibilityScope],
          ].filter(([, v]) => v).map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-white/45">{label}</p>
              <p className="mt-0.5 text-white/85 truncate">{value}</p>
            </div>
          ))}
          {person.notes && (
            <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-white/45">Observaciones</p>
              <p className="mt-0.5 text-white/80 leading-6">{person.notes}</p>
            </div>
          )}
          {person.tags.length > 0 && (
            <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-2">
              {person.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-xs text-white/65">#{tag}</span>
              ))}
            </div>
          )}
          {person.phone && (
            <div className="sm:col-span-2 lg:col-span-3">
              <a href={`tel:${person.phone}`} className="flex items-center gap-2 rounded-xl border border-brand-emerald/20 bg-brand-emerald/10 px-3 py-2 text-sm text-emerald-300 hover:bg-brand-emerald/20 transition w-fit">
                <Phone className="h-3.5 w-3.5" />Llamar a {person.firstName}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Modal del líder ────────────────────────────────────────────── */
function LeaderPeopleModal({
  leaderName,
  leaderTitle,
  municipality,
  onClose,
}: {
  leaderName: string;
  leaderTitle: string;
  municipality: string;
  onClose: () => void;
}) {
  const [resumeUrl, setResumeUrl]   = useState<string | null>(null);
  const [resumeName, setResumeName] = useState("");

  const people = peopleSeed.filter(
    (p) => p.leaderName.toLowerCase().trim() === leaderName.toLowerCase().trim()
  );

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-end bg-black/60 backdrop-blur-sm">
      {/* Panel lateral */}
      <div className="flex h-full w-full max-w-2xl flex-col border-l border-white/15 bg-[#132540] shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="shrink-0 border-b border-white/15 bg-[#0e1e38] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/55">{leaderTitle} · {municipality}</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-white">{leaderName}</h2>
              <p className="mt-1 text-sm text-white/65">
                {people.length === 0
                  ? "Sin personas registradas bajo este nodo"
                  : `${people.length} persona${people.length !== 1 ? "s" : ""} registrada${people.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button onClick={onClose} className="rounded-xl border border-white/20 bg-white/[0.06] p-2 text-white/60 hover:bg-white/15 hover:text-white transition">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Resumen rápido */}
          {people.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
              {[
                ["Líderes",      people.filter((p) => p.supportLabel === "Líder").length],
                ["Voluntarios",  people.filter((p) => p.supportLabel === "Voluntario").length],
                ["Simpatizantes",people.filter((p) => p.supportLabel === "Simpatizante").length],
                ["Votantes",     people.filter((p) => p.supportLabel === "Votante").length],
              ].map(([label, count]) => (
                <div key={String(label)} className="rounded-xl border border-white/15 bg-white/[0.06] px-2 py-2 text-center">
                  <p className="text-white/50">{label}</p>
                  <p className="mt-0.5 text-lg font-bold text-white">{count}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
          {people.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-white/40">
              <Users className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">No hay personas registradas con el líder <strong className="text-white/60">{leaderName}</strong>.</p>
              <p className="mt-1 text-xs text-white/30">Agrega personas desde el módulo de Personas.</p>
            </div>
          ) : (
            people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onViewResume={(url, name) => { setResumeUrl(url); setResumeName(name); }}
              />
            ))
          )}
        </div>
      </div>

      {/* Visor de HV */}
      {resumeUrl && (
        <ResumeViewer url={resumeUrl} name={resumeName} onClose={() => setResumeUrl(null)} />
      )}
    </div>
  );
}

/* ── Nodo del árbol ─────────────────────────────────────────────── */
type TreeNodeData = typeof leadershipTree;

function TreeNode({
  node,
  depth = 0,
  onSelectLeader,
}: {
  node: TreeNodeData;
  depth?: number;
  onSelectLeader: (name: string, title: string, municipality: string) => void;
}) {
  const [open, setOpen] = useState(depth === 0);
  const hasChildren = node.children.length > 0;
  const peopleCount = peopleSeed.filter(
    (p) => p.leaderName.toLowerCase().trim() === node.name.toLowerCase().trim()
  ).length;

  return (
    <div className={cn("space-y-2", depth > 0 && "ml-6 border-l border-white/15 pl-5")}>
      <Card className={cn("border-white/20 transition", depth === 0 ? "bg-white/[0.08]" : "bg-white/[0.05]")}>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {hasChildren && (
                <button
                  onClick={() => setOpen(!open)}
                  className="mt-0.5 shrink-0 rounded-lg border border-white/20 bg-white/10 p-1 text-white/70 hover:bg-white/20 transition"
                >
                  {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                </button>
              )}
              {!hasChildren && (
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Users className="h-3 w-3 text-white/40" />
                </span>
              )}
              <div>
                <p className="font-display text-base font-semibold text-white leading-tight">{node.name}</p>
                <p className="text-sm text-white/65">{node.title}</p>
              </div>
            </div>
            <Badge variant={node.influenceScore >= 90 ? "gold" : "emerald"}>{node.influenceScore}%</Badge>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border border-white/15 bg-white/[0.06] p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-white/50">Municipio</p>
              <p className="mt-0.5 font-medium text-white">{node.municipality}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/[0.06] p-2.5">
              <p className="text-[10px] uppercase tracking-wider text-white/50">Movilizados</p>
              <p className="mt-0.5 font-medium text-white">{node.peopleMobilized.toLocaleString("es-CO")}</p>
            </div>
          </div>

          {/* Botón ver personas */}
          <button
            onClick={() => onSelectLeader(node.name, node.title, node.municipality)}
            className="mt-3 flex w-full items-center justify-between rounded-xl border border-brand-gold/20 bg-brand-gold/8 px-3 py-2 text-sm text-brand-goldSoft hover:bg-brand-gold/15 transition"
          >
            <span className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              {peopleCount > 0 ? `Ver ${peopleCount} persona${peopleCount !== 1 ? "s" : ""}` : "Sin personas registradas"}
            </span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>

          {hasChildren && (
            <button
              onClick={() => setOpen(!open)}
              className="mt-2 text-xs text-white/45 hover:text-white transition"
            >
              {open ? `▲ Ocultar subnodos` : `▼ Ver ${node.children.length} subnodo${node.children.length !== 1 ? "s" : ""}`}
            </button>
          )}
        </div>
      </Card>

      {open && hasChildren && (
        <div className="space-y-2">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} onSelectLeader={onSelectLeader} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Componente principal ───────────────────────────────────────── */
export function TerritoryTree() {
  const [selectedLeader, setSelectedLeader] = useState<{ name: string; title: string; municipality: string } | null>(null);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <div className="space-y-3">
        <TreeNode
          node={leadershipTree}
          onSelectLeader={(name, title, municipality) => setSelectedLeader({ name, title, municipality })}
        />
      </div>

      <Card className="border-white/20 bg-white/[0.06]">
        <div className="p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-white/65">Estructura y cobertura</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-white">Influencia territorial</h3>
          <div className="mt-5 space-y-3">
            {territorySummary.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/20 bg-white/[0.06] px-4 py-3">
                <span className="text-sm text-white/80">{item.label}</span>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-brand-gold/15 bg-brand-gold/5 px-4 py-3 text-sm text-white/65">
            Haz clic en <span className="text-brand-goldSoft font-semibold">&quot;Ver personas&quot;</span> en cualquier nodo del árbol para consultar su listado completo.
          </div>
        </div>
      </Card>

      {selectedLeader && (
        <LeaderPeopleModal
          leaderName={selectedLeader.name}
          leaderTitle={selectedLeader.title}
          municipality={selectedLeader.municipality}
          onClose={() => setSelectedLeader(null)}
        />
      )}
    </div>
  );
}
