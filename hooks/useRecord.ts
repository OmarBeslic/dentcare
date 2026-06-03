import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export function useRecord(patientId: string, recordId: string) {
  return useQuery({
    queryKey: queryKeys.patients.record(patientId, recordId),
    queryFn: async () => {
      const res = await fetch(`/api/patients/${patientId}/records/${recordId}`);
      if (!res.ok) throw new Error("Failed to fetch record");
      return res.json();
    },
    enabled: !!(patientId && recordId),
  });
}

export function useUpdateRecord(patientId: string, recordId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: object) => {
      const res = await fetch(`/api/patients/${patientId}/records/${recordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Greška.");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.records(patientId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients.record(patientId, recordId),
      });
    },
  });
}
