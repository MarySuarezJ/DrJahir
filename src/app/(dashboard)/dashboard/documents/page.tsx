"use client";

import { useMemo, useState } from "react";
import { Download, Eye, FileBadge, FileText, ImageIcon, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type DocumentRecord = {
  id: string;
  personName: string;
  documentNumber: string;
  profession: string;
  municipality: string;
  type: "pdf" | "image" | "doc";
  name: string;
  size: number;
  uploadedAt: string;
  url: string;
};

const seedDocuments: DocumentRecord[] = [
  {
    id: "doc-1",
    personName: "Camila López",
    documentNumber: "1002003001",
    profession: "Psicóloga",
    municipality: "Manizales",
    type: "pdf",
    name: "hoja_vida_camila_lopez.pdf",
    size: 342000,
    uploadedAt: "Hace 12 min",
    url: "/templates/carga-masiva-dr-jahir.xlsx"
  },
  {
    id: "doc-2",
    personName: "Laura García",
    documentNumber: "1002458891",
    profession: "Médica",
    municipality: "Manizales",
    type: "image",
    name: "foto_perfil_laura_garcia.jpg",
    size: 187000,
    uploadedAt: "Hace 25 min",
    url: "/Logo.png"
  },
  {
    id: "doc-3",
    personName: "Jhon Ramírez",
    documentNumber: "1006688123",
    profession: "Líder comunitario",
    municipality: "Riosucio",
    type: "pdf",
    name: "soporte_politico_jhon.pdf",
    size: 215000,
    uploadedAt: "Hace 1 h",
    url: "/templates/carga-masiva-dr-jahir.xlsx"
  }
];

function formatSize(bytes: number) {
  return bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`;
}

function iconForType(type: DocumentRecord["type"]) {
  if (type === "image") return <ImageIcon className="h-4 w-4" />;
  if (type === "pdf") return <FileBadge className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
}

function DocumentViewer({ document, onClose }: { document: DocumentRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-ink/76 p-4 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-[24px] border border-brand-line bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-brand-line px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-brand-muted">Vista previa</p>
            <h3 className="mt-1 font-display text-xl font-semibold text-brand-ink">{document.name}</h3>
            <p className="mt-0.5 text-sm text-brand-ink/62">{document.personName} · {document.profession}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={document.url}
              download
              className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-brand-line bg-brand-cream px-4 text-sm font-semibold text-brand-ink transition hover:bg-brand-beige"
            >
              <Download className="h-4 w-4" />
              Descargar
            </a>
            <button onClick={onClose} className="rounded-xl border border-brand-line bg-white p-2 text-brand-muted transition hover:bg-brand-cream hover:text-brand-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 bg-brand-cream/60">
          {document.type === "image" ? (
            <div className="flex h-full items-center justify-center overflow-auto p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={document.url} alt={document.name} className="max-h-full max-w-full rounded-2xl object-contain shadow-panel" />
            </div>
          ) : (
            <iframe src={document.url} title={document.name} className="h-full w-full border-0" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const [query, setQuery] = useState("");
  const [profession, setProfession] = useState("all");
  const [type, setType] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);

  const professions = useMemo(() => Array.from(new Set(seedDocuments.map((document) => document.profession))), []);
  const filtered = useMemo(() => {
    const clean = query.trim().toLowerCase();

    return seedDocuments.filter((document) => {
      const haystack = `${document.personName} ${document.documentNumber} ${document.profession} ${document.municipality} ${document.name}`.toLowerCase();
      const matchesQuery = !clean || haystack.includes(clean);
      const matchesProfession = profession === "all" || document.profession === profession;
      const matchesType = type === "all" || document.type === type;
      return matchesQuery && matchesProfession && matchesType;
    });
  }, [profession, query, type]);

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="gold">Archivo documental</Badge>
        <h2 className="mt-3 font-display text-4xl font-semibold text-brand-ink">Hojas de vida y soportes</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-brand-ink/72 sm:text-base">
          Consulta documentos por persona, profesión, municipio y tipo de archivo antes de descargarlos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">Filtros</p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-brand-ink">Buscar hojas de vida</h3>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-[1fr_260px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-11" placeholder="Buscar por nombre, cédula, municipio o archivo" />
          </div>
          <Select value={profession} onChange={(event) => setProfession(event.target.value)}>
            <option value="all">Todas las profesiones</option>
            {professions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
          <Select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">Todos los tipos</option>
            <option value="pdf">PDF</option>
            <option value="image">Imagen</option>
            <option value="doc">Documento</option>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">Resultados</p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-brand-ink">{filtered.length} documento{filtered.length !== 1 ? "s" : ""}</h3>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map((document) => (
            <div key={document.id} className="grid gap-4 rounded-2xl border border-brand-line bg-white/74 p-4 lg:grid-cols-[1fr_0.9fr_auto] lg:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-line bg-brand-cream text-brand-ink">
                  {iconForType(document.type)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-brand-ink">{document.name}</p>
                  <p className="mt-0.5 text-xs text-brand-ink/58">{formatSize(document.size)} · {document.uploadedAt}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-brand-ink">{document.personName}</p>
                <p className="mt-0.5 text-sm text-brand-ink/62">CC {document.documentNumber} · {document.profession} · {document.municipality}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <Badge variant={document.type === "pdf" ? "gold" : document.type === "image" ? "emerald" : "neutral"}>
                  {document.type.toUpperCase()}
                </Badge>
                <Button variant="primary" size="sm" onClick={() => setSelectedDocument(document)}>
                  <Eye className="h-4 w-4" />
                  Ver
                </Button>
                <a
                  href={document.url}
                  download
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-brand-line bg-white px-4 text-sm font-semibold text-brand-ink transition hover:bg-brand-cream"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </a>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedDocument && <DocumentViewer document={selectedDocument} onClose={() => setSelectedDocument(null)} />}
    </div>
  );
}
