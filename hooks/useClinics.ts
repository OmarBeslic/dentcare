import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { ClinicDTO } from "@/types";

export function useClinics() {
  return useQuery({
    queryKey: queryKeys.clinics.list(),
    queryFn: async () => {
      const res = await fetch("/api/clinics");
      if (!res.ok) throw new Error("Failed to fetch clinics");
      const data = await res.json();
      return (Array.isArray(data) ? data : []) as ClinicDTO[];
    },
  });
}
