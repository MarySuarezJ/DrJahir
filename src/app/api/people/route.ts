import { NextResponse } from "next/server";
import { z } from "zod";
import type { PersonRecord } from "@/lib/types/domain";
import type { AppRole } from "@/lib/types/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Actor = {
  userId: string;
  role: AppRole;
};

type DbPerson = {
  id: string;
  kind: string;
  leader_id: string | null;
  first_name: string;
  last_name: string;
  document_number: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  barrio: string | null;
  comuna: string | null;
  municipality_id: string | null;
  commune_id: string | null;
  neighborhood_id: string | null;
  department_id: string | null;
  profession: string | null;
  company: string | null;
  job_title: string | null;
  employment_status: PersonRecord["employmentStatus"];
  voting_center_id: string | null;
  voting_table_id: string | null;
  photo_path: string | null;
  resume_path: string | null;
  notes: string | null;
  support_label: string;
  support_score: number | string | null;
  visibility_scope: PersonRecord["visibilityScope"];
};

type DbLeader = {
  id: string;
  person_id: string;
  title: string;
};

type IdName = {
  id: string;
  name: string;
};

const writableRoles = new Set<AppRole>(["admin_principal", "secretaria"]);

const personSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  documentNumber: z.string().min(3),
  phone: z.string().optional().default(""),
  whatsapp: z.string().optional().default(""),
  email: z.string().optional().default(""),
  address: z.string().optional().default(""),
  barrio: z.string().optional().default(""),
  comuna: z.string().optional().default(""),
  municipality: z.string().optional().default(""),
  department: z.string().optional().default(""),
  profession: z.string().optional().default(""),
  company: z.string().optional().default(""),
  jobTitle: z.string().optional().default(""),
  employmentStatus: z.enum(["empleado", "desempleado", "independiente", "estudiante", "pensionado"]).default("empleado"),
  votingPlace: z.string().optional().default(""),
  votingTable: z.string().optional().default(""),
  leaderName: z.string().optional().default(""),
  leaderDocumentNumber: z.string().optional().default(""),
  leaderSector: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  photoPath: z.string().optional().default(""),
  resumePath: z.string().optional().default(""),
  supportLabel: z.string().optional().default("Simpatizante"),
  supportScore: z.coerce.number().min(0).max(100).default(0),
  tags: z.array(z.string()).optional().default([]),
  visibilityScope: z.enum(["public", "operational", "legal", "restricted"]).default("operational")
});

function isLeaderLabel(label: string) {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .includes("lider");
}

function personKindFromSupportLabel(label: string) {
  const clean = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (clean.includes("lider")) return "leader";
  if (clean.includes("volunt")) return "volunteer";
  if (clean.includes("vot")) return "voter";

  return "supporter";
}

function cleanText(value: string | undefined) {
  const clean = (value ?? "").trim();
  return clean || null;
}

function nameFromMap(map: Map<string, string>, id: string | null | undefined) {
  return id ? map.get(id) ?? "" : "";
}

function leaderSectorFromTitle(title: string) {
  return title.replace(/^líder\s+/i, "").replace(/^lider\s+/i, "").trim();
}

async function getActor(): Promise<{ actor: Actor } | { response: NextResponse }> {
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

  if (profileError || !profile?.role) {
    return { response: NextResponse.json({ error: "Perfil no configurado" }, { status: 403 }) };
  }

  return { actor: { userId: user.id, role: profile.role as AppRole } };
}

async function fetchIdNameMap(table: "departamentos" | "municipios" | "comunas" | "barrios", ids: string[]) {
  if (ids.length === 0) return new Map<string, string>();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from(table).select("id,name").in("id", ids);

  if (error) throw new Error(error.message);

  return new Map((data as IdName[]).map((item) => [item.id, item.name]));
}

async function fetchVotingCenterMap(ids: string[]) {
  if (ids.length === 0) return new Map<string, string>();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("puestos_votacion").select("id,name").in("id", ids);

  if (error) throw new Error(error.message);

  return new Map((data as IdName[]).map((item) => [item.id, item.name]));
}

async function fetchVotingTableMap(ids: string[]) {
  if (ids.length === 0) return new Map<string, string>();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("mesas_votacion").select("id,table_number").in("id", ids);

  if (error) throw new Error(error.message);

  return new Map((data as Array<{ id: string; table_number: string }>).map((item) => [item.id, item.table_number]));
}

function uniqueIds(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

export async function GET() {
  const actor = await getActor();
  if ("response" in actor) return actor.response;

  const admin = createSupabaseAdminClient();
  const { data: peopleRows, error: peopleError } = await admin
    .from("personas")
    .select(
      "id,kind,leader_id,first_name,last_name,document_number,phone,whatsapp,email,address,barrio,comuna,municipality_id,commune_id,neighborhood_id,department_id,profession,company,job_title,employment_status,voting_center_id,voting_table_id,photo_path,resume_path,notes,support_label,support_score,visibility_scope"
    )
    .order("created_at", { ascending: false });

  if (peopleError) return NextResponse.json({ error: peopleError.message }, { status: 500 });

  const rows = (peopleRows ?? []) as DbPerson[];
  const [departmentMap, municipalityMap, communeMap, neighborhoodMap, votingCenterMap, votingTableMap] = await Promise.all([
    fetchIdNameMap("departamentos", uniqueIds(rows.map((row) => row.department_id))),
    fetchIdNameMap("municipios", uniqueIds(rows.map((row) => row.municipality_id))),
    fetchIdNameMap("comunas", uniqueIds(rows.map((row) => row.commune_id))),
    fetchIdNameMap("barrios", uniqueIds(rows.map((row) => row.neighborhood_id))),
    fetchVotingCenterMap(uniqueIds(rows.map((row) => row.voting_center_id))),
    fetchVotingTableMap(uniqueIds(rows.map((row) => row.voting_table_id)))
  ]);

  const { data: leaderRows, error: leaderError } = await admin.from("lideres").select("id,person_id,title");
  if (leaderError) return NextResponse.json({ error: leaderError.message }, { status: 500 });

  const { data: tagRows, error: tagError } = await admin.from("etiquetas_persona").select("person_id,tag");
  if (tagError) return NextResponse.json({ error: tagError.message }, { status: 500 });

  const peopleById = new Map(rows.map((row) => [row.id, row]));
  const leadersById = new Map((leaderRows as DbLeader[] | null ?? []).map((leader) => [leader.id, leader]));
  const leadersByPersonId = new Map((leaderRows as DbLeader[] | null ?? []).map((leader) => [leader.person_id, leader]));
  const tagsByPersonId = new Map<string, string[]>();

  (tagRows as Array<{ person_id: string; tag: string }> | null ?? []).forEach((row) => {
    tagsByPersonId.set(row.person_id, [...(tagsByPersonId.get(row.person_id) ?? []), row.tag]);
  });

  const people: PersonRecord[] = rows.map((row) => {
    const leader = row.leader_id ? leadersById.get(row.leader_id) : undefined;
    const leaderPerson = leader ? peopleById.get(leader.person_id) : undefined;
    const ownLeaderRecord = leadersByPersonId.get(row.id);

    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      documentNumber: row.document_number,
      phone: row.phone ?? "",
      whatsapp: row.whatsapp ?? "",
      email: row.email ?? "",
      address: row.address ?? "",
      barrio: row.barrio ?? nameFromMap(neighborhoodMap, row.neighborhood_id),
      comuna: row.comuna ?? nameFromMap(communeMap, row.commune_id),
      municipality: nameFromMap(municipalityMap, row.municipality_id),
      department: nameFromMap(departmentMap, row.department_id),
      profession: row.profession ?? "",
      company: row.company ?? "",
      jobTitle: row.job_title ?? "",
      employmentStatus: row.employment_status,
      votingPlace: nameFromMap(votingCenterMap, row.voting_center_id),
      votingTable: nameFromMap(votingTableMap, row.voting_table_id),
      leaderName: leaderPerson ? `${leaderPerson.first_name} ${leaderPerson.last_name}`.trim() : "",
      leaderDocumentNumber: leaderPerson?.document_number ?? "",
      leaderSector: ownLeaderRecord ? leaderSectorFromTitle(ownLeaderRecord.title) : "",
      notes: row.notes ?? "",
      photoPath: row.photo_path ?? "",
      resumePath: row.resume_path ?? "",
      supportLabel: row.support_label,
      supportScore: Number(row.support_score ?? 0),
      tags: tagsByPersonId.get(row.id) ?? [],
      visibilityScope: row.visibility_scope
    };
  });

  return NextResponse.json({ people });
}

async function ensureDepartment(name: string) {
  if (!name) return null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("departamentos")
    .upsert({ name }, { onConflict: "name" })
    .select("id")
    .single();

  if (error || !data?.id) throw new Error(error?.message ?? `No se pudo cargar el departamento ${name}`);
  return data.id as string;
}

async function ensureMunicipality(departmentId: string | null, name: string) {
  if (!departmentId || !name) return null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("municipios")
    .upsert({ department_id: departmentId, name }, { onConflict: "department_id,name" })
    .select("id")
    .single();

  if (error || !data?.id) throw new Error(error?.message ?? `No se pudo cargar el municipio ${name}`);
  return data.id as string;
}

async function ensureCommune(municipalityId: string | null, name: string) {
  if (!municipalityId || !name) return null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("comunas")
    .upsert({ municipality_id: municipalityId, name }, { onConflict: "municipality_id,name" })
    .select("id")
    .single();

  if (error || !data?.id) throw new Error(error?.message ?? `No se pudo cargar la comuna/zona ${name}`);
  return data.id as string;
}

async function ensureNeighborhood(communeId: string | null, name: string) {
  if (!communeId || !name) return null;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("barrios")
    .upsert({ commune_id: communeId, name }, { onConflict: "commune_id,name" })
    .select("id")
    .single();

  if (error || !data?.id) throw new Error(error?.message ?? `No se pudo cargar el barrio/vereda ${name}`);
  return data.id as string;
}

async function findLeaderIdByDocument(documentNumber: string) {
  if (!documentNumber) return null;

  const admin = createSupabaseAdminClient();
  const { data: person, error: personError } = await admin
    .from("personas")
    .select("id")
    .eq("document_number", documentNumber)
    .maybeSingle();

  if (personError || !person?.id) return null;

  const { data: leader, error: leaderError } = await admin
    .from("lideres")
    .select("id")
    .eq("person_id", person.id)
    .maybeSingle();

  if (leaderError || !leader?.id) return null;
  return leader.id as string;
}

export async function POST(request: Request) {
  const actor = await getActor();
  if ("response" in actor) return actor.response;
  if (!writableRoles.has(actor.actor.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const payload = personSchema.safeParse(await request.json());
  if (!payload.success) {
    return NextResponse.json({ error: "Datos inválidos", issues: payload.error.flatten() }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const person = payload.data;
    const departmentId = await ensureDepartment(person.department || "Caldas");
    const municipalityId = await ensureMunicipality(departmentId, person.municipality);
    const communeId = await ensureCommune(municipalityId, person.comuna);
    const neighborhoodId = await ensureNeighborhood(communeId, person.barrio);
    const leaderId = isLeaderLabel(person.supportLabel) ? null : await findLeaderIdByDocument(person.leaderDocumentNumber);

    const { data: savedPerson, error: personError } = await admin
      .from("personas")
      .upsert(
        {
          kind: personKindFromSupportLabel(person.supportLabel),
          leader_id: leaderId,
          first_name: person.firstName.trim(),
          last_name: person.lastName.trim(),
          document_number: person.documentNumber.trim(),
          phone: cleanText(person.phone),
          whatsapp: cleanText(person.whatsapp),
          email: cleanText(person.email?.toLowerCase()),
          address: cleanText(person.address),
          barrio: cleanText(person.barrio),
          comuna: cleanText(person.comuna),
          municipality_id: municipalityId,
          commune_id: communeId,
          neighborhood_id: neighborhoodId,
          department_id: departmentId,
          profession: cleanText(person.profession),
          company: cleanText(person.company),
          job_title: cleanText(person.jobTitle),
          employment_status: person.employmentStatus,
          photo_path: cleanText(person.photoPath),
          resume_path: cleanText(person.resumePath),
          notes: cleanText(person.notes),
          support_label: person.supportLabel,
          support_score: person.supportScore,
          visibility_scope: person.visibilityScope
        },
        { onConflict: "document_number" }
      )
      .select("id")
      .single();

    if (personError || !savedPerson?.id) throw new Error(personError?.message ?? "No se pudo guardar la persona.");

    if (isLeaderLabel(person.supportLabel)) {
      const { error } = await admin.from("lideres").upsert(
        {
          person_id: savedPerson.id,
          title: person.leaderSector ? `Líder ${person.leaderSector}` : "Líder",
          influence_score: person.supportScore,
          active: true
        },
        { onConflict: "person_id" }
      );
      if (error) throw new Error(error.message);
    } else {
      const { error } = await admin.from("lideres").delete().eq("person_id", savedPerson.id);
      if (error) throw new Error(error.message);
    }

    const { error: clearTagsError } = await admin.from("etiquetas_persona").delete().eq("person_id", savedPerson.id);
    if (clearTagsError) throw new Error(clearTagsError.message);

    const tags = Array.from(new Set(person.tags.map((tag) => tag.trim()).filter(Boolean)));
    if (tags.length > 0) {
      const { error: tagError } = await admin.from("etiquetas_persona").insert(tags.map((tag) => ({ person_id: savedPerson.id, tag })));
      if (tagError) throw new Error(tagError.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo guardar la persona." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const actor = await getActor();
  if ("response" in actor) return actor.response;
  if (actor.actor.role !== "admin_principal") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const payload = z.object({ documentNumber: z.string().min(3) }).safeParse(await request.json());
  if (!payload.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("personas").delete().eq("document_number", payload.data.documentNumber);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
