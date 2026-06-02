import { NextResponse } from "next/server";
import { parseStorageRef } from "@/lib/files/storage-ref";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function canViewFiles() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) return false;

  const { data: profile, error: profileError } = await supabase
    .from("perfiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return !profileError && Boolean(profile?.role);
}

export async function GET(request: Request) {
  const allowed = await canViewFiles();
  if (!allowed) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const url = new URL(request.url);
  const ref = url.searchParams.get("ref") ?? "";
  const parsed = parseStorageRef(ref);

  if (!parsed) {
    return NextResponse.json({ error: "Referencia de archivo inválida." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.storage.from(parsed.bucket).createSignedUrl(parsed.path, 60 * 10);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "No se pudo abrir el archivo." }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
