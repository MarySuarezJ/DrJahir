import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  login: z.string().min(2)
});

export async function POST(request: Request) {
  const payload = schema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const login = payload.data.login.trim().toLowerCase();

  if (login.includes("@")) {
    return NextResponse.json({ email: login });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("perfiles")
    .select("email")
    .eq("username", login)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data?.email) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 404 });
  }

  return NextResponse.json({ email: data.email });
}
