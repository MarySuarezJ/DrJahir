"use client";

import { useRef, useState } from "react";
import { FileUp, Trash2, Download, FileText, ImageIcon, FileBadge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type UploadedFile = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  bucket: string;
};

const seedFiles: UploadedFile[] = [
  { id: "f1", name: "hoja_vida_camila_lopez.pdf",   size: 342000, type: "pdf",   uploadedAt: "Hace 12 min", bucket: "personas" },
  { id: "f2", name: "foto_perfil_laura_garcia.jpg",  size: 187000, type: "image", uploadedAt: "Hace 25 min", bucket: "personas" },
  { id: "f3", name: "soporte_politico_jhon.pdf",     size: 215000, type: "pdf",   uploadedAt: "Hace 1 h",   bucket: "lideres"  },
];

function fileIcon(type: string) {
  if (type === "image") return <ImageIcon className="h-5 w-5" />;
  if (type === "pdf")   return <FileBadge className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

function formatSize(bytes: number) {
  return bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`;
}

function detectBucket(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("hoja") || lower.includes("foto")) return "personas";
  if (lower.includes("lider") || lower.includes("soporte")) return "lideres";
  if (lower.includes("legal") || lower.includes("contrato")) return "legal";
  return "campanas";
}

function detectType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg","jpeg","png","webp"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  return "doc";
}

const BUCKETS = ["personas", "lideres", "campanas", "legal"];

export default function DocumentsPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>(seedFiles);
  const [dragging, setDragging] = useState(false);
  const [bucketFilter, setBucketFilter] = useState("all");

  function addFiles(raw: FileList | null) {
    if (!raw) return;
    const next: UploadedFile[] = Array.from(raw).map((f) => ({
      id: `f-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: f.size,
      type: detectType(f.name),
      uploadedAt: "Ahora",
      bucket: detectBucket(f.name),
    }));
    setFiles((prev) => [...next, ...prev]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  const filtered = bucketFilter === "all" ? files : files.filter((f) => f.bucket === bucketFilter);

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="gold">Gestión documental</Badge>
        <h2 className="mt-3 font-display text-4xl font-semibold text-white">Hojas de vida, PDFs y fotos</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/75 sm:text-base">
          Carga, organiza y accede a documentos por persona o líder. Preparado para Supabase Storage.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Zona de carga */}
        <Card className="border-white/20 bg-white/[0.06]">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.28em] text-white/65">Carga de documentos</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-white">Arrastrar y soltar</h3>
          </CardHeader>
          <CardContent>
            <div
              className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
                dragging ? "border-brand-gold bg-brand-gold/10" : "border-white/20 bg-white/[0.04] hover:border-white/35 hover:bg-white/[0.07]"
              }`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-goldSoft">
                <FileUp className="h-6 w-6" />
              </span>
              <p className="mt-4 font-semibold text-white">Suelta archivos aquí o haz clic</p>
              <p className="mt-1 text-sm text-white/65">PDF, JPG, PNG, DOCX — sin límite en modo demo</p>
              <Button variant="gold" size="sm" className="mt-5" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                Seleccionar archivos
              </Button>
            </div>
            <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" onChange={(e) => addFiles(e.target.files)} />

            <div className="mt-5 grid grid-cols-4 gap-3 text-sm">
              {[
                ["Total", String(files.length)],
                ["PDFs", String(files.filter((f) => f.type === "pdf").length)],
                ["Imágenes", String(files.filter((f) => f.type === "image").length)],
                ["Otros", String(files.filter((f) => f.type === "doc").length)],
              ].map(([label, val]) => (
                <div key={label} className="rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2.5 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-white/50">{label}</p>
                  <p className="mt-0.5 text-xl font-bold text-white">{val}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Buckets */}
        <Card className="border-white/20 bg-white/[0.06]">
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.28em] text-white/65">Filtrar por carpeta</p>
            <h3 className="mt-1 font-display text-xl font-semibold text-white">Buckets de almacenamiento</h3>
          </CardHeader>
          <CardContent className="space-y-2">
            <button
              onClick={() => setBucketFilter("all")}
              className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${bucketFilter === "all" ? "border-brand-gold/30 bg-brand-gold/10 text-white" : "border-white/15 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]"}`}
            >
              <span className="font-medium">Todos los archivos</span>
              <Badge variant="neutral">{files.length}</Badge>
            </button>
            {BUCKETS.map((b) => (
              <button
                key={b}
                onClick={() => setBucketFilter(b)}
                className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition ${bucketFilter === b ? "border-brand-gold/30 bg-brand-gold/10 text-white" : "border-white/15 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]"}`}
              >
                <span className="capitalize font-medium">{b}</span>
                <Badge variant="neutral">{files.filter((f) => f.bucket === b).length}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Lista de archivos */}
      <Card className="border-white/20 bg-white/[0.06]">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.28em] text-white/65">Archivos cargados</p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-white">{filtered.length} archivo{filtered.length !== 1 ? "s" : ""}</h3>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/45">No hay archivos en esta carpeta todavía.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((f) => (
                <div key={f.id} className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] text-white/70">
                    {fileIcon(f.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{f.name}</p>
                    <p className="mt-0.5 text-xs text-white/55">{formatSize(f.size)} · {f.bucket} · {f.uploadedAt}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={f.type === "pdf" ? "gold" : f.type === "image" ? "emerald" : "neutral"}>
                      {f.type.toUpperCase()}
                    </Badge>
                    <button className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition">
                      <Download className="h-4 w-4" />
                    </button>
                    <button onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))} className="rounded-lg p-1.5 text-white/40 hover:bg-rose-500/10 hover:text-rose-400 transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
