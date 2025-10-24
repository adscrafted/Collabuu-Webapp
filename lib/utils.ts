import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format large numbers with K, M suffixes
 * Examples: 1200 -> 1.2k, 50000 -> 50k, 1500000 -> 1.5M
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toString();
}

/**
 * Determine performance tier based on customer/visit count
 */
export function getPerformanceTier(count: number): 'excellent' | 'good' | 'normal' {
  if (count >= 100) return 'excellent';
  if (count >= 50) return 'good';
  return 'normal';
}
