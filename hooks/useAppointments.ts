import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import type { AppointmentStatus } from "@/types";

export const APPOINTMENTS_PAGE_SIZE = 20;

interface AppointmentFilters {
  date: string;
  status?: string;
  dentistId?: string;
  page?: number;
}

export function useAppointments(filters: AppointmentFilters) {
  const page = filters.page ?? 1;
  return useQuery({
    queryKey: queryKeys.appointments.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams({
        date: filters.date,
        limit: String(APPOINTMENTS_PAGE_SIZE),
        page: String(page),
      });
      if (filters.status && filters.status !== "ALL") params.set("status", filters.status);
      if (filters.dentistId && filters.dentistId !== "ALL") params.set("dentistId", filters.dentistId);
      const res = await fetch(`/api/appointments?${params}`);
      if (!res.ok) throw new Error("Failed to fetch appointments");
      return res.json();
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      toast.success("Status ažuriran.");
    },
    onError: () => {
      toast.error("Greška pri ažuriranju.");
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: object) => {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Greška pri zakazivanju.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all });
      toast.success("Termin uspješno zakazan!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
