import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5', className)}>
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'text-sm',
                    isLast ? 'font-medium text-foreground' : 'text-muted-foreground'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
