'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface VisitorTrafficChartProps {
  data: {
    date: string;
    visits: number;
    views: number;
  }[];
}

export function VisitorTrafficChart({ data }: VisitorTrafficChartProps) {
  const formattedData = data.map((item) => ({
    ...item,
    date: format(new Date(item.date), 'MMM d'),
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="date"
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
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
        <Line
          type="monotone"
          dataKey="visits"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ fill: '#3B82F6', r: 4 }}
          activeDot={{ r: 6 }}
          name="Visits"
        />
        <Line
          type="monotone"
          dataKey="views"
          stroke="#10B981"
          strokeWidth={2}
          dot={{ fill: '#10B981', r: 4 }}
          activeDot={{ r: 6 }}
          name="Views"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
