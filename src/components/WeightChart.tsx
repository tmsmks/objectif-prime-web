"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";

type Point = { logged_at: string; weight_kg: number };

export function WeightChart({
  data,
  targetKg,
}: {
  data: Point[];
  targetKg: number | null;
}) {
  if (data.length < 2) {
    return (
      <p className="rounded-xl bg-zinc-50 px-4 py-6 text-center text-sm text-muted">
        Ajoute au moins 2 pesées pour voir ton évolution.
      </p>
    );
  }

  const chartData = [...data]
    .reverse()
    .map((d) => ({ ...d, label: d.logged_at.slice(5) }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} domain={["auto", "auto"]} />
          <Tooltip
            formatter={(value) => [`${value} kg`, "Poids"]}
            contentStyle={{ fontSize: 12 }}
          />
          {targetKg && (
            <ReferenceLine y={targetKg} stroke="#059669" strokeDasharray="5 5" />
          )}
          <Line
            type="monotone"
            dataKey="weight_kg"
            stroke="#059669"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
