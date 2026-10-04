import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea
} from 'recharts';

export default function GrowthChart({ growthRecords = [] }) {
  if (!growthRecords || growthRecords.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <p className="text-sm text-slate-500 font-medium">No growth measurements recorded yet.</p>
      </div>
    );
  }

  // Format data for chart
  const data = growthRecords.map((r, idx) => ({
    date: r.date,
    label: `Visit ${idx + 1} (${r.date})`,
    weight: r.weightKg,
    height: r.heightCm,
    muac: r.muacCm,
    notes: r.notes
  }));

  return (
    <div className="space-y-6">
      {/* Weight Chart */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-800">Child Weight Progression (kg)</h4>
          <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            WHO Reference Guideline
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11, fill: '#64748b' }} unit=" kg" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-lg">
                        <p className="font-bold">{d.date}</p>
                        <p className="text-emerald-400 font-semibold">Weight: {d.weight} kg</p>
                        {d.height && <p className="text-blue-400">Height: {d.height} cm</p>}
                        {d.notes && <p className="text-slate-300 mt-1 italic">{d.notes}</p>}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 7 }}
                name="Weight (kg)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Height Chart if data exists */}
      {data.some(d => d.height) && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-4">Child Height / Length Progression (cm)</h4>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11, fill: '#64748b' }} unit=" cm" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="height"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
                  name="Height (cm)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
