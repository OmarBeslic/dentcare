"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/admin/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, Clock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useUsers } from "@/hooks/useUsers";
import { usePatientSearch } from "@/hooks/usePatients";
import { useAvailability } from "@/hooks/useAvailability";
import { useCreateAppointment } from "@/hooks/useAppointments";

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

export default function NewAppointmentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: usersData } = useUsers();
  const createAppointment = useCreateAppointment();

  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    dentistId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "",
    duration: "30",
    type: "",
    notes: "",
  });

  const { data: patientData } = usePatientSearch(
    form.patientId ? "" : patientSearch,
  );

  const dentists = (usersData ?? []).filter((u) =>
    ["ADMIN", "DENTIST"].includes(u.role),
  );

  const defaultDentistId = useMemo(() => {
    if (!session || !dentists.length) return "";
    return session.user.role !== "ASSISTANT" ? session.user.id : dentists[0].id;
  }, [session, dentists]);

  const activeDentistId = form.dentistId || defaultDentistId;

  const patients = patientData?.patients ?? [];

  const { data: availData, isPending: loadingSlots } = useAvailability({
    dentistId: activeDentistId,
    date: form.date,
    duration: parseInt(form.duration),
  });
  const slots: { time: string; available: boolean; startTime: string }[] =
    availData?.slots ?? [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.patientId) {
      toast.error("Izaberite pacijenta.");
      return;
    }
    if (!form.startTime) {
      toast.error("Izaberite vrijeme termina.");
      return;
    }

    const selectedSlot = slots.find((s) => s.time === form.startTime);
    if (!selectedSlot) {
      toast.error("Nevažeće vrijeme.");
      return;
    }

    createAppointment.mutate(
      {
        patientId: form.patientId,
        dentistId: activeDentistId,
        startTime: selectedSlot.startTime,
        duration: parseInt(form.duration),
        type: form.type || undefined,
        notes: form.notes || undefined,
      },
      { onSuccess: () => router.push("/admin/appointments") },
    );
  }

  // Reset selected time when availability params change
  useEffect(() => {
    setForm((f) => ({ ...f, startTime: "" }));
  }, [activeDentistId, form.date, form.duration]);

  if (!session) return null;

  return (
    <div>
      <Header
        title="Novi termin"
        user={{ name: session.user.name, role: session.user.role }}
      />
      <div className="p-4 lg:p-6 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/admin/appointments">
            <ArrowLeft className="w-4 h-4" /> Nazad
          </Link>
        </Button>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Podaci o terminu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Patient search */}
              <div className="space-y-2 relative">
                <Label>Pacijent *</Label>
                <Input
                  placeholder="Pretraži po imenu ili telefonu..."
                  value={form.patientId ? form.patientName : patientSearch}
                  onChange={(e) => {
                    if (form.patientId) {
                      setForm((f) => ({
                        ...f,
                        patientId: "",
                        patientName: "",
                      }));
                    }
                    setPatientSearch(e.target.value);
                    setShowPatientDropdown(true);
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                />
                {showPatientDropdown &&
                  patients.length > 0 &&
                  !form.patientId && (
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
                              setForm((f) => ({
                                ...f,
                                patientId: p.id,
                                patientName: `${p.firstName} ${p.lastName}`,
                              }));
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dentist */}
                <div className="space-y-2">
                  <Label>Doktor *</Label>
                  <Select
                    value={activeDentistId}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, dentistId: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Izaberi doktora" />
                    </SelectTrigger>
                    <SelectContent>
                      {dentists.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label>Datum *</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label>Trajanje *</Label>
                  <Select
                    value={form.duration}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, duration: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[15, 30, 60, 90, 120].map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label>Tip pregleda</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Izaberi tip" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Time slots */}
              {activeDentistId && form.date && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Vrijeme početka *
                  </Label>
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
                            setForm((f) => ({ ...f, startTime: slot.time }))
                          }
                          className={cn(
                            "h-10 rounded-lg text-sm font-medium transition-all w-full",
                            !slot.available
                              ? "bg-muted text-muted-foreground/40 cursor-not-allowed line-through"
                              : form.startTime === slot.time
                                ? "bg-primary text-white shadow-sm"
                                : "bg-muted hover:bg-primary-light hover:text-primary border border-border",
                          )}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Napomena</Label>
                <Textarea
                  placeholder="Napomena o terminu..."
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  rows={3}
                />
              </div>

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
      </div>
    </div>
  );
}
