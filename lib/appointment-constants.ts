import type { AppointmentStatus } from "@/types";

export const statusLabel: Record<AppointmentStatus, string> = {
  SCHEDULED: "Zakazano",
  COMPLETED: "Završeno",
  CANCELLED: "Otkazano",
  NO_SHOW: "Nije došao",
};

export const statusVariant: Record<AppointmentStatus, "teal" | "success" | "destructive" | "warning"> = {
  SCHEDULED: "teal",
  COMPLETED: "success",
  CANCELLED: "destructive",
  NO_SHOW: "warning",
};
