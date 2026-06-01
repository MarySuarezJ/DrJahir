"use client";

import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function PublicIntakeForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [territory, setTerritory] = useState("Manizales");
  const [type, setType] = useState("simpatizante");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setName("");
  }

  return (
    <Card className="border-white/20 bg-white/[0.05]">
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/65">Registro público</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-white">Simpatizantes, voluntarios y líderes</h3>
          </div>
          <Badge variant="gold">Activo</Badge>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre completo" required />
            <Input placeholder="Teléfono o WhatsApp" required />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="simpatizante">Simpatizante</option>
              <option value="voluntario">Voluntario</option>
              <option value="lider">Líder</option>
            </Select>
            <Select value={territory} onChange={(event) => setTerritory(event.target.value)}>
              <option value="Manizales">Manizales</option>
              <option value="Villamaría">Villamaría</option>
              <option value="Chinchiná">Chinchiná</option>
              <option value="Neira">Neira</option>
            </Select>
            <Input placeholder="Correo" type="email" />
          </div>
          <Textarea placeholder="¿Cómo desea participar?" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/72">Los datos quedan listos para ingresar a PostgreSQL mediante Supabase.</p>
            <Button variant="gold" type="submit">
              Enviar registro
            </Button>
          </div>
        </form>

        {submitted ? (
          <div className="mt-5 rounded-3xl border border-brand-emerald/20 bg-brand-emerald/10 p-4 text-sm text-emerald-100">
            Registro enviado desde {name || "el formulario"}. Pendiente de sincronización con la base de datos.
          </div>
        ) : null}
      </div>
    </Card>
  );
}
