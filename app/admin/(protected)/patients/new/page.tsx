"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/app/admin/_components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useCreatePatient } from "@/hooks/usePatients";
import z from "zod";
import { patientSchema } from "@/lib/validations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type FormValues = z.infer<typeof patientSchema>;
export default function NewPatientPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const createPatient = useCreatePatient();

  const form = useForm<FormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      jmbg: "",
      phone: "",
      notes: "",
    },
  });

  function onSubmit(values: FormValues) {
    createPatient.mutate(values, {
      onSuccess: (data) => router.push(`/admin/patients/${data.id}`),
      onError: (err: unknown) => {
        const e = err as {
          status?: number;
          data?: {
            error?: { fieldErrors?: Record<string, string[]> } | string;
          };
        };

        const msg =
          typeof e.data?.error === "string"
            ? e.data.error
            : "Greška pri dodavanju pacijenta.";
        toast.error(msg);
      },
    });
  }

  if (!session) return null;

  return (
    <div>
      <Header
        title="Novi pacijent"
        user={{ name: session.user.name, role: session.user.role }}
      />
      <div className="p-4 lg:p-6 max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/admin/patients">
            <ArrowLeft className="w-4 h-4" /> Nazad
          </Link>
        </Button>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Podaci o pacijentu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ime *</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="Marko" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prezime *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Nikolić"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Datum rodjenja *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="jmbg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>JMBG *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="0101990123456"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon *</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="+382 69 123 4567"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Napomene</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={3}
                            placeholder="Alergije, posebne napomene..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={createPatient.isPending}
                    className="w-full sm:w-auto"
                  >
                    {createPatient.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Dodavanje...
                      </>
                    ) : (
                      "Dodaj pacijenta"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto"
                  >
                    <Link href="/admin/patients">Otkaži</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
