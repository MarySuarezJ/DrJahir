"use client";

import { useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  importSheetNames,
  importTemplatePath,
  normalizeImportKey,
  parseImportPayload,
  type ImportIssue,
  type ImportPayload,
  type ImportRow,
  type ParsedImport
} from "@/lib/admin/import-format";
import type { AppRole } from "@/lib/types/roles";
import { cn } from "@/lib/utils";

type WorkbookSheet = {
  sheet: string;
  data: unknown[][];
};

type ImportStatus =
  | { type: "idle"; message: string }
  | { type: "loading"; message: string }
  | { type: "success"; message: string }
  | { type: "error"; message: string; issues?: ImportIssue[] };

type ImportPreview = {
  payload: ImportPayload;
  parsed: ParsedImport;
};

function findSheet(workbook: WorkbookSheet[], expectedName: string) {
  const expected = normalizeImportKey(expectedName);
  return workbook.find((item) => normalizeImportKey(item.sheet) === expected);
}

function rowsFromSheet(workbook: WorkbookSheet[], expectedName: string): ImportRow[] {
  const sheet = findSheet(workbook, expectedName);
  if (!sheet) return [];

  const [headerRow, ...dataRows] = sheet.data;
  if (!headerRow) return [];

  const headers = headerRow.map((value) => String(value ?? "").trim());

  return dataRows.map((cells, index) => {
    const row: ImportRow = { __rowNumber: index + 2 };

    headers.forEach((header, cellIndex) => {
      if (header) row[header] = cells[cellIndex] ?? "";
    });

    return row;
  });
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-brand-line bg-white/72 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-brand-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-brand-ink">{value}</p>
    </div>
  );
}

export function ExcelImportPanel({ role }: { role: AppRole }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [status, setStatus] = useState<ImportStatus>({
    type: "idle",
    message: "Descarga la plantilla, llénala en Excel y súbela desde este panel."
  });

  const canImport = role === "admin_principal";
  const hasBlockingIssues = (preview?.parsed.issues.length ?? 0) > 0;
  const totalRows = preview?.parsed.totalRows ?? 0;

  const visibleIssues = useMemo<ImportIssue[]>(() => {
    if (preview) return preview.parsed.issues.slice(0, 5);
    if (status.type === "error") return status.issues?.slice(0, 5) ?? [];
    return [];
  }, [preview, status]);

  async function handleFile(file: File) {
    setStatus({ type: "loading", message: "Leyendo archivo de Excel..." });

    try {
      const readExcelFile = (await import("read-excel-file/browser")).default as (input: File) => Promise<WorkbookSheet[]>;
      const workbook = await readExcelFile(file);
      const payload: ImportPayload = {
        fileName: file.name,
        territoryRows: rowsFromSheet(workbook, importSheetNames.territory),
        peopleRows: rowsFromSheet(workbook, importSheetNames.people),
        importantDateRows: rowsFromSheet(workbook, importSheetNames.importantDates)
      };
      const parsed = parseImportPayload(payload);

      setPreview({ payload, parsed });

      if (parsed.totalRows === 0) {
        setStatus({ type: "error", message: "No encontré filas para importar. Revisa que existan las hojas Territorio o Personas." });
        return;
      }

      if (parsed.issues.length > 0) {
        setStatus({ type: "error", message: "Hay filas por corregir antes de cargar a Supabase.", issues: parsed.issues });
        return;
      }

      setStatus({ type: "success", message: "Archivo leído. Revisa el resumen y confirma la importación." });
    } catch (error) {
      setPreview(null);
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "No pude leer el archivo. Usa la plantilla .xlsx descargable."
      });
    }
  }

  async function sendImport() {
    if (!preview || hasBlockingIssues || !canImport) return;

    setStatus({ type: "loading", message: "Cargando datos en Supabase..." });

    const response = await fetch("/api/admin/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-local-role": role
      },
      body: JSON.stringify(preview.payload)
    });
    const data = (await response.json()) as { message?: string; error?: string; issues?: ImportIssue[] };

    if (!response.ok) {
      setStatus({
        type: "error",
        message: data.error ?? "No se pudo completar la importación.",
        issues: data.issues
      });
      return;
    }

    setStatus({ type: "success", message: data.message ?? "Importación completada." });
  }

  return (
    <Card className="border-brand-emerald/20 bg-white/78">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-brand-emerald" />
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-brand-muted">Carga masiva</p>
              <h3 className="mt-1 font-display text-2xl font-semibold text-brand-ink">Excel para territorio y personas</h3>
            </div>
          </div>
          <a
            href={importTemplatePath}
            download
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-brand-line bg-white px-5 text-sm font-semibold text-brand-ink shadow-sm transition hover:border-brand-gold/35 hover:bg-brand-cream"
          >
            <Download className="h-4 w-4" />
            Descargar plantilla
          </a>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={!canImport || status.type === "loading"}
            className={cn(
              "flex min-h-36 flex-col items-center justify-center rounded-3xl border border-dashed border-brand-gold/35 bg-brand-cream/55 px-6 py-8 text-center transition",
              canImport ? "hover:border-brand-gold hover:bg-brand-gold/12" : "cursor-not-allowed opacity-55"
            )}
          >
            {status.type === "loading" ? <Loader2 className="h-8 w-8 animate-spin text-brand-gold" /> : <UploadCloud className="h-8 w-8 text-brand-gold" />}
            <span className="mt-3 text-sm font-semibold text-brand-ink">Subir archivo .xlsx</span>
            <span className="mt-1 text-xs leading-5 text-brand-ink/62">Solo administradores principales pueden cargar datos a la base.</span>
          </button>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <SummaryPill label="Territorio" value={preview?.parsed.territoryRows.length ?? 0} />
            <SummaryPill label="Personas" value={preview?.parsed.peopleRows.length ?? 0} />
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void handleFile(file);
          }}
        />

        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm",
            status.type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
            status.type === "error" && "border-rose-200 bg-rose-50 text-rose-800",
            status.type === "loading" && "border-brand-gold/25 bg-brand-gold/10 text-brand-ink",
            status.type === "idle" && "border-brand-line bg-white/72 text-brand-ink/70"
          )}
        >
          <div className="flex items-start gap-2">
            {status.type === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : status.type === "error" ? <AlertCircle className="mt-0.5 h-4 w-4" /> : null}
            <div>
              <p>{status.message}</p>
              {preview && (
                <p className="mt-1 text-xs opacity-75">
                  {preview.payload.fileName} · {totalRows} fila{totalRows === 1 ? "" : "s"} detectada{totalRows === 1 ? "" : "s"}
                </p>
              )}
            </div>
          </div>
        </div>

        {visibleIssues.length > 0 && (
          <div className="space-y-2">
            {visibleIssues.map((issue) => (
              <div key={`${issue.sheet}-${issue.rowNumber}-${issue.message}`} className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm text-rose-800">
                <span className="font-semibold">{issue.sheet}, fila {issue.rowNumber}:</span> {issue.message}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Badge variant="emerald">Upsert seguro</Badge>
            <Badge variant="neutral">Evita duplicar cédulas</Badge>
            <Badge variant="gold">Crea barrios y veredas</Badge>
          </div>
          <Button variant="emerald" onClick={() => void sendImport()} disabled={!preview || !canImport || hasBlockingIssues || status.type === "loading"}>
            {status.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            Cargar a Supabase
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
