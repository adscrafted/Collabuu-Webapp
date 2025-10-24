'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VisitsByDayChartProps {
  data: {
    day: string;
    visits: number;
  }[];
}

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function VisitsByDayChart({ data }: VisitsByDayChartProps) {
  // Sort data by day of week
  const sortedData = [...data].sort((a, b) => {
    return DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
  });

  // Abbreviate day names
  const chartData = sortedData.map((item) => ({
    ...item,
    day: item.day.substring(0, 3), // Mon, Tue, etc.
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="day"
          stroke="#6B7280"
          style={{ fontSize: '12px' }}
          tickLine={false}
        />
        <YAxis
          stroke="#6B7280"
          style={{ fontSize: '12px' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '12px',
          }}
          labelStyle={{ fontWeight: 600, marginBottom: '8px' }}
          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
        />
        <Bar
          dataKey="visits"
          fill="#3B82F6"
          radius={[8, 8, 0, 0]}
          name="Visits"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
