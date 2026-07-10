"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import type { Role } from "@prisma/client";
import { Header } from "@/app/admin/_components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Loader2, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useUsers } from "@/hooks/useUsers";
import { usePatientSearch } from "@/hooks/usePatients";
import { useAvailability } from "@/hooks/useAvailability";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { useDebounce } from "@/hooks/useDebounce";
import { appointmentSchema } from "@/lib/validations";

const appointmentTypes = [
  "Kontrola",
  "Ekstrakcija",
  "Punjenje",
  "Čišćenje kamenca",
  "Ortodoncija",
  "Implant",
  "Izbeljivanje",
  "Parodontologija",
  "Rendgen",
];

// Client-side variant of appointmentSchema: duration is already a real number
// here (the Select converts it), so it uses z.number() instead of the server's
// z.coerce.number() — coerce's input type is `unknown`, which conflicts with
// useForm's typed defaultValues/field values.
const formSchema = appointmentSchema.extend({
  duration: z.number().refine((v) => [15, 30, 60, 90, 120].includes(v), {
    message: "Trajanje mora biti 15, 30, 60, 90 ili 120 minuta",
  }),
});
type FormValues = z.infer<typeof formSchema>;

export default function NewAppointmentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: usersData } = useUsers();
  const createAppointment = useCreateAppointment();

  const [patientSearch, setPatientSearch] = useState("");
  const patientSearchDebounce = useDebounce(patientSearch, 500);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      dentistId: "",
      startTime: "",
      duration: 30,
      type: "",
      notes: "",
    },
  });

  const patientId = form.watch("patientId");
  const dentistId = form.watch("dentistId");
  const duration = form.watch("duration");
  const startTime = form.watch("startTime");

  const { data: patientData } = usePatientSearch(
    patientId ? "" : patientSearchDebounce,
  );

  const dentists = (usersData ?? []).filter((u) =>
    ["ADMIN", "DENTIST"].includes(u.role),
  );

  const defaultDentistId = useMemo(() => {
    if (!session || !dentists.length) return "";
    return session.user.role !== "ASSISTANT" ? session.user.id : dentists[0].id;
  }, [session, dentists]);

  // Pre-select the first available dentist once known; user can still change it.
  useEffect(() => {
    if (defaultDentistId && !form.getValues("dentistId")) {
      form.setValue("dentistId", defaultDentistId);
    }
  }, [defaultDentistId, form]);

  const patients = patientData?.patients ?? [];

  const { data: availData, isPending: loadingSlots } = useAvailability({
    dentistId,
    date,
    duration,
  });
  const slots: { time: string; available: boolean; startTime: string }[] =
    availData?.slots ?? [];

  function onSubmit(values: FormValues) {
    createAppointment.mutate(values, {
      onSuccess: () => router.push("/admin/appointments"),
    });
  }

  // Reset selected time when availability params change
  useEffect(() => {
    form.setValue("startTime", "");
  }, [dentistId, date, duration, form]);

  if (!session) return null;

  return (
    <div>
      <Header
        title="Novi termin"
        user={{ name: session.user.name, role: session.user.role as Role }}
      />
      <div className="p-4 lg:p-6 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/admin/appointments">
            <ArrowLeft className="w-4 h-4" /> Nazad
          </Link>
        </Button>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Podaci o terminu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={() => (
                    <FormItem className="relative">
                      <FormLabel>Pacijent *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Pretraži po imenu ili telefonu..."
                          value={patientId ? patientName : patientSearch}
                          onChange={(e) => {
                            if (patientId) {
                              form.setValue("patientId", "");
                              setPatientName("");
                            }
                            setPatientSearch(e.target.value);
                            setShowPatientDropdown(true);
                          }}
                          onFocus={() => setShowPatientDropdown(true)}
                        />
                      </FormControl>
                      {showPatientDropdown &&
                        patients.length > 0 &&
                        !patientId && (
                          <div className="absolute z-10 w-full bg-card border border-border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                            {patients.map(
                              (p: {
                                id: string;
                                firstName: string;
                                lastName: string;
                                phone: string;
                              }) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm transition-colors"
                                  onClick={() => {
                                    form.setValue("patientId", p.id, {
                                      shouldValidate: true,
                                    });
                                    setPatientName(
                                      `${p.firstName} ${p.lastName}`,
                                    );
                                    setPatientSearch("");
                                    setShowPatientDropdown(false);
                                  }}
                                >
                                  <span className="font-medium">
                                    {p.firstName} {p.lastName}
                                  </span>
                                  <span className="text-muted-foreground ml-2">
                                    {p.phone}
                                  </span>
                                </button>
                              ),
                            )}
                          </div>
                        )}
                      <p className="text-xs text-muted-foreground">
                        Nema pacijenta?{" "}
                        <Link
                          href="/admin/patients/new"
                          className="text-primary hover:underline"
                        >
                          Dodaj novog
                        </Link>
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dentistId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Doktor *</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Izaberi doktora" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {dentists.map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date, not part of the submitted schema, only used to query availability */}
                  <div className="space-y-2">
                    <FormLabel>Datum *</FormLabel>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={format(new Date(), "yyyy-MM-dd")}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trajanje *</FormLabel>
                        <Select
                          value={String(field.value)}
                          onValueChange={(v) => field.onChange(Number(v))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[15, 30, 60, 90, 120].map((d) => (
                              <SelectItem key={d} value={String(d)}>
                                {d} min
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tip pregleda</FormLabel>
                        <Select
                          value={field.value ?? ""}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Izaberi tip" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {appointmentTypes.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {dentistId && date && (
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={() => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Vrijeme početka *
                        </FormLabel>
                        {loadingSlots ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                            {Array.from({ length: 12 }).map((_, i) => (
                              <Skeleton key={i} className="h-10 rounded-lg" />
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                            {slots.map((slot) => (
                              <button
                                key={slot.time}
                                type="button"
                                disabled={!slot.available}
                                onClick={() =>
                                  form.setValue("startTime", slot.startTime, {
                                    shouldValidate: true,
                                  })
                                }
                                className={cn(
                                  "h-10 rounded-lg text-sm font-medium transition-all w-full",
                                  !slot.available
                                    ? "bg-muted text-muted-foreground/40 cursor-not-allowed line-through"
                                    : startTime === slot.startTime
                                      ? "bg-primary text-white shadow-sm"
                                      : "bg-muted hover:bg-primary-light hover:text-primary border border-border",
                                )}
                              >
                                {slot.time}
                              </button>
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Napomena</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Napomena o terminu..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={createAppointment.isPending}
                    className="w-full sm:w-auto"
                  >
                    {createAppointment.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />{" "}
                        Zakazivanje...
                      </>
                    ) : (
                      "Zakaži termin"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto"
                  >
                    <Link href="/admin/appointments">Otkaži</Link>
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
