import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import type { ToothRecordDTO } from "@/types";

function extractError(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "error" in err && typeof (err as { error: unknown }).error === "string") {
    return (err as { error: string }).error;
  }
  return fallback;
}

export function useToothRecords(patientId: string, toothNumber?: number | null) {
  return useQuery({
    queryKey: queryKeys.toothRecords.list(patientId, toothNumber ?? null),
    queryFn: async () => {
      const params = new URLSearchParams({ patientId });
      if (toothNumber != null) params.set("toothNumber", String(toothNumber));
      const res = await fetch(`/api/tooth-records?${params}`);
      if (!res.ok) throw new Error("Failed to fetch tooth records");
      return (await res.json()) as ToothRecordDTO[];
    },
    enabled: !!patientId,
  });
}

export function useCreateToothRecord(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/tooth-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, patientId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(extractError(err, "Greška pri dodavanju tretmana."));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.toothRecords.all(patientId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.toothChart.detail(patientId) });
      toast.success("Tretman dodat.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateToothRecord(patientId: string, recordId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/tooth-records/${recordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(extractError(err, "Greška pri ažuriranju tretmana."));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.toothRecords.all(patientId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.toothChart.detail(patientId) });
      toast.success("Tretman sačuvan.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteToothRecord(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tooth-records/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Greška pri brisanju tretmana.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.toothRecords.all(patientId) });
      toast.success("Tretman obrisan.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useToggleToothRecordPaid(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isPaid }: { id: string; isPaid: boolean }) => {
      const res = await fetch(`/api/tooth-records/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid }),
      });
      if (!res.ok) throw new Error("Greška pri ažuriranju statusa plaćanja.");
      return res.json();
    },
    onMutate: async ({ id, isPaid }) => {
      const previous = queryClient.getQueriesData<ToothRecordDTO[]>({
        queryKey: queryKeys.toothRecords.all(patientId),
      });
      queryClient.setQueriesData<ToothRecordDTO[]>(
        { queryKey: queryKeys.toothRecords.all(patientId) },
        (old) => old?.map((r) => (r.id === id ? { ...r, isPaid } : r))
      );
      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(error.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.toothRecords.all(patientId) });
    },
  });
}
