import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export function VisitTypeBarChart({ data = {} }) {
  const chartData = Object.entries(data).map(([key, value]) => ({
    type: key.replace(/_/g, ' '),
    visits: value
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#64748b' }} angle={-25} textAnchor="end" />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="visits" fill="#10b981" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PregnancyRiskPieChart({ data = {} }) {
  const chartData = [
    { name: 'Normal', value: data.NORMAL || 0, color: '#10b981' },
    { name: 'Needs Follow-up', value: data.NEEDS_FOLLOW_UP || 0, color: '#f59e0b' },
    { name: 'High Priority Alert', value: data.HIGH_PRIORITY || 0, color: '#f43f5e' }
  ].filter(d => d.value > 0);

  if (chartData.length === 0) {
    return <p className="text-xs text-slate-400 text-center py-10">No pregnancy records</p>;
  }

  return (
    <div className="h-64 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MedicineStockBarChart({ data = [] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-25} textAnchor="end" />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="available" fill="#0284c7" name="Available Qty" radius={[4, 4, 0, 0]} />
          <Bar dataKey="threshold" fill="#f43f5e" name="Min Threshold" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
