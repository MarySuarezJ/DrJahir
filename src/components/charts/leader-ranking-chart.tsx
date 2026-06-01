"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { leaderRankingData } from "@/lib/data/dashboard";

export default function LeaderRankingChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={leaderRankingData} layout="vertical" margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
          <CartesianGrid stroke="rgba(151,119,63,0.16)" horizontal={false} />
          <XAxis type="number" tick={{ fill: "rgba(39,50,65,0.62)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fill: "rgba(39,50,65,0.62)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "rgba(255,250,240,0.96)",
              border: "1px solid rgba(151,119,63,0.22)",
              borderRadius: 16,
              color: "#273241"
            }}
          />
          <Bar dataKey="score" radius={[0, 14, 14, 0]} fill="#d7b24a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
