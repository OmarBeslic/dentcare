"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Smile, ClipboardList } from "lucide-react";
import { ToothChart } from "./tooth-chart";
import { TreatmentTable } from "./TreatmentTable";
import { TreatmentForm } from "./TreatmentForm";
import { useToothChart, useUpdateToothCondition } from "@/hooks/useToothChart";
import type { ToothCondition } from "@/types";

interface Props {
  patientId: string;
  clinicId: string;
}

export function PatientDentalSection({ patientId, clinicId }: Props) {
  const { data: session } = useSession();
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const { data: chart, isPending: chartPending, isError: chartError } = useToothChart(patientId);
  const updateCondition = useUpdateToothCondition(patientId);

  const canAddTreatment = session?.user.role === "ADMIN" || session?.user.role === "DENTIST";

  function handleToothClick(tooth: number) {
    setSelectedTooth((prev) => (prev === tooth ? null : tooth));
  }

  function handleConditionChange(tooth: number, condition: ToothCondition) {
    updateCondition.mutate({ toothNumber: tooth, condition });
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Smile className="w-4 h-4" /> Zubni karton
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartPending ? (
            <Skeleton className="h-40 w-full" />
          ) : chartError ? (
            <p className="text-sm text-destructive py-4 text-center">Greška pri učitavanju zubnog kartona.</p>
          ) : (
            <ToothChart
              patientId={patientId}
              chartData={chart?.chartData ?? {}}
              treatedTeeth={chart?.treatedTeeth ?? []}
              selectedTooth={selectedTooth}
              onToothClick={handleToothClick}
              onToothConditionChange={handleConditionChange}
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Tretmani
          </CardTitle>
          {canAddTreatment && (
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4" /> Dodaj tretman
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <TreatmentTable
            patientId={patientId}
            clinicId={clinicId}
            selectedTooth={selectedTooth}
            onClearFilter={() => setSelectedTooth(null)}
          />
        </CardContent>
      </Card>

      {addOpen && (
        <TreatmentForm
          patientId={patientId}
          clinicId={clinicId}
          onSuccess={() => setAddOpen(false)}
          onCancel={() => setAddOpen(false)}
        />
      )}
    </>
  );
}
