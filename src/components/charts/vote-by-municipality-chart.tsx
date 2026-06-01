"use client";

import { ResponsiveContainer, BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { voteByMunicipalityData } from "@/lib/data/dashboard";

export default function VoteByMunicipalityChart() {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={voteByMunicipalityData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="rgba(151,119,63,0.16)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "rgba(39,50,65,0.62)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(39,50,65,0.62)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(201,156,69,0.08)" }}
            contentStyle={{
              background: "rgba(255,250,240,0.96)",
              border: "1px solid rgba(151,119,63,0.22)",
              borderRadius: 16,
              color: "#273241"
            }}
            labelStyle={{ color: "rgba(39,50,65,0.7)" }}
          />
          <Bar dataKey="value" radius={[14, 14, 0, 0]} fill="url(#goldGradient)" />
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3d67b" />
              <stop offset="100%" stopColor="#d7b24a" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
