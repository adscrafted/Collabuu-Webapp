import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KPICardData {
  title: string;
  value: string;
  icon?: LucideIcon;
  iconColor?: string;
}

interface KPICardProps {
  data: KPICardData;
  className?: string;
}

export function KPICard({ data, className }: KPICardProps) {
  const IconComponent = data.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 p-4 bg-white rounded-lg border border-gray-200',
        'shadow-[0_2px_8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]',
        className
      )}
    >
      {/* Icon */}
      {IconComponent && (
        <IconComponent
          className={cn(
            'h-5 w-5',
            data.iconColor || 'text-pink-500'
          )}
        />
      )}

      {/* Value */}
      <div className="text-2xl font-bold text-gray-900 text-center">
        {data.value}
      </div>

      {/* Title */}
      <div className="text-xs font-medium text-gray-600 text-center line-clamp-2">
        {data.title}
      </div>
    </div>
  );
}

interface KPIGridProps {
  kpis: KPICardData[];
  columns?: 1 | 2 | 3;
  className?: string;
}

export function KPIGrid({ kpis, columns = 2, className }: KPIGridProps) {
  return (
    <div
      className={cn(
        'grid gap-3',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'grid-cols-2',
        columns === 3 && 'grid-cols-3',
        className
      )}
    >
      {kpis.map((kpi, index) => (
        <KPICard key={index} data={kpi} />
      ))}
    </div>
  );
}
