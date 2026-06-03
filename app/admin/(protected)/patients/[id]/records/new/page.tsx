"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { format } from "date-fns";
import { ToothChart } from "@/components/admin/ToothChart";
import type { ToothChart as ToothChartType } from "@/types";

export default function NewRecordPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const { data: session } = useSession();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    visitDate: format(new Date(), "yyyy-MM-dd"),
    diagnosis: "",
    treatment: "",
    prescription: "",
    notes: "",
  });
  const [toothChart, setToothChart] = useState<ToothChartType>({});

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch(`/api/patients/${patientId}/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, toothChart }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Karton uspješno dodat!");
      router.push(`/admin/patients/${patientId}`);
    } else {
      toast.error(data.error ?? "Greška.");
      setSubmitting(false);
    }
  }

  if (!session) return null;

  return (
    <div>
      <Header title="Novi karton" user={{ name: session.user.name, role: session.user.role }} />
      <div className="p-4 lg:p-6 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href={`/admin/patients/${patientId}`}><ArrowLeft className="w-4 h-4" /> Nazad</Link>
        </Button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Medicinski karton</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Datum posete *</Label>
                <Input type="date" value={form.visitDate} onChange={(e) => update("visitDate", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Dijagnoza</Label>
                <Textarea value={form.diagnosis} onChange={(e) => update("diagnosis", e.target.value)} rows={3} placeholder="Unesite dijagnozu..." />
              </div>
              <div className="space-y-2">
                <Label>Tretman</Label>
                <Textarea value={form.treatment} onChange={(e) => update("treatment", e.target.value)} rows={3} placeholder="Unesite opis tretmana..." />
              </div>
              <div className="space-y-2">
                <Label>Recept / Terapija</Label>
                <Textarea value={form.prescription} onChange={(e) => update("prescription", e.target.value)} rows={2} placeholder="Propisani lekovi ili terapija..." />
              </div>
              <div className="space-y-2">
                <Label>Napomene</Label>
                <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} placeholder="Dodatne napomene..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Zubni grafikon</CardTitle></CardHeader>
            <CardContent>
              <ToothChart value={toothChart} onChange={setToothChart} />
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Čuvanje...</> : "Sačuvaj karton"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/admin/patients/${patientId}`}>Otkaži</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
