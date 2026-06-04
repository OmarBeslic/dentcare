import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/admin/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Phone, Calendar, FileText, Clock } from "lucide-react";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";
import type { AppointmentStatus } from "@prisma/client";
import { PatientActions } from "@/components/admin/PatientActions";

const statusLabel: Record<AppointmentStatus, string> = {
  SCHEDULED: "Zakazano", COMPLETED: "Završeno", CANCELLED: "Otkazano", NO_SHOW: "Nije došao",
};
const statusVariant: Record<AppointmentStatus, "teal" | "success" | "destructive" | "warning"> = {
  SCHEDULED: "teal", COMPLETED: "success", CANCELLED: "destructive", NO_SHOW: "warning",
};

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
        include: { dentist: { select: { name: true } } },
        orderBy: { startTime: "desc" },
      },
      records: {
        include: { createdBy: { select: { name: true } } },
        orderBy: { visitDate: "desc" },
      },
      _count: { select: { appointments: true, records: true } },
    },
  });

  if (!patient) notFound();

  return (
    <div>
      <Header
        title={`${patient.firstName} ${patient.lastName}`}
        user={{ name: session!.user.name, role: session!.user.role }}
      />
      <div className="p-4 lg:p-6 space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/patients"><ArrowLeft className="w-4 h-4" /> Pacijenti</Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Info */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base">Informacije o pacijentu</CardTitle>
              <PatientActions patient={patient} />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Ime</p>
                  <p className="font-medium">{patient.firstName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Prezime</p>
                  <p className="font-medium">{patient.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Datum rodjenja</p>
                  <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
                  <p className="text-xs text-muted-foreground">{Math.floor((Date.now() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} godina</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">JMBG</p>
                  <p className="font-mono text-sm">{patient.jmbg}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Telefon</p>
                  <p className="font-medium flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />{patient.phone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pacijent od</p>
                  <p className="font-medium">{formatDate(patient.createdAt)}</p>
                </div>
              </div>
              {patient.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Napomene</p>
                    <p className="text-sm">{patient.notes}</p>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex gap-3">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/appointments/new?patientId=${patient.id}`}>
                    <Plus className="w-4 h-4" /> Novi termin
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Records */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" /> Kartoni ({patient._count.records})
              </CardTitle>
              <Button asChild size="sm">
                <Link href={`/admin/patients/${id}/records/new`}>
                  <Plus className="w-4 h-4" /> Novi karton
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {patient.records.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Nema kartona.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patient.records.map((r) => (
                    <Link key={r.id} href={`/admin/patients/${id}/records/${r.id}/edit`}>
                      <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">{formatDate(r.visitDate)}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {r.diagnosis ?? "Bez dijagnoze"}
                            </p>
                            <p className="text-xs text-muted-foreground">Dr. {r.createdBy.name}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appointments history */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Termini ({patient._count.appointments})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.appointments.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Nema termina.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {patient.appointments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold text-primary w-24 flex-shrink-0">
                          {formatDate(a.startTime)} {formatTime(a.startTime)}
                        </div>
                        <div>
                          <p className="text-sm">{a.type ?? "Opšti pregled"}</p>
                          <p className="text-xs text-muted-foreground">{a.dentist.name} · {a.duration} min</p>
                        </div>
                      </div>
                      <Badge variant={statusVariant[a.status]}>{statusLabel[a.status]}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
