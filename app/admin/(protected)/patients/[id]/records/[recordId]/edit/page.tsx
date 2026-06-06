"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/admin/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { ToothChart } from "@/components/admin/ToothChart";
import type { ToothChart as ToothChartType } from "@/types";
import { useRecord, useUpdateRecord } from "@/hooks/useRecord";

export default function EditRecordPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const recordId = params.recordId as string;
  const { data: session } = useSession();

  const [form, setForm] = useState({
    visitDate: "",
    diagnosis: "",
    treatment: "",
    prescription: "",
    notes: "",
  });
  const [toothChart, setToothChart] = useState<ToothChartType>({});

  const { data, isPending } = useRecord(patientId, recordId);
  const updateRecord = useUpdateRecord(patientId, recordId);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    updateRecord.mutate(
      { ...form, toothChart },
      {
        onSuccess: () => {
          toast.success("Karton sačuvan!");
          router.push(`/admin/patients/${patientId}`);
        },
        onError: (err: Error) => {
          toast.error(err.message ?? "Greška.");
        },
      }
    );
  }

  // Populate form when data loads
  useEffect(() => {
    if (data && !form.visitDate) {
      setForm({
        visitDate: format(new Date(data.visitDate), "yyyy-MM-dd"),
        diagnosis: data.diagnosis ?? "",
        treatment: data.treatment ?? "",
        prescription: data.prescription ?? "",
        notes: data.notes ?? "",
      });
      setToothChart((data.toothChart as ToothChartType) ?? {});
    }
  }, [data, form.visitDate]);

  if (!session) return null;

  return (
    <div>
      <Header title="Uredi karton" user={{ name: session.user.name, role: session.user.role }} />
      <div className="p-4 lg:p-6 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href={`/admin/patients/${patientId}`}><ArrowLeft className="w-4 h-4" /> Nazad</Link>
        </Button>
        {isPending ? (
          <Card><CardContent className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </CardContent></Card>
        ) : (
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
                  <Textarea value={form.diagnosis} onChange={(e) => update("diagnosis", e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Tretman</Label>
                  <Textarea value={form.treatment} onChange={(e) => update("treatment", e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Recept / Terapija</Label>
                  <Textarea value={form.prescription} onChange={(e) => update("prescription", e.target.value)} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Napomene</Label>
                  <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} />
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
              <Button type="submit" disabled={updateRecord.isPending}>
                {updateRecord.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Čuvanje...</>
                  : "Sačuvaj izmjene"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/admin/patients/${patientId}`}>Otkaži</Link>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
