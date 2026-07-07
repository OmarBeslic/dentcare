"use client";

import { useState } from "react";
import type { Role } from "@prisma/client";
import { Header } from "@/app/admin/_components/Header";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { formatTime } from "@/lib/utils";
import { format } from "date-fns";
import { statusLabel, statusVariant } from "@/lib/appointment-constants";
import { BookedByBadge } from "@/app/admin/_components/BookedByBadge";
import { EmptyState } from "@/app/admin/_components/EmptyState";
import { PaginationBar } from "@/app/admin/_components/PaginationBar";
import { AppointmentStatusActions } from "./_components/AppointmentStatusActions";
import type { AppointmentWithRelations } from "@/types";
import {
  useAppointments,
  useUpdateAppointmentStatus,
  APPOINTMENTS_PAGE_SIZE,
} from "@/hooks/useAppointments";
import { useUsers } from "@/hooks/useUsers";

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [status, setStatus] = useState("ALL");
  const [dentistId, setDentistId] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data: usersData } = useUsers();
  const dentists = (usersData ?? []).filter((u) =>
    ["ADMIN", "DENTIST"].includes(u.role),
  );

  const { data, isPending } = useAppointments({
    date,
    status,
    dentistId,
    page,
  });
  const appointments: AppointmentWithRelations[] = data?.appointments ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / APPOINTMENTS_PAGE_SIZE));

  const updateStatus = useUpdateAppointmentStatus();

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(1);
  }

  if (!session) return null;

  return (
    <div>
      <Header
        title="Zakazivanja"
        user={{ name: session.user.name, role: session.user.role as Role }}
      />
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
            <Input
              type="date"
              value={date}
              onChange={(e) =>
                handleFilterChange(() => setDate(e.target.value))
              }
              className="w-full sm:w-44"
            />
            <Select
              value={status}
              onValueChange={(v) => handleFilterChange(() => setStatus(v))}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Svi statusi</SelectItem>
                <SelectItem value="SCHEDULED">Zakazano</SelectItem>
                <SelectItem value="COMPLETED">Završeno</SelectItem>
                <SelectItem value="CANCELLED">Otkazano</SelectItem>
                <SelectItem value="NO_SHOW">Nije došao</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={dentistId}
              onValueChange={(v) => handleFilterChange(() => setDentistId(v))}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Doktor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Svi doktori</SelectItem>
                {dentists.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button asChild>
            <Link href="/admin/appointments/new">
              <Plus className="w-4 h-4" /> Novi termin
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {isPending
            ? "Učitavanje..."
            : `${total} termin${total === 1 ? "" : "a"}`}
        </p>

        {/* desktop */}
        <div className="hidden md:block">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vrijeme</TableHead>
                  <TableHead>Trajanje</TableHead>
                  <TableHead>Pacijent</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Doktor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Zakazao</TableHead>
                  <TableHead className="text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <EmptyState
                        icon={Calendar}
                        message="Nema termina za izabrani datum."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">
                        {formatTime(apt.startTime)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {apt.duration} min
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/patients/${apt.patientId}`}
                          className="hover:text-primary transition-colors font-medium"
                        >
                          {apt.patient.firstName} {apt.patient.lastName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {apt.type ?? "—"}
                      </TableCell>
                      <TableCell>{apt.dentist.name}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[apt.status]}>
                          {statusLabel[apt.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <BookedByBadge bookedBy={apt.bookedBy} />
                      </TableCell>
                      <TableCell>
                        <AppointmentStatusActions
                          status={apt.status}
                          onComplete={() =>
                            updateStatus.mutate({
                              id: apt.id,
                              status: "COMPLETED",
                            })
                          }
                          onCancel={() =>
                            updateStatus.mutate({
                              id: apt.id,
                              status: "CANCELLED",
                            })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* cards — mobile */}
        <div className="block md:hidden space-y-3">
          {isPending ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))
          ) : appointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              message="Nema termina za izabrani datum."
            />
          ) : (
            appointments.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-semibold text-primary">
                          {formatTime(apt.startTime)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({apt.duration} min)
                        </span>
                      </div>
                      <p className="font-medium">
                        {apt.patient.firstName} {apt.patient.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {apt.type ?? "Opšti pregled"} · {apt.dentist.name}
                      </p>
                      <div className="mt-1">
                        <BookedByBadge bookedBy={apt.bookedBy} />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={statusVariant[apt.status]}>
                        {statusLabel[apt.status]}
                      </Badge>
                      <AppointmentStatusActions
                        status={apt.status}
                        onComplete={() =>
                          updateStatus.mutate({
                            id: apt.id,
                            status: "COMPLETED",
                          })
                        }
                        onCancel={() =>
                          updateStatus.mutate({
                            id: apt.id,
                            status: "CANCELLED",
                          })
                        }
                        variant="card"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <PaginationBar
          page={page}
          totalPages={totalPages}
          isPending={isPending}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      </div>
    </div>
  );
}
