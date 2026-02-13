import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes efficiently.
 * Usage: cn("bg-red-500", condition && "text-white")
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}