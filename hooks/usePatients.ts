import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useDebounce } from "./useDebounce";

export function usePatients(search: string) {
  const debouncedSearch = useDebounce(search, 300);

  return useQuery({
    queryKey: queryKeys.patients.list(debouncedSearch),
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/patients?${params}`);
      if (!res.ok) throw new Error("Failed to fetch patients");
      return res.json();
    },
  });
}

export function usePatientSearch(search: string) {
  const debouncedSearch = useDebounce(search, 300);

  return useQuery({
    queryKey: queryKeys.patients.list(`inline:${debouncedSearch}`),
    queryFn: async () => {
      const res = await fetch(
        `/api/patients?search=${encodeURIComponent(debouncedSearch)}&limit=10`
      );
      if (!res.ok) throw new Error("Failed to fetch patients");
      return res.json();
    },
    enabled: debouncedSearch.trim().length > 0,
  });
}
