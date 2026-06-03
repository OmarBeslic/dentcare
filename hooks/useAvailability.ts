import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface AvailabilityParams {
  dentistId: string;
  date: string;
  duration: number;
}

export function useAvailability(params: AvailabilityParams) {
  return useQuery({
    queryKey: queryKeys.appointments.availability(params),
    queryFn: async () => {
      const qs = new URLSearchParams({
        dentistId: params.dentistId,
        date: params.date,
        duration: String(params.duration),
      }).toString();
      const res = await fetch(`/api/appointments/availability?${qs}`);
      if (!res.ok) throw new Error("Failed to fetch availability");
      return res.json();
    },
    enabled: !!(params.dentistId && params.date && params.duration),
    staleTime: 30 * 1000,
  });
}
