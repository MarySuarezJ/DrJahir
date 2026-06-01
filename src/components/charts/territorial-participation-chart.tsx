"use client";

import { ResponsiveContainer, AreaChart, Area, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { territorialParticipationData } from "@/lib/data/dashboard";

export default function TerritorialParticipationChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={territorialParticipationData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1ba66a" stopOpacity={0.75} />
              <stop offset="100%" stopColor="#1ba66a" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="goldGradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3d67b" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#f3d67b" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(151,119,63,0.16)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "rgba(39,50,65,0.62)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(39,50,65,0.62)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "rgba(255,250,240,0.96)",
              border: "1px solid rgba(151,119,63,0.22)",
              borderRadius: 16,
              color: "#273241"
            }}
          />
          <Area type="monotone" dataKey="apoyo" stroke="#f3d67b" strokeWidth={2} fill="url(#goldGradient2)" />
          <Area type="monotone" dataKey="movilizacion" stroke="#1ba66a" strokeWidth={2} fill="url(#emeraldGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
