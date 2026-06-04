import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useDebounce } from "./useDebounce";
import { toast } from "sonner";

export const PATIENTS_PAGE_SIZE = 20;

export function usePatients(search: string, page = 1) {
  const debouncedSearch = useDebounce(search, 300);

  return useQuery({
    queryKey: queryKeys.patients.list({ search: debouncedSearch, page }),
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(PATIENTS_PAGE_SIZE),
        page: String(page),
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/patients?${params}`);
      if (!res.ok) throw new Error("Failed to fetch patients");
      return res.json();
    },
  });
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/patients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      toast.success("Pacijent je uspješno ažuriran.");
    },
    onError: () => toast.error("Greška pri ažuriranju pacijenta."),
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      toast.success("Pacijent je obrisan.");
    },
    onError: () => toast.error("Greška pri brisanju pacijenta."),
  });
}

export function usePatientSearch(search: string) {
  const debouncedSearch = useDebounce(search, 300);

  return useQuery({
    queryKey: ["patients", "inline-search", debouncedSearch],
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
