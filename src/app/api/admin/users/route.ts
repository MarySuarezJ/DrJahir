import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { appRoles } from "@/lib/types/roles";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  role: z.enum(appRoles),
  status: z.enum(["active", "paused"]).default("active")
});

export async function POST(request: Request) {
  const payload = createUserSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Datos inválidos", issues: payload.error.flatten() }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin_principal") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const admin = createSupabaseAdminClient();
  const { email, password, fullName, role, status } = payload.data;

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName
    }
  });

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? "No se pudo crear el usuario" }, { status: 400 });
  }

  const { error: upsertError } = await admin.from("profiles").upsert({
    id: created.user.id,
    email,
    full_name: fullName,
    role,
    status
  });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 400 });
  }

  return NextResponse.json({
    user: {
      id: created.user.id,
      email,
      fullName,
      role,
      status
    }
  });
}
