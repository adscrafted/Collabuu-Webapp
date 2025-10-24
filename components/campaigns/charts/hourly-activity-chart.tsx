'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HourlyActivityChartProps {
  data: {
    hour: number;
    visits: number;
  }[];
}

export function HourlyActivityChart({ data }: HourlyActivityChartProps) {
  const chartData = data.map((item) => ({
    hour: `${item.hour.toString().padStart(2, '0')}:00`,
    visits: item.visits,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="hour"
          stroke="#6B7280"
          style={{ fontSize: '12px' }}
          tickLine={false}
          interval={2} // Show every 3rd hour
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
        />
        <Line
          type="monotone"
          dataKey="visits"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ fill: '#3B82F6', r: 3 }}
          activeDot={{ r: 5 }}
          name="Visits"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
