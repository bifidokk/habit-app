import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert JavaScript day (0=Sunday) to backend day (0=Monday)
 * JavaScript: 0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday
 * Backend: 0=Monday, 1=Tuesday, 2=Wednesday, ..., 6=Sunday
 */
export function jsDayToBackendDay(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1
}

/**
 * Convert backend day (0=Monday) to JavaScript day (0=Sunday)
 * Backend: 0=Monday, 1=Tuesday, 2=Wednesday, ..., 6=Sunday
 * JavaScript: 0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday
 */
export function backendDayToJsDay(backendDay: number): number {
  return backendDay === 6 ? 0 : backendDay + 1
}
