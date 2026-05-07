import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar
} from 'recharts';

const DARK_THEME = {
  background: '#1E293B',
  text: '#94A3B8',
  grid: '#334155',
  tooltip: '#0F172A'
};

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F172A] border border-[#334155] rounded-xl p-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.value?.toFixed(1)}{unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function WeightChart({ data, color = '#3B82F6', goalWeight }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
        No hay datos de peso aún
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const chartData = data.map(d => ({
    date: formatDate(d.date),
    peso: d.weight
  }));

  const weights = data.map(d => d.weight);
  const minWeight = Math.min(...weights) - 1;
  const maxWeight = Math.max(...weights) + 1;

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={DARK_THEME.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: DARK_THEME.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minWeight, maxWeight]}
          tick={{ fill: DARK_THEME.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip unit="kg" />} />
        {goalWeight && (
          <Line
            type="monotone"
            dataKey={() => goalWeight}
            stroke="#64748B"
            strokeDasharray="4 4"
            strokeWidth={1}
            dot={false}
          />
        )}
        <Area
          type="monotone"
          dataKey="peso"
          stroke={color}
          strokeWidth={2.5}
          fill="url(#weightGrad)"
          dot={false}
          activeDot={{ r: 5, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CalorieChart({ data, goal = 2000, color = '#3B82F6' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
        No hay datos de calorías aún
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const chartData = data.map(d => ({
    date: formatDate(d.date),
    calorías: d.calories,
    objetivo: goal
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={DARK_THEME.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: DARK_THEME.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: DARK_THEME.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip unit="kcal" />} />
        <Bar dataKey="calorías" fill={color} radius={[4, 4, 0, 0]} opacity={0.85} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VolumeChart({ data, color = '#3B82F6' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
        No hay datos de volumen aún
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const chartData = data.map(d => ({
    date: formatDate(d.date),
    volumen: Math.round(d.total_volume / 1000)
  }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={DARK_THEME.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: DARK_THEME.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: DARK_THEME.text, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip unit="t" />} />
        <Area
          type="monotone"
          dataKey="volumen"
          stroke={color}
          strokeWidth={2}
          fill="url(#volGrad)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
