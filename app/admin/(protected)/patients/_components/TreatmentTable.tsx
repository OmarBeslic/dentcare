"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { EmptyState } from "@/app/admin/_components/EmptyState";
import { TreatmentForm } from "./TreatmentForm";
import { useToothRecords, useDeleteToothRecord, useToggleToothRecordPaid } from "@/hooks/useToothRecords";
import { useCanView } from "@/hooks/useCanView";
import { formatDate } from "@/lib/utils";
import { ClipboardList, Pencil, Trash2, X } from "lucide-react";
import type { ToothRecordDTO } from "@/types";

interface Props {
  patientId: string;
  clinicId: string;
  selectedTooth: number | null;
  onClearFilter: () => void;
}

export function TreatmentTable({ patientId, clinicId, selectedTooth, onClearFilter }: Props) {
  const [editing, setEditing] = useState<ToothRecordDTO | null>(null);
  const [deleting, setDeleting] = useState<ToothRecordDTO | null>(null);

  const { data: records = [], isPending, isError } = useToothRecords(patientId, selectedTooth);
  const deleteRecord = useDeleteToothRecord(patientId);
  const togglePaid = useToggleToothRecordPaid(patientId);

  const canViewFinancials = useCanView("financials");
  const canViewDiagnosis = useCanView("diagnosis");

  const colCount = 5 + (canViewDiagnosis ? 1 : 0) + (canViewFinancials ? 2 : 0);

  function handleDelete() {
    if (!deleting) return;
    deleteRecord.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
  }

  function formatPrice(price: ToothRecordDTO["price"]) {
    return `${Number(price ?? 0).toFixed(2)} €`;
  }

  function truncatedDiagnosis(diagnosis: string | null) {
    if (!diagnosis) return "—";
    return diagnosis.length > 30 ? `${diagnosis.slice(0, 30)}...` : diagnosis;
  }

  return (
    <div className="space-y-3">
      {selectedTooth !== null && (
        <div className="flex items-center justify-between rounded-lg bg-primary-light px-3 py-2">
          <p className="text-sm font-medium text-primary">Tretmani za zub {selectedTooth}</p>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-primary" onClick={onClearFilter}>
            <X className="w-3.5 h-3.5" /> Ukloni filter
          </Button>
        </div>
      )}

      {/* dsktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Zubi</TableHead>
              {canViewDiagnosis && <TableHead>Dijagnoza</TableHead>}
              <TableHead>Usluga</TableHead>
              <TableHead>Doktor</TableHead>
              {canViewFinancials && <TableHead>Cena</TableHead>}
              {canViewFinancials && <TableHead>Plaćeno</TableHead>}
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: colCount }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={colCount}>
                  <p className="text-sm text-destructive py-4 text-center">Greška pri učitavanju tretmana.</p>
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colCount}>
                  <EmptyState icon={ClipboardList} message="Nema zabeleženih tretmana." />
                </TableCell>
              </TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">{formatDate(r.visitDate)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {r.treatedTeeth.map((t) => (
                        <Badge key={t} variant="teal" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  {canViewDiagnosis && (
                    <TableCell className="max-w-45 truncate" title={r.diagnosis ?? ""}>
                      {truncatedDiagnosis(r.diagnosis)}
                    </TableCell>
                  )}
                  <TableCell>{r.serviceType}</TableCell>
                  <TableCell>{r.doctorSignature}</TableCell>
                  {canViewFinancials && <TableCell>{formatPrice(r.price)}</TableCell>}
                  {canViewFinancials && (
                    <TableCell>
                      <button onClick={() => togglePaid.mutate({ id: r.id, isPaid: !r.isPaid })}>
                        <Badge variant={r.isPaid ? "success" : "destructive"} className="cursor-pointer">
                          {r.isPaid ? "DA" : "NE"}
                        </Badge>
                      </button>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditing(r)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-50"
                        onClick={() => setDeleting(r)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* mobile cards */}
      <div className="block md:hidden space-y-3">
        {isPending ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)
        ) : isError ? (
          <p className="text-sm text-destructive py-4 text-center">Greška pri učitavanju tretmana.</p>
        ) : records.length === 0 ? (
          <EmptyState icon={ClipboardList} message="Nema zabeleženih tretmana." />
        ) : (
          records.map((r) => (
            <div key={r.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{formatDate(r.visitDate)}</p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setEditing(r)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={() => setDeleting(r)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {r.treatedTeeth.map((t) => (
                  <Badge key={t} variant="teal" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
              <p className="text-sm">{r.serviceType}</p>
              {canViewDiagnosis && r.diagnosis && (
                <p className="text-xs text-muted-foreground line-clamp-2">{r.diagnosis}</p>
              )}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{r.doctorSignature}</span>
                {canViewFinancials && (
                  <div className="flex items-center gap-2">
                    <span>{formatPrice(r.price)}</span>
                    <button onClick={() => togglePaid.mutate({ id: r.id, isPaid: !r.isPaid })}>
                      <Badge variant={r.isPaid ? "success" : "destructive"}>{r.isPaid ? "DA" : "NE"}</Badge>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <TreatmentForm
          patientId={patientId}
          clinicId={clinicId}
          record={editing}
          onSuccess={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title="Obriši tretman?"
        description="Ova akcija je nepovratna."
        confirmLabel="Obriši"
        onConfirm={handleDelete}
      />
    </div>
  );
}
