import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ParsedImport,
  ParsedPersonRow,
  ParsedTerritoryRow
} from "@/lib/admin/import-format";

type ImportResult = {
  territoryRows: number;
  peopleRows: number;
  importantDateRows: number;
  tagsRows: number;
  leadersRows: number;
};

type TerritoryIds = {
  departmentId: string;
  municipalityId: string;
  communeId: string | null;
  neighborhoodId: string | null;
  votingCenterId: string | null;
  votingTableId: string | null;
};

type UpdatePayload = Record<string, string | number | null>;

function cacheKey(...parts: Array<string | null | undefined>) {
  return parts.map((part) => (part ?? "").trim().toLowerCase()).join("::");
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

async function singleId(
  query: PromiseLike<{ data: { id: string } | null; error: { message: string } | null }>,
  fallbackMessage: string
) {
  const { data, error } = await query;

  if (error || !data?.id) {
    throw new Error(`${fallbackMessage}${error?.message ? `: ${error.message}` : ""}`);
  }

  return data.id;
}

async function maybeSingleId(
  query: PromiseLike<{ data: { id: string } | null; error: { message: string } | null }>,
  fallbackMessage: string
) {
  const { data, error } = await query;

  if (error) {
    throw new Error(`${fallbackMessage}: ${error.message}`);
  }

  return data?.id ?? null;
}

export async function importAdminWorkbook(client: SupabaseClient, parsed: ParsedImport, actorUserId: string | null) {
  const departmentCache = new Map<string, string>();
  const municipalityCache = new Map<string, string>();
  const communeCache = new Map<string, string>();
  const neighborhoodCache = new Map<string, string>();
  const votingCenterCache = new Map<string, string>();
  const votingTableCache = new Map<string, string>();
  const personIdsByDocument = new Map<string, string>();
  const leaderIdsByDocument = new Map<string, string>();
  const result: ImportResult = {
    territoryRows: 0,
    peopleRows: 0,
    importantDateRows: 0,
    tagsRows: 0,
    leadersRows: 0
  };

  async function ensureDepartment(name: string, code: string) {
    const key = cacheKey(name);
    const cached = departmentCache.get(key);
    if (cached) return cached;

    const existingId = await maybeSingleId(
      client.from("departamentos").select("id").eq("name", name).maybeSingle(),
      `No se pudo consultar el departamento ${name}`
    );

    if (existingId) {
      if (code) {
        const { error } = await client.from("departamentos").update({ code }).eq("id", existingId);
        if (error) throw new Error(`No se pudo actualizar el departamento ${name}: ${error.message}`);
      }

      departmentCache.set(key, existingId);
      return existingId;
    }

    const id = await singleId(
      client
        .from("departamentos")
        .insert({ name, code: code || null })
        .select("id")
        .single(),
      `No se pudo cargar el departamento ${name}`
    );
    departmentCache.set(key, id);
    return id;
  }

  async function ensureMunicipality(row: Pick<ParsedTerritoryRow, "department" | "departmentCode" | "municipality" | "municipalityCode" | "municipalitySupportScore">) {
    const departmentId = await ensureDepartment(row.department, row.departmentCode);
    const key = cacheKey(departmentId, row.municipality);
    const cached = municipalityCache.get(key);
    if (cached) return { departmentId, municipalityId: cached };

    const existingId = await maybeSingleId(
      client
        .from("municipios")
        .select("id")
        .eq("department_id", departmentId)
        .eq("name", row.municipality)
        .maybeSingle(),
      `No se pudo consultar el municipio ${row.municipality}`
    );

    if (existingId) {
      const updatePayload: UpdatePayload = {};

      if (row.municipalityCode) updatePayload.code = row.municipalityCode;
      if (row.municipalitySupportScore !== null) updatePayload.support_score = row.municipalitySupportScore;

      if (Object.keys(updatePayload).length > 0) {
        const { error } = await client.from("municipios").update(updatePayload).eq("id", existingId);
        if (error) throw new Error(`No se pudo actualizar el municipio ${row.municipality}: ${error.message}`);
      }

      municipalityCache.set(key, existingId);
      return { departmentId, municipalityId: existingId };
    }

    const id = await singleId(
      client
        .from("municipios")
        .insert({
          department_id: departmentId,
          name: row.municipality,
          code: row.municipalityCode || null,
          support_score: row.municipalitySupportScore ?? 0
        })
        .select("id")
        .single(),
      `No se pudo cargar el municipio ${row.municipality}`
    );
    municipalityCache.set(key, id);
    return { departmentId, municipalityId: id };
  }

  async function ensureCommune(municipalityId: string, name: string, code: string) {
    if (!name) return null;

    const key = cacheKey(municipalityId, name);
    const cached = communeCache.get(key);
    if (cached) return cached;

    const existingId = await maybeSingleId(
      client
        .from("comunas")
        .select("id")
        .eq("municipality_id", municipalityId)
        .eq("name", name)
        .maybeSingle(),
      `No se pudo consultar la comuna/zona ${name}`
    );

    if (existingId) {
      if (code) {
        const { error } = await client.from("comunas").update({ code }).eq("id", existingId);
        if (error) throw new Error(`No se pudo actualizar la comuna/zona ${name}: ${error.message}`);
      }

      communeCache.set(key, existingId);
      return existingId;
    }

    const id = await singleId(
      client
        .from("comunas")
        .insert({ municipality_id: municipalityId, name, code: code || null })
        .select("id")
        .single(),
      `No se pudo cargar la comuna/zona ${name}`
    );
    communeCache.set(key, id);
    return id;
  }

  async function ensureNeighborhood(communeId: string | null, name: string, code: string) {
    if (!communeId || !name) return null;

    const key = cacheKey(communeId, name);
    const cached = neighborhoodCache.get(key);
    if (cached) return cached;

    const existingId = await maybeSingleId(
      client
        .from("barrios")
        .select("id")
        .eq("commune_id", communeId)
        .eq("name", name)
        .maybeSingle(),
      `No se pudo consultar el barrio/vereda ${name}`
    );

    if (existingId) {
      if (code) {
        const { error } = await client.from("barrios").update({ code }).eq("id", existingId);
        if (error) throw new Error(`No se pudo actualizar el barrio/vereda ${name}: ${error.message}`);
      }

      neighborhoodCache.set(key, existingId);
      return existingId;
    }

    const id = await singleId(
      client
        .from("barrios")
        .insert({ commune_id: communeId, name, code: code || null })
        .select("id")
        .single(),
      `No se pudo cargar el barrio/vereda ${name}`
    );
    neighborhoodCache.set(key, id);
    return id;
  }

  async function ensureVotingCenter(row: ParsedTerritoryRow, municipalityId: string, communeId: string | null, neighborhoodId: string | null) {
    if (!row.votingCenter) return null;

    const key = cacheKey(municipalityId, row.votingCenter);
    const cached = votingCenterCache.get(key);
    if (cached) return cached;

    const existingId = await maybeSingleId(
      client
        .from("puestos_votacion")
        .select("id")
        .eq("municipality_id", municipalityId)
        .eq("name", row.votingCenter)
        .maybeSingle(),
      `No se pudo consultar el puesto ${row.votingCenter}`
    );

    if (existingId) {
      const updatePayload: UpdatePayload = {};

      if (communeId) updatePayload.commune_id = communeId;
      if (neighborhoodId) updatePayload.neighborhood_id = neighborhoodId;
      if (row.votingCenterCode) updatePayload.code = row.votingCenterCode;
      if (row.latitude !== null) updatePayload.latitude = row.latitude;
      if (row.longitude !== null) updatePayload.longitude = row.longitude;

      if (Object.keys(updatePayload).length === 0) {
        votingCenterCache.set(key, existingId);
        return existingId;
      }

      const { error } = await client
        .from("puestos_votacion")
        .update(updatePayload)
        .eq("id", existingId);

      if (error) throw new Error(`No se pudo actualizar el puesto ${row.votingCenter}: ${error.message}`);
      votingCenterCache.set(key, existingId);
      return existingId;
    }

    const id = await singleId(
      client
        .from("puestos_votacion")
        .insert({
          municipality_id: municipalityId,
          commune_id: communeId,
          neighborhood_id: neighborhoodId,
          name: row.votingCenter,
          code: row.votingCenterCode || null,
          latitude: row.latitude,
          longitude: row.longitude
        })
        .select("id")
        .single(),
      `No se pudo crear el puesto ${row.votingCenter}`
    );
    votingCenterCache.set(key, id);
    return id;
  }

  async function ensureVotingTable(votingCenterId: string | null, tableNumber: string) {
    if (!votingCenterId || !tableNumber) return null;

    const key = cacheKey(votingCenterId, tableNumber);
    const cached = votingTableCache.get(key);
    if (cached) return cached;

    const id = await singleId(
      client
        .from("mesas_votacion")
        .upsert({ voting_center_id: votingCenterId, table_number: tableNumber }, { onConflict: "voting_center_id,table_number" })
        .select("id")
        .single(),
      `No se pudo cargar la mesa ${tableNumber}`
    );
    votingTableCache.set(key, id);
    return id;
  }

  async function ensureTerritory(row: ParsedTerritoryRow): Promise<TerritoryIds> {
    const { departmentId, municipalityId } = await ensureMunicipality(row);
    const communeId = await ensureCommune(municipalityId, row.commune, row.communeCode);
    const neighborhoodId = await ensureNeighborhood(communeId, row.neighborhood, row.neighborhoodCode);
    const votingCenterId = await ensureVotingCenter(row, municipalityId, communeId, neighborhoodId);
    const votingTableId = await ensureVotingTable(votingCenterId, row.votingTable);

    return {
      departmentId,
      municipalityId,
      communeId,
      neighborhoodId,
      votingCenterId,
      votingTableId
    };
  }

  function territoryRowFromPerson(row: ParsedPersonRow): ParsedTerritoryRow {
    return {
      rowNumber: row.rowNumber,
      department: row.department || "Caldas",
      departmentCode: row.department === "Caldas" ? "17" : "",
      municipality: row.municipality,
      municipalityCode: "",
      municipalitySupportScore: null,
      commune: row.commune,
      communeCode: "",
      neighborhood: row.neighborhood,
      neighborhoodCode: "",
      votingCenter: row.votingCenter,
      votingCenterCode: "",
      votingTable: row.votingTable,
      latitude: null,
      longitude: null
    };
  }

  async function findLeaderId(documentNumber: string) {
    if (!documentNumber) return null;
    const cached = leaderIdsByDocument.get(documentNumber);
    if (cached) return cached;

    const { data: person, error: personError } = await client
      .from("personas")
      .select("id")
      .eq("document_number", documentNumber)
      .maybeSingle();

    if (personError || !person?.id) return null;

    const { data: leader, error: leaderError } = await client
      .from("lideres")
      .select("id")
      .eq("person_id", person.id)
      .maybeSingle();

    if (leaderError) return null;

    if (leader?.id) leaderIdsByDocument.set(documentNumber, leader.id);
    return leader?.id ?? null;
  }

  for (const row of parsed.territoryRows) {
    await ensureTerritory(row);
    result.territoryRows += 1;
  }

  for (const row of parsed.peopleRows) {
    const territory = await ensureTerritory(territoryRowFromPerson(row));

    const personId = await singleId(
      client
        .from("personas")
        .upsert(
          {
            kind: personKindFromSupportLabel(row.supportLabel),
            first_name: row.firstName,
            last_name: row.lastName,
            document_number: row.documentNumber,
            phone: row.phone || null,
            whatsapp: row.whatsapp || null,
            email: row.email || null,
            address: row.address || null,
            barrio: row.neighborhood || null,
            comuna: row.commune || null,
            municipality_id: territory.municipalityId,
            commune_id: territory.communeId,
            neighborhood_id: territory.neighborhoodId,
            department_id: territory.departmentId,
            profession: row.profession || null,
            company: row.company || null,
            job_title: row.jobTitle || null,
            employment_status: row.employmentStatus,
            voting_center_id: territory.votingCenterId,
            voting_table_id: territory.votingTableId,
            notes: row.notes || null,
            support_label: row.supportLabel,
            support_score: row.supportScore,
            visibility_scope: row.visibilityScope
          },
          { onConflict: "document_number" }
        )
        .select("id")
        .single(),
      `No se pudo cargar la persona con cédula ${row.documentNumber}`
    );
    personIdsByDocument.set(row.documentNumber, personId);

    if (personKindFromSupportLabel(row.supportLabel) === "leader") {
      const leaderId = await singleId(
        client
          .from("lideres")
          .upsert(
            {
              person_id: personId,
              title: row.leaderSector ? `Líder ${row.leaderSector}` : "Líder",
              influence_score: row.supportScore,
              active: true
            },
            { onConflict: "person_id" }
          )
          .select("id")
          .single(),
        `No se pudo crear el liderazgo para ${row.documentNumber}`
      );
      leaderIdsByDocument.set(row.documentNumber, leaderId);
      result.leadersRows += 1;
    }

    for (const tag of row.tags) {
      const { error } = await client.from("etiquetas_persona").upsert({ person_id: personId, tag }, { onConflict: "person_id,tag" });
      if (error) throw new Error(`No se pudo cargar la etiqueta ${tag}: ${error.message}`);
      result.tagsRows += 1;
    }

    result.peopleRows += 1;
  }

  for (const row of parsed.peopleRows) {
    if (!row.leaderDocumentNumber) continue;

    const personId = personIdsByDocument.get(row.documentNumber);
    const leaderId = await findLeaderId(row.leaderDocumentNumber);

    if (!personId || !leaderId) continue;

    const { error } = await client
      .from("personas")
      .update({ leader_id: leaderId })
      .eq("id", personId);

    if (error) {
      throw new Error(`No se pudo asignar el líder ${row.leaderDocumentNumber} a ${row.documentNumber}: ${error.message}`);
    }
  }

  for (const row of parsed.importantDateRows) {
    const payload = {
      title: row.title,
      date_type: row.dateType,
      date_month: row.dateMonth,
      date_day: row.dateDay,
      exact_date: row.exactDate || null,
      channel: row.channel,
      audience_scope: row.audienceScope,
      message_template: row.messageTemplate,
      active: row.active,
      ...(actorUserId ? { created_by: actorUserId } : {})
    };

    const { data: existing, error: existingError } = await client
      .from("fechas_importantes")
      .select("id")
      .eq("title", row.title)
      .maybeSingle();

    if (existingError) throw new Error(`No se pudo consultar la fecha ${row.title}: ${existingError.message}`);

    const write = existing?.id
      ? client.from("fechas_importantes").update(payload).eq("id", existing.id)
      : client.from("fechas_importantes").insert(payload);

    const { error } = await write;
    if (error) throw new Error(`No se pudo cargar la fecha ${row.title}: ${error.message}`);

    result.importantDateRows += 1;
  }

  return result;
}
