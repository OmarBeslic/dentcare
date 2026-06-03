import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { sr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd.MM.yyyy");
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd.MM.yyyy HH:mm");
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), "HH:mm");
}

export function formatDateLong(date: Date | string): string {
  return format(new Date(date), "d. MMMM yyyy.", { locale: sr });
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}
