"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateClinic } from "@/hooks/useSuperAdminClinics";
import { createClinicSchema } from "@/lib/validations";

type FormValues = z.infer<typeof createClinicSchema>;

export default function NewClinicPage() {
  const router = useRouter();
  const createClinic = useCreateClinic();

  const form = useForm<FormValues>({
    resolver: zodResolver(createClinicSchema),
    defaultValues: { name: "" },
  });

  function onSubmit(values: FormValues) {
    createClinic.mutate(values.name, {
      onSuccess: () => {
        toast.success("Klinika je uspješno kreirana");
        router.push("/super-admin");
      },
      onError: (err: unknown) => {
        const e = err as { status?: number; data?: { error?: { fieldErrors?: { name?: string[] } } | string } };
        if (e?.status === 400 && typeof e.data?.error === "object" && e.data.error?.fieldErrors?.name) {
          form.setError("name", { message: e.data.error.fieldErrors.name[0] });
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naziv klinike *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
