import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { toast } from "sonner";
import type { Role } from "@prisma/client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  clinic: { name: string };
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      return (Array.isArray(data) ? data : []) as User[];
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: object) => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw { status: res.status, data: json };
      return json as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("Korisnik dodat!");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Greška.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("Korisnik obrisan.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
