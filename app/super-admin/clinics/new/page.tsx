"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateClinic } from "@/hooks/useSuperAdminClinics";

export default function NewClinicPage() {
  const router = useRouter();
  const createClinic = useCreateClinic();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    createClinic.mutate(name, {
      onSuccess: () => {
        toast.success("Klinika je uspješno kreirana");
        router.push("/super-admin");
      },
      onError: (err: unknown) => {
        const e = err as { status?: number; data?: { error?: { fieldErrors?: { name?: string[] } } | string } };
        if (e?.status === 400 && typeof e.data?.error === "object" && e.data.error?.fieldErrors?.name) {
          setError(e.data.error.fieldErrors.name[0]);
        } else {
          toast.error(typeof e.data?.error === "string" ? e.data.error : "Greška pri kreiranju klinike");
        }
      },
    });
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nova klinika</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Naziv klinike *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/super-admin")}>
                Otkaži
              </Button>
              <Button type="submit" disabled={createClinic.isPending}>
                {createClinic.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Kreiranje...</>
                ) : (
                  "Sačuvaj i kreiraj"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
