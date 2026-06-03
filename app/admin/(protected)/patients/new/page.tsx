"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/admin/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewPatientPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Pacijent uspješno dodat!");
      router.push(`/admin/patients/${data.id}`);
    } else if (res.status === 400 && data.error?.fieldErrors) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, msgs] of Object.entries(data.error.fieldErrors)) {
        fieldErrors[key] = (msgs as string[])[0];
      }
      setErrors(fieldErrors);
      setSubmitting(false);
    } else {
      toast.error(data.error ?? "Greška pri dodavanju pacijenta.");
      setSubmitting(false);
    }
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
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Dodavanje...</> : "Dodaj pacijenta"}
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
