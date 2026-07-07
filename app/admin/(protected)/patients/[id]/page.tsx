import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/app/admin/_components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarClock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientInfoCard } from "../_components/PatientInfoCard";
import { PatientDentalSection } from "../_components/PatientDentalSection";
import { PatientAppointmentHistory } from "../_components/PatientAppointmentHistory";
import { isGlobalRole } from "@/lib/clinic-scope";

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: {
        where: { status: "SCHEDULED" },
        select: {
          id: true,
          startTime: true,
          type: true,
          duration: true,
          status: true,
          dentist: { select: { name: true } },
        },
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!patient) notFound();
  if (!isGlobalRole(session!.user.role) && patient.clinicId !== session!.user.clinicId) {
    notFound();
  }

  const age = Math.floor(
    (Date.now() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  return (
    <div>
      <Header
        title={`${patient.firstName} ${patient.lastName}`}
        user={{ name: session!.user.name, role: session!.user.role }}
      />
      <div className="p-4 lg:p-6 space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/patients">
            <ArrowLeft className="w-4 h-4" /> Pacijenti
          </Link>
        </Button>

        <PatientInfoCard patient={patient} age={age} />

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarClock className="w-4 h-4" /> Zakazani termini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PatientAppointmentHistory appointments={patient.appointments} />
          </CardContent>
        </Card>

        <PatientDentalSection patientId={patient.id} clinicId={patient.clinicId} />
      </div>
    </div>
  );
}
