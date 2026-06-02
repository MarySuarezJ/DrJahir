import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { toStorageRef } from "@/lib/files/storage-ref";
import type { AppRole } from "@/lib/types/roles";

export const runtime = "nodejs";

const writableRoles = new Set<AppRole>(["admin_principal", "secretaria"]);
const maxFileSize = 12 * 1024 * 1024;
const buckets = {
  photo: "fotos-persona",
  resume: "documentos-persona"
} as const;

type UploadKind = keyof typeof buckets;

function isUploadKind(value: FormDataEntryValue | null): value is UploadKind {
  return value === "photo" || value === "resume";
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

async function getWriteActor() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { response: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("perfiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.role || !writableRoles.has(profile.role as AppRole)) {
    return { response: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }

  return { userId: user.id };
}

async function ensureBucket(bucket: string) {
  const admin = createSupabaseAdminClient();
  const { data: existing, error: listError } = await admin.storage.listBuckets();

  if (listError) throw new Error(listError.message);
  if (existing?.some((item) => item.name === bucket)) return;

  const { error } = await admin.storage.createBucket(bucket, {
    public: false,
    fileSizeLimit: maxFileSize
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(error.message);
  }
}

export async function POST(request: Request) {
  const actor = await getWriteActor();
  if ("response" in actor) return actor.response;

  const formData = await request.formData();
  const kind = formData.get("kind");
  const file = formData.get("file");

  if (!isUploadKind(kind)) {
    return NextResponse.json({ error: "Tipo de archivo inválido." }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Archivo no recibido." }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ error: "El archivo supera el tamaño máximo de 12 MB." }, { status: 400 });
  }

  const bucket = buckets[kind];
  const admin = createSupabaseAdminClient();
  const documentNumber = cleanSegment(String(formData.get("documentNumber") ?? "")) || "sin-cedula";
  const safeName = cleanSegment(file.name) || `archivo-${Date.now()}`;
  const path = `${documentNumber}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  try {
    await ensureBucket(bucket);

    const { error: uploadError } = await admin.storage.from(bucket).upload(path, file, {
      contentType: file.type || undefined,
      upsert: false
    });

    if (uploadError) throw new Error(uploadError.message);

    const { data: signed, error: signedError } = await admin.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 7);
    if (signedError || !signed?.signedUrl) throw new Error(signedError?.message ?? "No se pudo preparar la vista previa.");

    return NextResponse.json({
      storageRef: toStorageRef(bucket, path),
      url: signed.signedUrl
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo subir el archivo." },
      { status: 500 }
    );
  }
}
