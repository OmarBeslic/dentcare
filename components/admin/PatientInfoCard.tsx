"use client";

import { Phone, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PatientActions } from "@/components/admin/PatientActions";
import { useCanView } from "@/hooks/useCanView";
import { formatDate } from "@/lib/utils";
import type { Patient } from "@/types";

export function PatientInfoCard({ patient, age }: { patient: Patient; age: number }) {
  const canViewJmbg = useCanView("jmbg");
  const canViewNotes = useCanView("patientNotes");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="font-display text-xl sm:text-2xl">
          {patient.firstName} {patient.lastName}
        </CardTitle>
        <PatientActions patient={patient} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
          {canViewJmbg && (
            <div>
              <p className="text-xs text-muted-foreground">JMBG</p>
              <p className="font-mono">{patient.jmbg}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Telefon</p>
            <p className="font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              {patient.phone}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Datum rodjenja</p>
            <p className="font-medium">
              {formatDate(patient.dateOfBirth)} <span className="text-muted-foreground">({age} god.)</span>
            </p>
          </div>
        </div>
        {canViewNotes && patient.notes && (
          <>
            <Separator />
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Napomene
              </p>
              <p className="text-sm">{patient.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
