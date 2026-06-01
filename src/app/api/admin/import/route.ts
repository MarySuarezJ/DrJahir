import { NextResponse } from "next/server";
import { z } from "zod";
import { parseImportPayload } from "@/lib/admin/import-format";
import { importAdminWorkbook } from "@/lib/admin/import-service";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const rowSchema = z.record(z.unknown());

const importRequestSchema = z.object({
  fileName: z.string().min(1),
  territoryRows: z.array(rowSchema).default([]),
  peopleRows: z.array(rowSchema).default([]),
  importantDateRows: z.array(rowSchema).default([])
});

async function getAdminActor(request: Request) {
  if (process.env.NODE_ENV !== "production" && request.headers.get("x-demo-role") === "admin_principal") {
    return { userId: null };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin_principal") {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) };
  }

  return { userId: user.id };
}

export async function POST(request: Request) {
  const parsedBody = importRequestSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return NextResponse.json({ error: "Archivo inválido", issues: parsedBody.error.flatten() }, { status: 400 });
  }

  const actor = await getAdminActor(request);
  if ("error" in actor) return actor.error;

  const parsedWorkbook = parseImportPayload(parsedBody.data);

  if (parsedWorkbook.totalRows === 0) {
    return NextResponse.json({ error: "El archivo no tiene filas para importar." }, { status: 400 });
  }

  if (parsedWorkbook.issues.length > 0) {
    return NextResponse.json(
      {
        error: "Hay filas por corregir antes de importar.",
        issues: parsedWorkbook.issues,
        summary: {
          territoryRows: parsedWorkbook.territoryRows.length,
          peopleRows: parsedWorkbook.peopleRows.length,
          importantDateRows: parsedWorkbook.importantDateRows.length
        }
      },
      { status: 422 }
    );
  }

  try {
    const supabaseAdmin = createSupabaseAdminClient();
    const result = await importAdminWorkbook(supabaseAdmin, parsedWorkbook, actor.userId);

    return NextResponse.json({
      fileName: parsedBody.data.fileName,
      result,
      message: "Importación completada."
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo completar la importación."
      },
      { status: 500 }
    );
  }
}
