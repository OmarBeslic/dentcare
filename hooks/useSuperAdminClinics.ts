import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

export function useCreateClinic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/super-admin/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (!res.ok) throw { status: res.status, data: json };
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clinics.all });
    },
  });
}

export function useUpdateClinic(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: object) => {
      const res = await fetch(`/api/super-admin/clinics/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clinics.all });
    },
  });
}
