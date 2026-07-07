"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/app/admin/_components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useCreatePatient } from "@/hooks/usePatients";

export default function NewPatientPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const createPatient = useCreatePatient();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    jmbg: "",
    phone: "",
    notes: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    createPatient.mutate(form, {
      onSuccess: (data) => router.push(`/admin/patients/${data.id}`),
      onError: (err: unknown) => {
        const e = err as { status?: number; data?: { error?: { fieldErrors?: Record<string, string[]> } | string } };
        if (e?.status === 400 && typeof e.data?.error === "object" && e.data.error?.fieldErrors) {
          const fe: Record<string, string> = {};
          for (const [k, msgs] of Object.entries(e.data.error.fieldErrors)) {
            fe[k] = (msgs as string[])[0];
          }
          setErrors(fe);
        } else {
          const msg = typeof e.data?.error === "string" ? e.data.error : "Greška pri dodavanju pacijenta.";
          toast.error(msg);
        }
      },
    });
  }

  if (!session) return null;

  return (
    <div>
      <Header title="Novi pacijent" user={{ name: session.user.name, role: session.user.role }} />
      <div className="p-4 lg:p-6 max-w-2xl">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/admin/patients"><ArrowLeft className="w-4 h-4" /> Nazad</Link>
        </Button>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader><CardTitle className="text-base">Podaci o pacijentu</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ime *</Label>
                  <Input
                    id="firstName"
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    placeholder="Marko"
                  />
                  {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Prezime *</Label>
                  <Input
                    id="lastName"
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    placeholder="Nikolić"
                  />
                  {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Datum rodjenja *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => update("dateOfBirth", e.target.value)}
                  />
                  {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jmbg">JMBG *</Label>
                  <Input
                    id="jmbg"
                    value={form.jmbg}
                    onChange={(e) => update("jmbg", e.target.value)}
                    placeholder="0101990123456"
                    maxLength={13}
                    className="font-mono"
                  />
                  {errors.jmbg && <p className="text-xs text-destructive">{errors.jmbg}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon *</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+381 60 123 4567"
                    type="tel"
                  />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Napomene</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  placeholder="Alergije, posebne napomene..."
                  rows={3}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button type="submit" disabled={createPatient.isPending} className="w-full sm:w-auto">
                  {createPatient.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Dodavanje...</> : "Dodaj pacijenta"}
                </Button>
                <Button type="button" variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/admin/patients">Otkaži</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
