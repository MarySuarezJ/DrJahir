import type { SupabaseClient } from "@supabase/supabase-js";
import type { MessageChannel, MessageRecipient } from "@/lib/messaging/types";
import { getRecipientContact } from "@/lib/messaging/providers";

type DbPerson = {
  id: string;
  kind: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  municipality_id: string | null;
  profession: string | null;
  support_label: string | null;
  fecha_nacimiento: string | null;
};

type IdName = {
  id: string;
  name: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isTodayBirthday(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.valueOf())) return false;
  const today = new Date();
  return parsed.getUTCMonth() === today.getMonth() && parsed.getUTCDate() === today.getDate();
}

function matchesAudience(person: MessageRecipient, audience: string) {
  const cleanAudience = normalize(audience);
  const cleanKind = normalize(person.kind);
  const cleanSupport = normalize(person.supportLabel);
  const cleanMunicipality = normalize(person.municipality);

  if (cleanAudience.includes("manizales") && !cleanMunicipality.includes("manizales")) return false;
  if (cleanAudience.includes("cumple")) return Boolean(person.birthDate && isTodayBirthday(person.birthDate));
  if (cleanAudience.includes("lider")) return cleanKind === "leader" || cleanSupport.includes("lider");
  if (cleanAudience.includes("volunt")) return cleanKind === "volunteer" || cleanSupport.includes("volunt");
  if (cleanAudience.includes("simpat")) return cleanKind === "supporter" || cleanSupport.includes("simpat");
  if (cleanAudience.includes("coordinador")) return cleanSupport.includes("coordinador") || cleanKind === "leader";

  return true;
}

async function fetchMunicipalities(client: SupabaseClient, ids: string[]) {
  if (ids.length === 0) return new Map<string, string>();

  const { data, error } = await client.from("municipios").select("id,name").in("id", ids);
  if (error) throw new Error(error.message);

  return new Map((data as IdName[]).map((item) => [item.id, item.name]));
}

export async function resolveAudienceRecipients(
  client: SupabaseClient,
  channel: MessageChannel,
  audience: string
) {
  const { data, error } = await client
    .from("personas")
    .select("id,kind,first_name,last_name,email,phone,whatsapp,municipality_id,profession,support_label,fecha_nacimiento")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as DbPerson[];
  const municipalityIds = Array.from(new Set(rows.map((row) => row.municipality_id).filter((id): id is string => Boolean(id))));
  const municipalities = await fetchMunicipalities(client, municipalityIds);

  return rows
    .map<MessageRecipient>((row) => {
      const firstName = row.first_name ?? "";
      const lastName = row.last_name ?? "";
      return {
        id: row.id,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim() || "Persona registrada",
        email: row.email ?? "",
        phone: row.phone ?? "",
        whatsapp: row.whatsapp ?? "",
        municipality: row.municipality_id ? municipalities.get(row.municipality_id) ?? "" : "",
        profession: row.profession ?? "",
        supportLabel: row.support_label ?? "",
        kind: row.kind ?? "",
        birthDate: row.fecha_nacimiento ?? ""
      };
    })
    .filter((person) => getRecipientContact(channel, person))
    .filter((person) => matchesAudience(person, audience));
}

export function renderMessageTemplate(template: string, recipient: MessageRecipient) {
  return template
    .replaceAll("{nombre}", recipient.firstName || recipient.fullName)
    .replaceAll("{nombre_completo}", recipient.fullName)
    .replaceAll("{apellido}", recipient.lastName)
    .replaceAll("{municipio}", recipient.municipality)
    .replaceAll("{profesion}", recipient.profession)
    .replaceAll("{telefono}", recipient.phone || recipient.whatsapp);
}
