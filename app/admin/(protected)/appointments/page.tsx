"use client";

import { useState } from "react";
import { Header } from "@/components/admin/Header";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, Clock, Check, X } from "lucide-react";
import Link from "next/link";
import { formatTime } from "@/lib/utils";
import { format } from "date-fns";
import type { AppointmentWithRelations, AppointmentStatus } from "@/types";
import { useAppointments, useUpdateAppointmentStatus } from "@/hooks/useAppointments";
import { useUsers } from "@/hooks/useUsers";

const statusLabel: Record<AppointmentStatus, string> = {
  SCHEDULED: "Zakazano",
  COMPLETED: "Završeno",
  CANCELLED: "Otkazano",
  NO_SHOW: "Nije došao",
};

const statusVariant: Record<AppointmentStatus, "teal" | "success" | "destructive" | "warning"> = {
  SCHEDULED: "teal",
  COMPLETED: "success",
  CANCELLED: "destructive",
  NO_SHOW: "warning",
};

export default function AppointmentsPage() {
  const { data: session } = useSession();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [status, setStatus] = useState("ALL");
  const [dentistId, setDentistId] = useState("ALL");

  const { data: usersData } = useUsers();
  const dentists = (usersData ?? []).filter((u) =>
    ["ADMIN", "DENTIST"].includes(u.role)
  );

  const { data, isPending } = useAppointments({ date, status, dentistId });
  const appointments: AppointmentWithRelations[] = data?.appointments ?? [];

  const updateStatus = useUpdateAppointmentStatus();

  if (!session) return null;

  return (
    <div>
      <Header title="Zakazivanja" user={{ name: session.user.name, role: session.user.role }} />
      <div className="p-4 lg:p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-44"
            />
            <Select value={status} onValueChange={setStatus}>
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
            <Select value={dentistId} onValueChange={setDentistId}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Doktor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Svi doktori</SelectItem>
                {dentists.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button asChild>
            <Link href="/admin/appointments/new">
              <Plus className="w-4 h-4" />
              Novi termin
            </Link>
          </Button>
        </div>

        {/* Table — desktop */}
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
                  <TableHead className="text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isPending ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Nema termina za izabrani datum.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">{formatTime(apt.startTime)}</TableCell>
                      <TableCell className="text-muted-foreground">{apt.duration} min</TableCell>
                      <TableCell>
                        <Link href={`/admin/patients/${apt.patientId}`} className="hover:text-primary transition-colors font-medium">
                          {apt.patient.firstName} {apt.patient.lastName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{apt.type ?? "—"}</TableCell>
                      <TableCell>{apt.dentist.name}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[apt.status]}>{statusLabel[apt.status]}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {apt.status === "SCHEDULED" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-success hover:text-success hover:bg-green-50"
                                onClick={() => updateStatus.mutate({ id: apt.id, status: "COMPLETED" })}
                                title="Završi"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-50"
                                    title="Otkaži"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Otkaži termin?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Jeste li sigurni da želite da otkažete ovaj termin?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Nazad</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => updateStatus.mutate({ id: apt.id, status: "CANCELLED" })}
                                    >
                                      Otkaži termin
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Cards — mobile */}
        <div className="block md:hidden space-y-3">
          {isPending ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))
          ) : appointments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nema termina za izabrani datum.</p>
            </div>
          ) : (
            appointments.map((apt) => (
              <Card key={apt.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-semibold text-primary">{formatTime(apt.startTime)}</span>
                        <span className="text-xs text-muted-foreground">({apt.duration} min)</span>
                      </div>
                      <p className="font-medium">{apt.patient.firstName} {apt.patient.lastName}</p>
                      <p className="text-sm text-muted-foreground">{apt.type ?? "Opšti pregled"} · {apt.dentist.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={statusVariant[apt.status]}>{statusLabel[apt.status]}</Badge>
                      {apt.status === "SCHEDULED" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-success border-success/30"
                            onClick={() => updateStatus.mutate({ id: apt.id, status: "COMPLETED" })}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-destructive border-destructive/30"
                            onClick={() => updateStatus.mutate({ id: apt.id, status: "CANCELLED" })}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
