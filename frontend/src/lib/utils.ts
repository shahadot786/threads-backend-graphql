import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date?: string | number | Date) {
  if (!date) return "";
  
  let past: Date;
  
  try {
    if (date instanceof Date) {
      past = date;
    } else if (typeof date === "number") {
      // Handle timestamps in seconds (10 digits) or milliseconds (13 digits)
      past = new Date(date < 10000000000 ? date * 1000 : date);
    } else {
      // If it's a numeric string, convert to number first
      const numericDate = Number(date);
      if (!isNaN(numericDate)) {
        past = new Date(numericDate < 10000000000 ? numericDate * 1000 : numericDate);
      } else {
        past = new Date(date);
      }
    }
  } catch (e) {
    return "";
  }

  // Final validation
  if (isNaN(past.getTime())) return "";

  const now = new Date();
  const diff = now.getTime() - past.getTime();
  
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "now";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  
  if (past.getFullYear() === now.getFullYear()) {
    return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  
  return past.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric",
    year: "numeric" 
  });
}

export function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "m";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return count.toString();
}

export function getDisplayName(firstName: string, lastName?: string | null): string {
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
