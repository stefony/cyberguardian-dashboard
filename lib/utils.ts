import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names intelligently
 * Merges Tailwind CSS classes without conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number with K, M, B suffixes
 * Example: 1000 -> 1K, 1000000 -> 1M
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Format date to relative time
 * Example: "2 hours ago", "3 days ago"
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const then = new Date(date)
  const diff = now.getTime() - then.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

/**
 * Get threat level color
 */
export function getThreatColor(level: string): string {
  const colors: Record<string, string> = {
    critical: 'text-red-500',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-green-500',
    info: 'text-blue-500'
  }
  return colors[level.toLowerCase()] || 'text-gray-500'
}

/**
 * Get threat background color
 */
export function getThreatBgColor(level: string): string {
  const colors: Record<string, string> = {
    critical: 'bg-red-500/10',
    high: 'bg-orange-500/10',
    medium: 'bg-yellow-500/10',
    low: 'bg-green-500/10',
    info: 'bg-blue-500/10'
  }
  return colors[level.toLowerCase()] || 'bg-gray-500/10'
}