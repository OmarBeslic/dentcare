"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Loader2, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const serviceTypes = [
  "Kontrola", "Čišćenje kamenca", "Punjenje", "Ekstrakcija",
  "Ortodoncija", "Implant", "Izbeljivanje", "Parodontologija",
  "Hitna pomoć", "Ostalo",
];

interface Dentist { id: string; name: string; }
interface Slot { time: string; available: boolean; startTime: string; }
interface BookingResult {
  dentistName: string;
  startTime: string;
}

export default function BookPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    type: "",
    dentistId: "",
    date: "",
    duration: "30",
    startTime: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  // Fetch dentists (no auth required)
  const { data: dentists = [] } = useQuery<Dentist[]>({
    queryKey: ["public", "dentists"],
    queryFn: async () => {
      const res = await fetch("/api/public/dentists");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  // Fetch available slots when dentist + date + duration are set
  const { data: availData, isPending: loadingSlots } = useQuery({
    queryKey: ["public", "availability", form.dentistId, form.date, form.duration],
    queryFn: async () => {
      const qs = new URLSearchParams({
        dentistId: form.dentistId,
        date: form.date,
        duration: form.duration,
      }).toString();
      const res = await fetch(`/api/public/availability?${qs}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!(form.dentistId && form.date && form.duration),
    staleTime: 30 * 1000,
  });
  const slots: Slot[] = availData?.slots ?? [];
  const offDay: boolean = availData?.offDay ?? false;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!form.dentistId) newErrors.dentistId = "Izaberite doktora";
    if (!form.date) newErrors.date = "Izaberite datum";
    if (!form.startTime) newErrors.startTime = "Izaberite vrijeme termina";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setSubmitting(true);
    setErrors({});

    const res = await fetch("/api/public/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        type: form.type,
        dentistId: form.dentistId,
        startTime: form.startTime,
        duration: parseInt(form.duration),
        message: form.message,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setResult({ dentistName: data.dentistName, startTime: data.startTime });
    } else if (res.status === 400 && data.error?.fieldErrors) {
      const fe: Record<string, string> = {};
      for (const [k, msgs] of Object.entries(data.error.fieldErrors)) {
        fe[k] = (msgs as string[])[0];
      }
      setErrors(fe);
    } else {
      setErrors({ _: data.error ?? "Greška. Pokušajte ponovo." });
    }
    setSubmitting(false);
  }

  function resetForm() {
    setResult(null);
    setForm({
      firstName: "", lastName: "", phone: "", email: "",
      type: "", dentistId: "", date: "", duration: "30", startTime: "", message: "",
    });
  }

  // Reset selected time when availability params change
  useEffect(() => {
    setForm((f) => ({ ...f, startTime: "" }));
  }, [form.dentistId, form.date, form.duration]);

  if (result) {
    const dt = new Date(result.startTime);
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "var(--primary-light)" }}>
            <CheckCircle className="w-8 h-8" style={{ color: "var(--primary)" }} />
          </div>
          <h2 className="font-display text-2xl font-bold mb-3">Termin zakazan!</h2>
          <p className="mb-2" style={{ color: "var(--muted-foreground)" }}>
            Vaš termin je uspješno potvrđen.
          </p>
          <div className="rounded-xl p-4 mb-6 text-left space-y-1" style={{ background: "var(--primary-light)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>
              <User className="w-4 h-4 inline mr-1" />
              {result.dentistName}
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--primary)" }}>
              <Clock className="w-4 h-4 inline mr-1" />
              {format(dt, "dd.MM.yyyy")} u {format(dt, "HH:mm")}
            </p>
          </div>
          <Button onClick={resetForm}>Zakaži novi termin</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: "var(--background)" }}>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">Zakažite pregled</h1>
          <p style={{ color: "var(--muted-foreground)" }}>
            Izaberite doktora, datum i slobodan termin — potvrda odmah.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal info */}
          <Card className="shadow-md">
            <CardHeader><CardTitle className="text-base">Vaši podaci</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ime *</Label>
                  <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="Marko" />
                  {errors.firstName && <p className="text-xs" style={{ color: "var(--destructive)" }}>{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Prezime *</Label>
                  <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Nikolić" />
                  {errors.lastName && <p className="text-xs" style={{ color: "var(--destructive)" }}>{errors.lastName}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Telefon *</Label>
                  <Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+381 60 123 4567" />
                  {errors.phone && <p className="text-xs" style={{ color: "var(--destructive)" }}>{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email (opciono)</Label>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="marko@email.com" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment details */}
          <Card className="shadow-md">
            <CardHeader><CardTitle className="text-base">Detalji termina</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Service type */}
                <div className="space-y-2">
                  <Label>Tip pregleda *</Label>
                  <Select value={form.type} onValueChange={(v) => update("type", v)}>
                    <SelectTrigger><SelectValue placeholder="Izaberi uslugu" /></SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-xs" style={{ color: "var(--destructive)" }}>{errors.type}</p>}
                </div>

                {/* Doctor */}
                <div className="space-y-2">
                  <Label>Doktor *</Label>
                  <Select value={form.dentistId} onValueChange={(v) => update("dentistId", v)}>
                    <SelectTrigger><SelectValue placeholder="Izaberi doktora" /></SelectTrigger>
                    <SelectContent>
                      {dentists.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {errors.dentistId && <p className="text-xs" style={{ color: "var(--destructive)" }}>{errors.dentistId}</p>}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label>Datum *</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => update("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.date && <p className="text-xs" style={{ color: "var(--destructive)" }}>{errors.date}</p>}
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label>Trajanje</Label>
                  <Select value={form.duration} onValueChange={(v) => update("duration", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[15, 30, 60, 90, 120].map((d) => (
                        <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Time slots */}
              {form.dentistId && form.date && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Slobodni termini *
                  </Label>
                  {loadingSlots ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 rounded-lg" />
                      ))}
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-sm py-3" style={{ color: "var(--muted-foreground)" }}>
                      {offDay
                        ? "Doktor ne radi tog dana."
                        : "Nema slobodnih termina za izabrani datum."}
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setForm((f) => ({ ...f, startTime: slot.startTime }))}
                          className={cn(
                            "h-10 rounded-lg text-sm font-medium transition-all w-full",
                            !slot.available
                              ? "bg-muted text-muted-foreground/40 cursor-not-allowed line-through"
                              : form.startTime === slot.startTime
                              ? "bg-primary text-white shadow-sm"
                              : "bg-muted hover:bg-primary-light hover:text-primary border border-border"
                          )}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.startTime && (
                    <p className="text-xs" style={{ color: "var(--destructive)" }}>{errors.startTime}</p>
                  )}
                </div>
              )}

              {/* Message */}
              <div className="space-y-2">
                <Label>Poruka (opciono)</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  placeholder="Opišite tegobe ili specifične zahtjeve..."
                  rows={3}
                />
              </div>

              {errors._ && (
                <p className="text-sm rounded-lg px-3 py-2" style={{ color: "var(--destructive)", background: "color-mix(in srgb, var(--destructive) 10%, transparent)" }}>
                  {errors._}
                </p>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Zakazivanje...</>
                  : "Zakaži termin"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
