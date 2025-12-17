// src/utils/cn.ts
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Une condicionalmente clases y resuelve conflictos de Tailwind.
 * Uso: cn("px-2", condition && "hidden", ["mt-4", otherClass])
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
