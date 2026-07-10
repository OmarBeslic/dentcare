"use client";

import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import type { Clinic } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUpdateClinic } from "@/hooks/useSuperAdminClinics";
import { createClinicSchema } from "@/lib/validations";

type FormValues = z.infer<typeof createClinicSchema>;

export function ClinicDetailClient({ clinic }: { clinic: Clinic }) {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(createClinicSchema),
    defaultValues: { name: clinic.name },
  });

  const saveDetails = useUpdateClinic(clinic.id);
  const toggleStatus = useUpdateClinic(clinic.id);

  function onSubmit(values: FormValues) {
    saveDetails.mutate(values, {
      onSuccess: () => {
        toast.success("Klinika je ažurirana");
        router.refresh();
      },
      onError: () => toast.error("Greška pri čuvanju izmena"),
    });
  }

  function handleToggleActive() {
    toggleStatus.mutate({ isActive: !clinic.isActive }, {
      onSuccess: () => {
        toast.success(clinic.isActive ? "Klinika je deaktivirana" : "Klinika je aktivirana");
        router.refresh();
      },
      onError: () => toast.error("Greška pri promeni statusa"),
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          {clinic.name}
          <Badge variant={clinic.isActive ? "success" : "destructive"}>
            {clinic.isActive ? "Aktivna" : "Neaktivna"}
          </Badge>
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleToggleActive} disabled={toggleStatus.isPending}>
          {toggleStatus.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : clinic.isActive ? (
            "Deaktiviraj"
          ) : (
            "Aktiviraj"
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Naziv</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={saveDetails.isPending}>
                {saveDetails.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Sačuvaj
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
