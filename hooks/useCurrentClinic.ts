import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { queryKeys } from "@/lib/query-keys";
import type { ClinicDTO } from "@/types";

export function useCurrentClinic() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: queryKeys.clinics.current(),
    queryFn: async () => {
      const res = await fetch("/api/clinics/current");
      if (!res.ok) throw new Error("Failed to fetch current clinic");
      return (await res.json()) as ClinicDTO;
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000,
  });
}
