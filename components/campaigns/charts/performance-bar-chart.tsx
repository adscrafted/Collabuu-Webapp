'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceBarChartProps {
  data: {
    influencerId: string;
    influencerName: string;
    avatar?: string;
    visits: number;
    conversions: number;
    creditsEarned: number;
  }[];
}

export function PerformanceBarChart({ data }: PerformanceBarChartProps) {
  // Take top 10 performers
  const topPerformers = data
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 10)
    .map((item) => ({
      name: item.influencerName.split(' ')[0], // First name only for cleaner display
      visits: item.visits,
      conversions: item.conversions,
    }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={topPerformers} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="name"
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
        <Bar
          dataKey="visits"
          fill="#3B82F6"
          radius={[8, 8, 0, 0]}
          name="Visits"
        />
        <Bar
          dataKey="conversions"
          fill="#10B981"
          radius={[8, 8, 0, 0]}
          name="Conversions"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
