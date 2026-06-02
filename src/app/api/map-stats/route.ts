import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type MunicipalityRow = {
  id: string;
  name: string;
  support_score: number | string | null;
};

type PersonRow = {
  kind: string | null;
  support_label: string | null;
  support_score: number | string | null;
  employment_status: string | null;
  municipality_id: string | null;
};

function normalizeNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isLeader(row: PersonRow) {
  const label = `${row.kind ?? ""} ${row.support_label ?? ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  return label.includes("leader") || label.includes("lider");
}

export async function GET() {
  try {
    const admin = createSupabaseAdminClient();
    const [{ data: municipalityData, error: municipalityError }, { data: peopleData, error: peopleError }] = await Promise.all([
      admin.from("municipios").select("id,name,support_score"),
      admin.from("personas").select("kind,support_label,support_score,employment_status,municipality_id")
    ]);

    if (municipalityError) return NextResponse.json({ error: municipalityError.message }, { status: 500 });
    if (peopleError) return NextResponse.json({ error: peopleError.message }, { status: 500 });

    const municipalities = (municipalityData ?? []) as MunicipalityRow[];
    const people = (peopleData ?? []) as PersonRow[];
    const grouped = new Map(
      municipalities.map((municipality) => [
        municipality.id,
        {
          municipality: municipality.name,
          supportTotal: 0,
          supportSeed: normalizeNumber(municipality.support_score),
          supportCount: 0,
          voters: 0,
          leaders: 0,
          employed: 0,
          unemployed: 0
        }
      ])
    );

    people.forEach((person) => {
      if (!person.municipality_id) return;

      const current = grouped.get(person.municipality_id);
      if (!current) return;

      current.voters += 1;
      current.supportTotal += normalizeNumber(person.support_score);
      current.supportCount += 1;
      if (isLeader(person)) current.leaders += 1;
      if (person.employment_status === "empleado") current.employed += 1;
      if (person.employment_status === "desempleado") current.unemployed += 1;
    });

    const stats = Array.from(grouped.values()).map((item) => ({
      municipality: item.municipality,
      supportPercent: Math.round(item.supportCount > 0 ? item.supportTotal / item.supportCount : item.supportSeed),
      voters: item.voters,
      leaders: item.leaders,
      employed: item.employed,
      unemployed: item.unemployed
    }));

    return NextResponse.json({ stats });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudieron cargar métricas del mapa." }, { status: 500 });
  }
}
