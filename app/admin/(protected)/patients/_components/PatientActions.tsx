"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ConfirmDialog } from "@/app/admin/_components/ConfirmDialog";
import { useUpdatePatient, useDeletePatient } from "@/hooks/usePatients";
import type { Patient } from "@/types";
import z from "zod";
import { patientSchema } from "@/lib/validations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface Props {
  patient: Patient;
}
type FormValues = z.infer<typeof patientSchema>;

export function PatientActions({ patient }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone,
      jmbg: patient.jmbg,
      dateOfBirth: format(new Date(patient.dateOfBirth), "yyyy-MM-dd"),
      notes: patient.notes ?? "",
    },
  });

  const update = useUpdatePatient(patient.id);
  const remove = useDeletePatient();

  function handleEdit(values: FormValues) {
    update.mutate(
      { ...values, dateOfBirth: new Date(values.dateOfBirth).toISOString() },
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEdit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ime *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Marko" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prezime *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Markovic" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datum rodjenja *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jmbg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>JMBG *</FormLabel>
                      <FormControl>
                        <Input maxLength={13} {...field} placeholder="1234567890123" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Telefon *</FormLabel>
                      <FormControl>
                        <Input {...field}  placeholder="+382 123 456 789" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Napomene</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} placeholder="Napomene, alergije..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Otkaži</Button>
                <Button type="submit" disabled={update.isPending}>
                  {update.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Čuvanje...</> : "Sačuvaj"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
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
