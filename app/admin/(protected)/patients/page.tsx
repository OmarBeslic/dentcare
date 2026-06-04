"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/admin/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Users, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { usePatients, PATIENTS_PAGE_SIZE } from "@/hooks/usePatients";
import type { Patient } from "@/types";

type PatientWithStats = Patient & {
  _count: { appointments: number; records: number };
  appointments: { startTime: Date }[];
};

export default function PatientsPage() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isPending } = usePatients(search, page);
  const patients: PatientWithStats[] = data?.patients ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PATIENTS_PAGE_SIZE));

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  if (!session) return null;

  return (
    <div>
      <Header title="Pacijenti" user={{ name: session.user.name, role: session.user.role }} />
      <div className="p-4 lg:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži po imenu, JMBG ili telefonu..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button asChild>
            <Link href="/admin/patients/new">
              <Plus className="w-4 h-4" /> Novi pacijent
            </Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          {isPending ? "Učitavanje..." : `${total} pacijent${total === 1 ? "" : "a"}`}
        </p>

        {/* Desktop table */}
        <div className="hidden md:block">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ime i prezime</TableHead>
                  <TableHead>JMBG</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Datum rodjenja</TableHead>
                  <TableHead>Termini</TableHead>
                  <TableHead>Kartoni</TableHead>
                  <TableHead></TableHead>
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
                ) : patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">
                        {search ? "Nema rezultata pretrage." : "Nema pacijenata."}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <Link href={`/admin/patients/${p.id}`} className="font-medium hover:text-primary transition-colors">
                          {p.firstName} {p.lastName}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{p.jmbg}</TableCell>
                      <TableCell>{p.phone}</TableCell>
                      <TableCell>{formatDate(p.dateOfBirth)}</TableCell>
                      <TableCell>{p._count.appointments}</TableCell>
                      <TableCell>{p._count.records}</TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Link href={`/admin/patients/${p.id}`}>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Mobile cards */}
        <div className="block md:hidden space-y-3">
          {isPending ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">{search ? "Nema rezultata." : "Nema pacijenata."}</p>
            </div>
          ) : (
            patients.map((p) => (
              <Link key={p.id} href={`/admin/patients/${p.id}`}>
                <Card className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{p.firstName} {p.lastName}</p>
                        <p className="text-sm text-muted-foreground">{p.phone} · {formatDate(p.dateOfBirth)}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p._count.appointments} termin · {p._count.records} karton
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Stranica {page} od {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1 || isPending}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prethodna
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages || isPending}
                onClick={() => setPage((p) => p + 1)}
              >
                Sljedeća <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
