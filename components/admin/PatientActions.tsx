"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useUpdatePatient, useDeletePatient } from "@/hooks/usePatients";
import type { Patient } from "@/types";

interface Props {
  patient: Patient;
}

export function PatientActions({ patient }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [form, setForm] = useState({
    firstName: patient.firstName,
    lastName: patient.lastName,
    phone: patient.phone,
    jmbg: patient.jmbg,
    dateOfBirth: format(new Date(patient.dateOfBirth), "yyyy-MM-dd"),
    notes: patient.notes ?? "",
  });

  const update = useUpdatePatient(patient.id);
  const remove = useDeletePatient();

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    update.mutate(
      { ...form, dateOfBirth: new Date(form.dateOfBirth).toISOString() },
      {
        onSuccess: () => {
          setEditOpen(false);
          router.refresh();
        },
      }
    );
  }

  function handleDelete() {
    remove.mutate(patient.id, {
      onSuccess: () => router.push("/admin/patients"),
    });
  }

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="w-4 h-4" /> Uredi
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-destructive border-destructive/30 hover:bg-red-50 hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="w-4 h-4" /> Obriši
        </Button>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Uredi pacijenta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ime *</Label>
                <Input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Prezime *</Label>
                <Input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Datum rodjenja *</Label>
                <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>JMBG *</Label>
                <Input value={form.jmbg} onChange={(e) => setForm((f) => ({ ...f, jmbg: e.target.value }))} maxLength={13} required />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Telefon *</Label>
                <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Napomene</Label>
              <Textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Otkaži</Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Čuvanje...</> : "Sačuvaj"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Obriši pacijenta?"
        description={`Ova akcija je nepovratna. Svi termini i kartoni pacijenta ${patient.firstName} ${patient.lastName} će biti obrisani.`}
        confirmLabel="Obriši"
        onConfirm={handleDelete}
      />
    </>
  );
}
