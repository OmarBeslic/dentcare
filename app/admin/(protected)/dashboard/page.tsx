import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/admin/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, TrendingUp, XCircle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatTime } from "@/lib/utils";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { statusLabel, statusVariant } from "@/lib/appointment-constants";
import { BookedByBadge } from "@/components/admin/BookedByBadge";
import { EmptyState } from "@/components/admin/EmptyState";

export default async function DashboardPage() {
  const session = await auth();
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    todayCount,
    patientCount,
    monthCount,
    cancelledCount,
    todayAppointments,
  ] = await Promise.all([
    prisma.appointment.count({
      where: { startTime: { gte: todayStart, lte: todayEnd }, status: { not: "CANCELLED" } },
    }),
    prisma.patient.count(),
    prisma.appointment.count({
      where: { startTime: { gte: monthStart, lte: monthEnd }, status: { not: "CANCELLED" } },
    }),
    prisma.appointment.count({
      where: { startTime: { gte: monthStart, lte: monthEnd }, status: "CANCELLED" },
    }),
    prisma.appointment.findMany({
      where: { startTime: { gte: todayStart, lte: todayEnd } },
      include: {
        patient: { select: { firstName: true, lastName: true } },
        dentist: { select: { name: true } },
        bookedBy: { select: { id: true, name: true } },
      },
      orderBy: { startTime: "asc" },
    }),
  ]);

  const stats = [
    { title: "Zakazani danas", value: todayCount, icon: Calendar, color: "text-primary", bg: "bg-primary-light" },
    { title: "Ukupno pacijenata", value: patientCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Pregledi ovog mjeseca", value: monthCount, icon: TrendingUp, color: "text-success", bg: "bg-green-50" },
    { title: "Otkazani ovog mjeseca", value: cancelledCount, icon: XCircle, color: "text-destructive", bg: "bg-red-50" },
  ];

  return (
    <div>
      <Header
        title="Dashboard"
        user={{ name: session!.user.name, role: session!.user.role }}
      />
      <div className="p-4 lg:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ title, value, icon: Icon, color, bg }) => (
            <Card key={title}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-3xl font-bold mt-1">{value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">Današnji termini</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/appointments" className="flex items-center gap-1">
                Svi termini <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <EmptyState icon={Clock} message="Nema zakazanih termina za danas." />
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-sm font-semibold text-primary w-12 flex-shrink-0">
                        {formatTime(apt.startTime)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {apt.patient.firstName} {apt.patient.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {apt.type ?? "Opšti pregled"} · {apt.dentist.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="hidden sm:inline-flex">
                        <BookedByBadge bookedBy={apt.bookedBy} />
                      </span>
                      <Badge variant={statusVariant[apt.status]}>
                        {statusLabel[apt.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
