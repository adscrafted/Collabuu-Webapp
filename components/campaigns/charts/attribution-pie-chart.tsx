'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AttributionPieChartProps {
  data: {
    source: 'influencer' | 'direct';
    value: number;
    percentage: number;
  }[];
}

const COLORS = {
  influencer: '#3B82F6',
  direct: '#10B981',
};

export function AttributionPieChart({ data }: AttributionPieChartProps) {
  const chartData = data.map((item) => ({
    name: item.source === 'influencer' ? 'Influencer' : 'Direct App',
    value: item.value,
    percentage: item.percentage,
  }));

  const renderLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.name === 'Influencer' ? COLORS.influencer : COLORS.direct}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '12px',
          }}
          formatter={(value: number, name: string, props: any) => [
            `${value.toLocaleString()} visits (${props.payload.percentage.toFixed(1)}%)`,
            name,
          ]}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
