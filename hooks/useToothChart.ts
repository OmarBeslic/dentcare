import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import type { ToothChartResponse, ToothCondition } from "@/types";

export function useToothChart(patientId: string) {
  return useQuery({
    queryKey: queryKeys.toothChart.detail(patientId),
    queryFn: async () => {
      const res = await fetch(`/api/tooth-chart/${patientId}`);
      if (!res.ok) throw new Error("Failed to fetch tooth chart");
      return (await res.json()) as ToothChartResponse;
    },
    enabled: !!patientId,
  });
}

export function useUpdateToothCondition(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      toothNumber,
      condition,
    }: {
      toothNumber: number;
      condition: ToothCondition;
    }) => {
      const res = await fetch(`/api/tooth-chart/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toothNumber, condition }),
      });
      if (!res.ok) throw new Error("Greška pri ažuriranju zubnog kartona.");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.toothChart.detail(patientId) });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
