import { NextResponse } from "next/server";
import { z } from "zod";
import { toStorageRef } from "@/lib/files/storage-ref";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const maxResumeSize = 12 * 1024 * 1024;
const resumeBucket = "documentos-registro-publico";

const submissionSchema = z.object({
  fullName: z.string().min(3),
  documentNumber: z.string().optional().default(""),
  birthDate: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  whatsapp: z.string().optional().default(""),
  email: z.string().optional().default(""),
  type: z.enum(["supporter", "volunteer", "leader"]).default("supporter"),
  department: z.string().optional().default("Caldas"),
  municipality: z.string().optional().default(""),
  commune: z.string().optional().default(""),
  neighborhood: z.string().optional().default(""),
  address: z.string().optional().default(""),
  profession: z.string().optional().default(""),
  company: z.string().optional().default(""),
  jobTitle: z.string().optional().default(""),
  employmentStatus: z.string().optional().default(""),
  votingPlace: z.string().optional().default(""),
  votingTable: z.string().optional().default(""),
  leaderName: z.string().optional().default(""),
  message: z.string().optional().default(""),
  sourcePage: z.string().optional().default("/registro")
});

function clean(value: string | undefined) {
  const next = value?.trim();
  return next || null;
}

function cleanDate(value: string | undefined) {
  const next = value?.trim();
  return next && /^\d{4}-\d{2}-\d{2}$/.test(next) ? next : null;
}

function cleanSegment(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .toLowerCase();
}

async function ensureResumeBucket() {
  const admin = createSupabaseAdminClient();
  const { data: buckets, error: listError } = await admin.storage.listBuckets();

  if (listError) throw new Error(listError.message);
  if (buckets?.some((bucket) => bucket.name === resumeBucket)) return;

  const { error } = await admin.storage.createBucket(resumeBucket, {
    public: false,
    fileSizeLimit: maxResumeSize
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(error.message);
  }
}

async function uploadResume(file: File, documentNumber: string) {
  if (file.size > maxResumeSize) {
    throw new Error("La hoja de vida supera el tamaño máximo de 12 MB.");
  }

  await ensureResumeBucket();

  const admin = createSupabaseAdminClient();
  const owner = cleanSegment(documentNumber) || "sin-cedula";
  const fileName = cleanSegment(file.name) || `hoja-vida-${Date.now()}`;
  const path = `${owner}/${Date.now()}-${crypto.randomUUID()}-${fileName}`;
  const { error } = await admin.storage.from(resumeBucket).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false
  });

  if (error) throw new Error(error.message);
  return toStorageRef(resumeBucket, path);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get("resume");
    const fields = Object.fromEntries(
      Array.from(formData.entries())
        .filter(([key, value]) => key !== "resume" && typeof value === "string")
        .map(([key, value]) => [key, value])
    );

    const parsed = submissionSchema.safeParse(fields);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos", issues: parsed.error.flatten() }, { status: 400 });
    }

    const payload = parsed.data;
    const resumePath = resumeFile instanceof File && resumeFile.size > 0
      ? await uploadResume(resumeFile, payload.documentNumber)
      : null;

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("registros_publicos")
      .insert({
        full_name: payload.fullName.trim(),
        document_number: clean(payload.documentNumber),
        birth_date: cleanDate(payload.birthDate),
        phone: clean(payload.phone),
        whatsapp: clean(payload.whatsapp),
        email: clean(payload.email?.toLowerCase()),
        submission_type: payload.type,
        territory_name: clean(payload.municipality || payload.neighborhood || payload.commune),
        department: clean(payload.department) ?? "Caldas",
        municipality: clean(payload.municipality),
        commune: clean(payload.commune),
        neighborhood: clean(payload.neighborhood),
        address: clean(payload.address),
        profession: clean(payload.profession),
        company: clean(payload.company),
        job_title: clean(payload.jobTitle),
        employment_status: clean(payload.employmentStatus),
        voting_place: clean(payload.votingPlace),
        voting_table: clean(payload.votingTable),
        leader_name: clean(payload.leaderName),
        resume_path: resumePath,
        message: clean(payload.message),
        source_page: payload.sourcePage || "/registro",
        status: "pendiente",
        payload: {
          loaded_from: "public_intake_form",
          has_resume: Boolean(resumePath)
        }
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      throw new Error(error?.message ?? "No se pudo guardar el registro.");
    }

    return NextResponse.json({ ok: true, id: data.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo enviar el registro." },
      { status: 500 }
    );
  }
}
