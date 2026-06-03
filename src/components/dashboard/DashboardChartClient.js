"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export default function DashboardChartClient({
  data,
  year,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          Reguler vs Express ({year})
        </h2>

        <p className="text-sm text-slate-500">
          Jumlah transaksi per bulan
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />

          <XAxis
            dataKey="month"
            tick={{ fill: "#64748b" }}
            tickLine={false}
          />

          <YAxis
            tick={{ fill: "#64748b" }}
            tickLine={false}
          />

          <Tooltip />

          <Legend />

          <Line
            type="monotone"
            dataKey="regular"
            name="Reguler"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
          />

          <Line
            type="monotone"
            dataKey="express"
            name="Express"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}