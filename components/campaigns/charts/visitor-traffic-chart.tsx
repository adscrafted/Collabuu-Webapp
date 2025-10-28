'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';

interface VisitorTrafficChartProps {
  data: {
    date: string;
    visits: number;
  }[];
}

export function VisitorTrafficChart({ data }: VisitorTrafficChartProps) {
  // Show empty state when there's no data
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] text-center">
        <div className="rounded-full bg-gray-100 p-4 mb-4">
          <TrendingUp className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No visitor data yet</h3>
        <p className="text-sm text-gray-600 max-w-md">
          Visitor traffic data will appear here once your campaign starts receiving visits from customers.
        </p>
      </div>
    );
  }

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
      </LineChart>
    </ResponsiveContainer>
  );
}
