"use client";

import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { weeklyGrowthData } from "@/lib/data/dashboard";

export default function WeeklyGrowthChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={weeklyGrowthData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
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
          <Line type="monotone" dataKey="personas" stroke="#f3d67b" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="líderes" stroke="#1ba66a" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="mensajes" stroke="#7ea4ff" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
